import { NextRequest, NextResponse } from "next/server";
import { askBrainstorm, askHelp } from "@/lib/gemini";
import {
  BRAINSTORM_SYSTEM_PROMPT,
  HELP_SYSTEM_PROMPT,
} from "@/lib/prompts";
import { rateLimit } from "@/lib/rate-limit";
import type { TutorRequest } from "@/types";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { allowed, remaining } = rateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        },
      );
    }

    const body: TutorRequest = await request.json();
    const { mode, problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required." },
        { status: 400 },
      );
    }

    // Fetch problem description from Firestore
    const { db } = await import("@/lib/firebase");
    let problemDescription = "";
    try {
      const problemDoc = await getDoc(doc(db, "problems", problemId));
      if (problemDoc.exists()) {
        problemDescription = problemDoc.data().description ?? "";
      }
    } catch (firestoreError) {
      console.error("Error fetching problem:", firestoreError);
    }

    let guidance: string;

    if (mode === "brainstorm") {
      const { code: message, history } = body;
      guidance = await askBrainstorm(
        message,
        history,
        problemDescription,
        BRAINSTORM_SYSTEM_PROMPT,
      );
    } else {
      const { code, error, hintLevel, history, brainstormHistory } = body;
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

    return NextResponse.json(
      { guidance },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  } catch (err) {
    console.error("Tutor API error:", err);
    return NextResponse.json(
      { error: "Failed to generate guidance." },
      { status: 500 },
    );
  }
}
