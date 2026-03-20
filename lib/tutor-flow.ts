import { Node, Flow } from "pocketflow";
import { ChatMessage, TutorRequest } from "@/types";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { askBrainstorm, askHelp } from "@/lib/gemini";
import { BRAINSTORM_SYSTEM_PROMPT, HELP_SYSTEM_PROMPT } from "@/lib/prompts";

export interface TutorStore {
  requestBody: TutorRequest;
  messages: ChatMessage[];
  ragContext?: {
    problemDescription: string;
  };
}

type ChatNodePrepRes = {
  hasContext: boolean;
  hasAssistantResponse: boolean;
};

export class ChatNodeClass extends Node<TutorStore, ChatNodePrepRes> {
  async prep(store: TutorStore): Promise<ChatNodePrepRes> {
    return {
      hasContext: !!store.ragContext,
      hasAssistantResponse:
        store.messages.length > 0 &&
        store.messages[store.messages.length - 1].role === "assistant" &&
        store.messages.length > store.requestBody.history.length,
    };
  }

  async exec({ hasContext, hasAssistantResponse }: ChatNodePrepRes) {
    if (!hasContext) return "fetch_context";
    if (!hasAssistantResponse) return "generate";
    return "done";
  }

  async post(store: TutorStore, prepRes: ChatNodePrepRes, execRes: string) {
    return execRes;
  }
}

type FetchContextNodePrepRes = {
  problemId: string;
  userMessage: ChatMessage;
  userId: string;
};

type FetchContextNodeExecRes = {
  problemDescription: string;
  userMessage: ChatMessage;
};

export class FetchContextNodeClass extends Node<
  TutorStore,
  FetchContextNodePrepRes
> {
  async prep(store: TutorStore): Promise<FetchContextNodePrepRes> {
    const { problemId, mode, code, error, hintLevel, userId } =
      store.requestBody;
    let content = code;
    if (mode === "help") {
      content = `Code:\n${code}\nError:\n${error}\nHint Level: ${hintLevel}`;
    }
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    return { problemId, userMessage, userId };
  }

  async exec({
    problemId,
    userMessage,
    userId,
  }: FetchContextNodePrepRes): Promise<FetchContextNodeExecRes> {
    let problemDescription = "";
    try {
      const problemDoc = await getDoc(doc(db, "problems", problemId));
      if (problemDoc.exists()) {
        problemDescription = problemDoc.data().description ?? "";
      }

      const sessionRef = doc(db, "user_sessions", `${userId}_${problemId}`);
      await setDoc(
        sessionRef,
        {
          userId,
          problemId,
          updatedAt: Date.now(),
          messages: arrayUnion(userMessage),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Error fetching context or saving user message:", err);
    }
    return { problemDescription, userMessage };
  }

  async post(
    store: TutorStore,
    prepRes: FetchContextNodePrepRes,
    execRes: FetchContextNodeExecRes,
  ) {
    store.messages.push(execRes.userMessage);
    store.ragContext = { problemDescription: execRes.problemDescription };
    return "continue";
  }
}

type LLMProcessNodePrepRes = {
  body: TutorRequest;
  ragContext: TutorStore["ragContext"];
};

type LLMProcessNodeExecRes = {
  guidance: string;
};

export class LLMProcessNodeClass extends Node<
  TutorStore,
  LLMProcessNodePrepRes
> {
  async prep(store: TutorStore): Promise<LLMProcessNodePrepRes> {
    return {
      body: store.requestBody,
      ragContext: store.ragContext,
    };
  }

  async exec({
    body,
    ragContext,
  }: LLMProcessNodePrepRes): Promise<LLMProcessNodeExecRes> {
    const { mode, code, error, hintLevel, history, brainstormHistory } = body;
    const problemDescription = ragContext?.problemDescription || "";
    let guidance: string;

    if (mode === "brainstorm") {
      guidance = await askBrainstorm(
        code,
        history,
        problemDescription,
        BRAINSTORM_SYSTEM_PROMPT,
      );
    } else {
      guidance = await askHelp(
        code,
        error,
        hintLevel,
        history,
        brainstormHistory ?? [],
        problemDescription,
        HELP_SYSTEM_PROMPT,
      );
    }
    return { guidance };
  }

  async post(
    store: TutorStore,
    prepRes: LLMProcessNodePrepRes,
    execRes: LLMProcessNodeExecRes,
  ) {
    const aiMessage: ChatMessage = {
      role: "assistant",
      content: execRes.guidance,
      timestamp: Date.now(),
    };
    store.messages.push(aiMessage);

    try {
      const { userId, problemId } = store.requestBody;
      const sessionRef = doc(db, "user_sessions", `${userId}_${problemId}`);
      await setDoc(
        sessionRef,
        {
          updatedAt: Date.now(),
          messages: arrayUnion(aiMessage),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Error saving AI message:", err);
    }

    return "continue";
  }
}

const chatNode = new ChatNodeClass();
const fetchContextNode = new FetchContextNodeClass();
const llmProcessNode = new LLMProcessNodeClass();

chatNode.on("fetch_context", fetchContextNode);
chatNode.on("generate", llmProcessNode);

fetchContextNode.on("continue", chatNode);
llmProcessNode.on("continue", chatNode);

export const tutorFlow = new Flow<TutorStore>(chatNode);
