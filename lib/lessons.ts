import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { Problem } from "@/types";

export const seedProblems: Omit<Problem, "createdBy" | "createdAt">[] = [
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    description: `Write a function \`fizzBuzz(n)\` that returns an array of strings from 1 to n where:
- Multiples of 3 are replaced with "Fizz"
- Multiples of 5 are replaced with "Buzz"
- Multiples of both 3 and 5 are replaced with "FizzBuzz"
- All other numbers are converted to strings`,
    starterCode: `function fizzBuzz(n) {\n  // Your code here\n}`,
    testCases: [
      { input: "5", expectedOutput: '["1","2","Fizz","4","Buzz"]' },
      {
        input: "15",
        expectedOutput:
          '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      },
      { input: "1", expectedOutput: '["1"]' },
    ],
    difficulty: "easy",
    language: "javascript",
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    description: `Write a function \`reverseString(str)\` that takes a string and returns the string reversed.

Do not use the built-in \`.reverse()\` method.`,
    starterCode: `function reverseString(str) {\n  // Your code here\n}`,
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"world"', expectedOutput: '"dlrow"' },
      { input: '""', expectedOutput: '""' },
    ],
    difficulty: "easy",
    language: "javascript",
  },
  {
    id: "two-sum",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Write a function \`twoSum(nums, target)\` that returns an array of two indices.`,
    starterCode: `function twoSum(nums, target) {\n  // Your code here\n}`,
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" },
    ],
    difficulty: "medium",
    language: "javascript",
  },
];

export async function getProblem(id: string): Promise<Problem | null> {
  // Dynamic import to avoid importing client-side firebase on the server
  const { db } = await import("@/lib/firebase");
  try {
    const docRef = doc(db, "problems", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Problem;
  } catch (error) {
    console.error("Error fetching problem:", error);
    return null;
  }
}

export async function getAllProblems(): Promise<Problem[]> {
  const { db } = await import("@/lib/firebase");
  try {
    const querySnapshot = await getDocs(collection(db, "problems"));
    return querySnapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Problem,
    );
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}
