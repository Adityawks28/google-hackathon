import { Node, Flow } from "pocketflow";
import { ChatMessage, TutorRequest } from "@/types";
import { askBrainstorm, askHelp } from "@/lib/gemini";
import { sessionModel, problemModel } from "@/lib/db";

export interface TutorStore {
  requestBody: TutorRequest;
  messages: ChatMessage[];
  ragContext?: {
    problemDescription: string;
    referenceSolution: string | null;
    hints: string[] | null;
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
  sessionId: string;
  mode: "brainstorm" | "help";
};

type FetchContextNodeExecRes = {
  problemDescription: string;
  referenceSolution: string | null;
  hints: string[] | null;
  userMessage: ChatMessage;
};

export class FetchContextNodeClass extends Node<
  TutorStore,
  FetchContextNodePrepRes
> {
  async prep(store: TutorStore): Promise<FetchContextNodePrepRes> {
    const { problemId, mode, code, error, hintLevel, sessionId, message } =
      store.requestBody;
    const userMessage: ChatMessage = {
      role: "user",
      content: message || code,
      code: mode === "help" ? code : null,
      error: mode === "help" ? error || null : null,
      hintLevel: mode === "help" ? hintLevel : null,
      timestamp: Date.now(),
    };
    return { problemId, userMessage, sessionId, mode };
  }

  async exec({
    problemId,
    userMessage,
    sessionId,
    mode,
  }: FetchContextNodePrepRes): Promise<FetchContextNodeExecRes> {
    let problemDescription = "";
    let referenceSolution: string | null = null;
    let hints: string[] | null = null;
    try {
      const problem = await problemModel.getById(problemId);
      if (problem) {
        problemDescription = problem.description ?? "";
        referenceSolution = problem.referenceSolution ?? null;
        hints = problem.hints ?? null;
      }

      await sessionModel.addMessage(sessionId, mode, userMessage);
      await sessionModel.setPhase(sessionId, mode);
    } catch (err) {
      console.error("Error fetching context or saving user message:", err);
    }
    return { problemDescription, referenceSolution, hints, userMessage };
  }

  async post(
    store: TutorStore,
    prepRes: FetchContextNodePrepRes,
    execRes: FetchContextNodeExecRes,
  ) {
    store.messages.push(execRes.userMessage);
    store.ragContext = {
      problemDescription: execRes.problemDescription,
      referenceSolution: execRes.referenceSolution,
      hints: execRes.hints,
    };
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
    const {
      mode,
      code,
      error,
      hintLevel,
      history,
      brainstormHistory,
      message,
    } = body;
    const problemDescription = ragContext?.problemDescription || "";
    const referenceSolution = ragContext?.referenceSolution || null;
    const hints = ragContext?.hints || null;
    let guidance: string;

    if (mode === "brainstorm") {
      guidance = await askBrainstorm(
        message || code,
        history,
        problemDescription,
      );
    } else {
      guidance = await askHelp(
        code,
        error,
        hintLevel,
        history,
        brainstormHistory ?? [],
        problemDescription,
        referenceSolution,
        hints,
        message,
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
      code: null,
      error: null,
      hintLevel: null,
    };
    store.messages.push(aiMessage);

    try {
      const { sessionId, mode } = store.requestBody;
      await sessionModel.addMessage(sessionId, mode, aiMessage);
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
