import SYSTEM_MESSAGE from "@/constants/systemMessage";
import { AIMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";

// Create a trimmer to trim the messages
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Connect to WxFlows
const toolClient = new wxflows({ endpoint: process.env.WXFLOWS_ENDPOINT || "", apikey: process.env.WXFLOWS_APIKEY });

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

if (!process.env.GROQ_MODEL) {
  throw new Error("GROQ_MODEL is not defined in the environment variables");
}

const initialiserModel = () => {
  const model = new ChatGroq({
    model: process.env.GROQ_MODEL as string,
    apiKey: process.env.GROQ_API_KEY as string,
    temperature: 0.5,
    maxTokens: 3000,
    streaming: true, // Enable streaming for SSE
    callbacks: [
      {
        handleLLMStart: async () => {
          console.log("LLM started");
        },
        handleLLMEnd: async (output) => {
          console.log("LLM ended", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            console.log("LLM usage", usage);
          }
        },
      },
    ],
  }).bindTools(tools);
  return model;
};

// define the function to determine if the conversation should continue
const shouldContinue = async (state: typeof MessagesAnnotation.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  // if the LLM makes a tool call, then we route to the tool node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }
  return END;
};

const createWorkflow = () => {
  const model = initialiserModel();

  const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system and message placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" }, // set a cache breakpoint ( max number a breakpoint )
        }),
        new MessagesPlaceholder("messages"),
      ]);

      // Trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);
      // Format the prompt with the current messages
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
      const response = await model.invoke(prompt);
      return { messages: [response] };
    })
    .addEdge(START, "agent")
    .addNode("tool", toolNode)
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tool", "agent");

  return stateGraph;
};
