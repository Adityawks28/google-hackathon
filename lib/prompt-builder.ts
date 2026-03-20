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
