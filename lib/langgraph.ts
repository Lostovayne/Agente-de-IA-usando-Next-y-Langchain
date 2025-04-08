import SYSTEM_MESSAGE from "@/constants/systemMessage";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
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

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  // Rules of caching headers for turn-by-turn conversations
  // 1. Cache the first SYSTEM message
  // 2. Cache the LAST message
  // 3. Cache the second to last HUMAN message

  if (!messages.length) {
    return messages;
  }

  const cachedMessages = [...messages];
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: {
          type: "ephemeral", // set a cache breakpoint ( max number a breakpoint )
        },
      },
    ];
  };

  addCache(cachedMessages.at(-1)!);

  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        addCache(cachedMessages[i]);
        break;
      }
    }
  }

  return cachedMessages;
}

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  // Add Caching
  const cachedMessages = addCachingHeaders(messages);

  console.log("Messages: ", cachedMessages);
  // Create a checkpoint for the workflow
  const workflow = createWorkflow();
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  // Run the graph and stream
  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: "v2",
      configurable: {
        threadId: chatId,
      },
      streamMode: "messages",
      runId: chatId,
    }
  );
  return stream;
}
