import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import SYSTEM_MESSAGE from "@/constants/systemMessage";

// Trim the messages to manage conversation history
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Connect to wxflows
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
});

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

// Connect to the LLM provider with better tool instructions
const initialiseModel = () => {
  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    // anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    callbacks: [
      {
        handleLLMStart: async () => {
          // console.log("🤖 Starting LLM call");
        },
        handleLLMEnd: async (output) => {
          console.log("🤖 End LLM call", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            // console.log("📊 Token Usage:", {
            //   input_tokens: usage.input_tokens,
            //   output_tokens: usage.output_tokens,
            //   total_tokens: usage.input_tokens + usage.output_tokens,
            //   cache_creation_input_tokens:
            //     usage.cache_creation_input_tokens || 0,
            //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            // });
          }
        },
        // handleLLMNewToken: async (token: string) => {
        //   // console.log("🔤 New token:", token);
        // },
      },
    ],
  }).bindTools(tools);

  return model;
};

// Define the function that determines whether to continue or not
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  // If the last message is a tool message, route back to agent
  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }

  // Otherwise, we stop (reply to the user)
  return END;
}

// Define a new graph
const createWorkflow = () => {
  const model = initialiseModel();

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      // Create the system message content
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system message and messages placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      // Trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);

      // Format the prompt with the current messages
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

      console.log("🤖 Prompt:", prompt);

      // Asegurarse de que el contenido de los mensajes sea una cadena
      prompt.lc_kwargs.messages = prompt.lc_kwargs.messages.map((message: { content: any }) => {
        if (Array.isArray(message.content)) {
          // Si el contenido es un array, extraer el texto y unirlo en una cadena
          message.content = message.content.map((item: { text: string }) => item.text).join(" ");
        } else if (typeof message.content !== "string") {
          // Si el contenido no es una cadena, convertirlo a JSON
          message.content = JSON.stringify(message.content);
        }
        return message;
      });

      console.log("Mensajes procesados:", prompt.lc_kwargs.messages);

      // Validar el contenido del prompt antes de enviarlo al modelo
      console.log("📋 Validando prompt antes de invocar el modelo:", JSON.stringify(prompt, null, 2));

      // Obtener la respuesta del modelo
      try {
        const response = await model.invoke(prompt);
        // Asegurarse de que el contenido de la respuesta sea una cadena
        if (response.content && typeof response.content !== "string") {
          response.content = JSON.stringify(response.content);
        }

        // Registrar detalles de la respuesta del modelo
        console.log("Detalles de la respuesta del modelo:", JSON.stringify(response, null, 2));

        // Validar que el contenido de la respuesta no esté vacío
        if (!response.content || response.content.trim() === "") {
          console.warn("La respuesta del modelo está vacía o no es válida:", response);
          response.content = "Lo siento, no pude generar una respuesta válida.";
        }

        // Manejar errores o respuestas vacías de herramientas
        if (response.content === "" && Array.isArray(response.tool_calls) && response.tool_calls.length > 0) {
          response.content = "Lo siento, hubo un problema al procesar la herramienta utilizada.";
        }

        // Validar y corregir argumentos de herramientas antes de usarlas
        if (response.tool_calls && Array.isArray(response.tool_calls)) {
          response.tool_calls = response.tool_calls.map((toolCall) => {
            if (toolCall.args && typeof toolCall.args === "string") {
              try {
                // Intentar parsear los argumentos como JSON
                toolCall.args = JSON.parse(toolCall.args);
              } catch (e) {
                console.error("Error al parsear argumentos de herramienta:", toolCall.args);
                toolCall.args = { error: "Invalid JSON format" };
              }
            }
            return toolCall;
          });
        }

        return { messages: [response] };
      } catch (error) {
        console.error("Error al invocar el modelo:", error);
        console.error("Detalles del error:", JSON.stringify(error, null, 2));
        // Manejar el caso de límite de tokens alcanzado
        if (
          typeof error === "object" &&
          error !== null &&
          'status' in error &&
          error.status === 429 &&
          'error' in error &&
          typeof error.error === "object" &&
          error.error !== null &&
          'code' in error.error &&
          error.error.code === "rate_limit_exceeded"
        ) {
          console.error("El modelo alcanzó el límite de tokens diarios. Intenta nuevamente más tarde.");
          return { messages: [{ content: "Lo siento, el modelo ha alcanzado su límite de uso diario. Por favor, intenta más tarde." }] };
        }
        throw new Error("Error al procesar el prompt. Verifica el contenido de los mensajes.");
      }
    })
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");
};

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  if (!messages.length) return messages;

  // Create a copy of messages to avoid mutating the original
  const cachedMessages = [...messages];

  // Helper to add cache control
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: { type: "ephemeral" },
      },
    ];
  };

  // Cache the last message
  // console.log("🤑🤑🤑 Caching last message");
  addCache(cachedMessages.at(-1)!);

  // Find and cache the second-to-last human message
  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        // console.log("🤑🤑🤑 Caching second-to-last human message");
        addCache(cachedMessages[i]);
        break;
      }
    }
  }

  return cachedMessages;
}

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  // Add caching headers to messages
  const cachedMessages = addCachingHeaders(messages);
  // console.log("🔒🔒🔒 Messages:", cachedMessages);

  // Create workflow with chatId and onToken callback
  const workflow = createWorkflow();

  // Create a checkpoint to save the state of the conversation
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: "v2",
      configurable: { thread_id: chatId },
      streamMode: "messages",
      runId: chatId,
    }
  );
  return stream;
}
