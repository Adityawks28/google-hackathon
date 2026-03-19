import { NextRequest, NextResponse } from "next/server";
import { evaluateCode } from "@/lib/gemini";
import { EVALUATOR_PROMPT } from "@/lib/prompts";
import { rateLimit } from "@/lib/rate-limit";
import { problemModel } from "@/lib/db";
import type { EvaluateRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { allowed } = rateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    const body: EvaluateRequest = await request.json();
    const { code, problemId } = body;

    if (!code || !problemId) {
      return NextResponse.json(
        { error: "Code and problemId are required." },
        { status: 400 },
      );
    }

    const problem = await problemModel.getById(problemId);

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found." },
        { status: 404 },
      );
    }

    const result = await evaluateCode(
      code,
      problem.description,
      problem.testCases,
      EVALUATOR_PROMPT,
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Evaluate API error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate code." },
      { status: 500 },
    );
  }
}
