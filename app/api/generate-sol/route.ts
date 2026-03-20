import { NextRequest, NextResponse } from "next/server";
import { generateSolution } from "@/lib/gemini";
import { SOLUTION_GENERATOR_PROMPT } from "@/lib/prompts";
import { userModel, problemModel } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body: { problemId: string } = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required." },
        { status: 400 },
      );
    }

    // Verify admin via Authorization header (uid)
    const uid = request.headers.get("x-user-uid");
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Check admin role
    const user = await userModel.getById(uid);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }

    const problem = await problemModel.getById(problemId);

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found." },
        { status: 404 },
      );
    }

    const solution = await generateSolution({
      problemDescription: problem.description,
      language: problem.language,
      systemPrompt: SOLUTION_GENERATOR_PROMPT,
    });

    await problemModel.update(problemId, {
      referenceSolution: solution,
    });

    return NextResponse.json({ solution });
  } catch (err) {
    console.error("Generate solution API error:", err);
    return NextResponse.json(
      { error: "Failed to generate solution." },
      { status: 500 },
    );
  }
}
