import { NextRequest, NextResponse } from "next/server";
import { generateSolution } from "@/lib/gemini";
import { SOLUTION_GENERATOR_PROMPT } from "@/lib/prompts";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body: { problemId: string } = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required." },
        { status: 400 }
      );
    }

    // Verify admin via Authorization header (uid)
    const uid = request.headers.get("x-user-uid");
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { db } = await import("@/lib/firebase");

    // Check admin role
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const problemRef = doc(db, "problems", problemId);
    const problemDoc = await getDoc(problemRef);

    if (!problemDoc.exists()) {
      return NextResponse.json(
        { error: "Problem not found." },
        { status: 404 }
      );
    }

    const problem = problemDoc.data();
    const solution = await generateSolution(
      problem.description,
      problem.language,
      SOLUTION_GENERATOR_PROMPT
    );

    await updateDoc(problemRef, { referenceSolution: solution });

    return NextResponse.json({ solution });
  } catch (err) {
    console.error("Generate solution API error:", err);
    return NextResponse.json(
      { error: "Failed to generate solution." },
      { status: 500 }
    );
  }
}
