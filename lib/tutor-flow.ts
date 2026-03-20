import { Node, Flow } from "pocketflow";
import { ChatMessage, TutorRequest } from "@/types";
import { VerifySolutionOutput } from "@/types/ai";
import {
  askBrainstorm,
  askHelp,
  verifySolution,
  askAssessment,
} from "@/lib/gemini";
import { sessionModel, problemModel, progressModel } from "@/lib/db";

export interface TutorStore {
  requestBody: TutorRequest;
  messages: ChatMessage[];
  ragContext?: {
    problemDescription: string;
    referenceSolution: string | null;
    hints: string[] | null;
    starterCode: string;
  };
  verificationResult?: VerifySolutionOutput;
  isCorrect?: boolean;
}

type ChatNodePrepRes = {
  hasContext: boolean;
  hasAssistantResponse: boolean;
  isSubmission: boolean;
};

export class ChatNodeClass extends Node<TutorStore, ChatNodePrepRes> {
  async prep(store: TutorStore): Promise<ChatNodePrepRes> {
    const userMessages = store.messages.filter((m) => m.role === "user");
    const lastUserMsg =
      userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    return {
      hasContext: !!store.ragContext,
      hasAssistantResponse:
        store.messages.length > 0 &&
        store.messages[store.messages.length - 1].role === "assistant" &&
        store.messages.length > store.requestBody.history.length,
      isSubmission: lastUserMsg?.content === "Submission",
    };
  }

  async exec({
    hasContext,
    hasAssistantResponse,
    isSubmission,
  }: ChatNodePrepRes) {
    if (!hasContext) return "fetch_context";
    if (!hasAssistantResponse) {
      return isSubmission ? "verify" : "generate";
    }
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
  starterCode: string;
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
    let starterCode = "";
    try {
      const problem = await problemModel.getById(problemId);
      if (problem) {
        problemDescription = problem.description ?? "";
        referenceSolution = problem.referenceSolution ?? null;
        hints = problem.hints ?? null;
        starterCode = problem.starterCode ?? "";
      }

      await sessionModel.addMessage(sessionId, mode, userMessage);
      await sessionModel.setPhase(sessionId, mode);
    } catch (err) {
      console.error("Error fetching context or saving user message:", err);
    }
    return {
      problemDescription,
      referenceSolution,
      hints,
      starterCode,
      userMessage,
    };
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
      starterCode: execRes.starterCode,
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
    const starterCode = ragContext?.starterCode || "";
    let guidance: string;

    if (mode === "brainstorm") {
      guidance = await askBrainstorm({
        message: message || code,
        history,
        problemDescription,
        starterCode,
      });
    } else {
      guidance = await askHelp({
        code,
        error,
        hintLevel,
        history,
        brainstormHistory: brainstormHistory ?? [],
        problemDescription,
        referenceSolution,
        hints,
        starterCode,
        message,
      });
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

type VerifyNodePrepRes = {
  code: string;
  problemDescription: string;
  referenceSolution: string | null;
  starterCode: string;
};

type VerifyNodeExecRes = {
  verificationResult: VerifySolutionOutput;
};

export class VerifyNodeClass extends Node<TutorStore, VerifyNodePrepRes> {
  async prep(store: TutorStore): Promise<VerifyNodePrepRes> {
    return {
      code: store.requestBody.code,
      problemDescription: store.ragContext?.problemDescription || "",
      referenceSolution: store.ragContext?.referenceSolution || null,
      starterCode: store.ragContext?.starterCode || "",
    };
  }

  async exec({
    code,
    problemDescription,
    referenceSolution,
    starterCode,
  }: VerifyNodePrepRes): Promise<VerifyNodeExecRes> {
    const verificationResult = await verifySolution({
      code,
      problemDescription,
      referenceSolution,
      starterCode,
    });

    return { verificationResult };
  }

  async post(
    store: TutorStore,
    prepRes: VerifyNodePrepRes,
    execRes: VerifyNodeExecRes,
  ) {
    store.verificationResult = execRes.verificationResult;
    store.isCorrect = execRes.verificationResult.is_correct;
    return "assessment";
  }
}

type AssessmentNodePrepRes = {
  verificationResult: VerifySolutionOutput;
  body: TutorRequest;
  ragContext: TutorStore["ragContext"];
  userId: string;
  problemId: string;
};

type AssessmentNodeExecRes = {
  guidance: string;
};

export class AssessmentNodeClass extends Node<
  TutorStore,
  AssessmentNodePrepRes
> {
  async prep(store: TutorStore): Promise<AssessmentNodePrepRes> {
    if (!store.verificationResult) {
      throw new Error("Verification result missing in store");
    }
    return {
      verificationResult: store.verificationResult,
      body: store.requestBody,
      ragContext: store.ragContext,
      userId: store.requestBody.userId,
      problemId: store.requestBody.problemId,
    };
  }

  async exec({
    verificationResult,
    body,
    ragContext,
  }: AssessmentNodePrepRes): Promise<AssessmentNodeExecRes> {
    const { code, error, hintLevel, history, brainstormHistory, message } =
      body;
    const problemDescription = ragContext?.problemDescription || "";
    const referenceSolution = ragContext?.referenceSolution || null;
    const hints = ragContext?.hints || null;
    const starterCode = ragContext?.starterCode || "";

    const guidance = await askAssessment({
      code,
      error,
      hintLevel,
      history,
      brainstormHistory: brainstormHistory ?? [],
      problemDescription,
      referenceSolution,
      hints,
      starterCode,
      message,
      verificationResult,
    });

    return { guidance };
  }

  async post(
    store: TutorStore,
    prepRes: AssessmentNodePrepRes,
    execRes: AssessmentNodeExecRes,
  ) {
    const aiMessage: ChatMessage = {
      role: "assistant",
      content: execRes.guidance,
      timestamp: Date.now(),
      code: null,
      error: null,
      hintLevel: null,
      isCorrect: prepRes.verificationResult.is_correct,
    };
    store.messages.push(aiMessage);

    try {
      const { sessionId, mode } = store.requestBody;
      await sessionModel.addMessage(sessionId, mode, aiMessage);

      if (prepRes.verificationResult.is_correct) {
        await progressModel.markSolved(prepRes.userId, prepRes.problemId);
      } else {
        await progressModel.upsert(`${prepRes.userId}_${prepRes.problemId}`, {
          userId: prepRes.userId,
          problemId: prepRes.problemId,
          attempted: true,
          lastAttemptAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Error saving assessment message or progress:", err);
    }

    return "continue";
  }
}

const chatNode = new ChatNodeClass();
const fetchContextNode = new FetchContextNodeClass();
const llmProcessNode = new LLMProcessNodeClass();
const verifyNode = new VerifyNodeClass();
const assessmentNode = new AssessmentNodeClass();

chatNode.on("fetch_context", fetchContextNode);
chatNode.on("generate", llmProcessNode);
chatNode.on("verify", verifyNode);

fetchContextNode.on("continue", chatNode);
llmProcessNode.on("continue", chatNode);

verifyNode.on("assessment", assessmentNode);
assessmentNode.on("continue", chatNode);

export const tutorFlow = new Flow<TutorStore>(chatNode);
