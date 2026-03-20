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
    referenceSolution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i.toString());
    }
  }
  return result;
}`,
    hints: [
      "Use a loop to iterate from 1 to n.",
      "Check for the multiples of both 3 and 5 first (i.e., multiples of 15), as this condition needs to be evaluated before checking for just 3 or just 5.",
      "Remember to convert numbers to strings before pushing them to the result array.",
    ],
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
    referenceSolution: `function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    hints: [
      "You can iterate over the string backwards.",
      "Start a loop at the last character's index (str.length - 1) and decrement until you reach 0.",
      "Create an empty string and append each character from the backward loop to it.",
    ],
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
    referenceSolution: `function twoSum(nums, target) {
  const numMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }
    numMap.set(nums[i], i);
  }
  return []; // Should not happen given problem constraints
}`,
    hints: [
      "A brute force approach uses nested loops to check every pair, but there's a more efficient way.",
      "Consider using a Map or object to store the numbers you've seen so far and their indices.",
      "As you iterate through the array, calculate the 'complement' (target - current number). If the complement is in your Map, you've found the two indices!",
    ],
  },
];
