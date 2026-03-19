import { NextRequest, NextResponse } from "next/server";
import { askTutor } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";
import { problemModel } from "@/lib/db";
import type { TutorRequest } from "@/types";

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
    const { code, error, hintLevel, history, problemId } = body;

    if (!code && !error) {
      return NextResponse.json(
        { error: "Code or error message is required." },
        { status: 400 },
      );
    }

    // Fetch problem description from Firestore
    let problemDescription = "";
    try {
      const problem = await problemModel.getById(problemId);
      if (problem) {
        problemDescription = problem.description ?? "";
      }
    } catch (firestoreError) {
      console.error("Error fetching problem:", firestoreError);
    }

    const guidance = await askTutor(
      code,
      error,
      hintLevel,
      history,
      problemDescription,
    );

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
