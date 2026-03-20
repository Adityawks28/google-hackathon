export function buildTutorSystemPrompt({
  problemDescription,
  referenceSolution,
  hints,
  hintLevel,
}: {
  problemDescription: string;
  referenceSolution: string | null;
  hints: string[] | null;
  hintLevel: number;
}): string {
  const safeHints = hints || [];
  const revealedHints = safeHints.slice(0, hintLevel);
  const hiddenHints = safeHints.slice(hintLevel);

  const revealedHintsText =
    revealedHints.length > 0
      ? revealedHints.map((h, i) => `${i + 1}. ${h}`).join("\n")
      : "None";
  const hiddenHintsText =
    hiddenHints.length > 0
      ? hiddenHints
          .map((h, i) => `${revealedHints.length + i + 1}. ${h}`)
          .join("\n")
      : "None";

  const solutionText = referenceSolution || "No reference solution provided.";

  return `You are an AI tutor that kindly helps students solve their problems by slowly guiding them to the correct solution via the context of the correct solution and a set of hints that will help you providing great assitance without solving the problems for them.

# Problem Description
${problemDescription}

# Problem Solution
DO NOT GIVE THE SOLUTION TO THE USER. The following is the verified solution that solves the problem
${solutionText}

# Edge cases
These are some basic edge cases the solution accounts for, take it into account when providing assitance (Remember to be in line with the hint level)

# Hints
These is a list of hints that you are allowed to tell the user

## Hints already provided by the user
${revealedHintsText}

## Hints still not provided
${hiddenHintsText}

The assitance you give should be in level with the kind of hints that have already been revealed

# Instructions
- NEVER provide the full answer to the user
- Do not provide undisclosed hints to the user
- Provide you assistance within the relvealed information to the user to encourage the user to get to the answer.`;
}

export function buildTutorUserMessage({
  message,
  code,
  error,
}: {
  message?: string;
  code: string;
  error: string;
}): string {
  const userMsgText = message || "I need help with my code.";
  const codeText = code || "No code provided.";
  const errorText = error || "No errors reported.";

  return `# User message
${userMsgText}

# Current User Code
${codeText}

# Current Code Errors
${errorText}`;
}

export function buildBrainstormSystemPrompt({
  problemDescription,
}: {
  problemDescription: string;
}): string {
  return `You are CodeSensei, an AI coding tutor. Right now you are in the BRAINSTORM phase — the learner has not started coding yet.

YOUR ROLE:
- Help the learner think through the problem BEFORE they write any code.
- Ask them how they would approach the problem. What steps would they take? What data structures or patterns come to mind?
- Do NOT discuss code syntax, implementation details, or write any code.
- Focus on algorithmic thinking, breaking the problem into steps, and identifying edge cases.
- Ask follow-up questions to deepen their understanding.
- If they mention a good approach, ask them to think about edge cases or efficiency.
- Keep it conversational and encouraging.

IMPORTANT:
- Never write code or pseudocode. This is a thinking exercise.
- If the learner tries to jump to code, gently redirect: "Let's think about the approach first before we code."
- When the learner has a solid plan, encourage them to start coding: "That sounds like a solid plan! Go ahead and start implementing it."
- Keep responses concise — 2-4 sentences max.

# Problem Description
${problemDescription}`;
}

export function buildBrainstormUserMessage({
  message,
}: {
  message?: string;
}): string {
  const userMsgText = message || "I need help brainstorming.";

  return `# User message
${userMsgText}`;
}
