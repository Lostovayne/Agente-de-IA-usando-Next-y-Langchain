import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import SYSTEM_MESSAGE from "@/constants/systemMessage";

//Customers at : https://introspection.apis.stepzen.com/customers
// Comments at: https://dummyjson.com/comments  a wxflows import curl + url

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

const createWorkflow = () => {
  const model = initialiserModel();
  const stateGraph = new StateGraph(MessagesAnnotation).addNode("agent", async (state) => {
    const systemContent = SYSTEM_MESSAGE;
  });
};
