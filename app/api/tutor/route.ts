import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import type { TutorRequest } from "@/types";
import { tutorFlow, TutorStore } from "@/lib/tutor-flow";

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
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required." },
        { status: 400 },
      );
    }

    if (!body.userId) {
      body.userId = ip.replace(/[^a-zA-Z0-9]/g, "_");
    }

    const store: TutorStore = {
      requestBody: body,
      messages: [...body.history],
    };

    await tutorFlow.run(store);

    const guidance =
      store.messages.length > body.history.length
        ? store.messages[store.messages.length - 1].content
        : "I'm having trouble responding right now.";

    return NextResponse.json(
      { guidance, isCorrect: store.isCorrect },
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
