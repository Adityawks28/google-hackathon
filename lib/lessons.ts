import type { Problem, MiniLessonConcept } from "@/types";

// ── Mini Lessons ────────────────────────────────────────────
// Each problem gets bite-sized concept cards that teach ONLY
// the syntax/concepts needed for that specific problem.
// Each card has an optional "Break down the symbols" section
// for users who've never seen code before.

const fizzBuzzLesson: MiniLessonConcept[] = [
  {
    title: "What is a variable?",
    explanation:
      "A variable is like a labeled box where you store something. You give it a name, put a value inside, and use that name later to get the value back.",
    codeExample: `let age = 25;
const name = "Ali";`,
    symbolBreakdown: [
      {
        symbol: "let",
        meaning: '"I\'m creating a box that I might change later"',
      },
      {
        symbol: "const",
        meaning: '"I\'m creating a box that stays the same forever"',
      },
      {
        symbol: "age",
        meaning: "the name YOU choose for the box (could be anything)",
      },
      {
        symbol: "=",
        meaning: '"put this value inside the box" (NOT "equals"!)',
      },
      { symbol: "25", meaning: "the value you're storing" },
      {
        symbol: ";",
        meaning: "end of this instruction (like a period in a sentence)",
      },
    ],
  },
  {
    title: "What is an array?",
    explanation:
      "An array is a list — like a shopping list. It holds multiple items in order. Each item has a position number starting from 0 (not 1!). You can add items to it with .push().",
    codeExample: `const fruits = ["apple", "banana"];
fruits.push("mango");
// fruits is now ["apple", "banana", "mango"]`,
    symbolBreakdown: [
      { symbol: "[ ]", meaning: "square brackets create a list (array)" },
      { symbol: ",", meaning: "separates items in the list" },
      { symbol: '"apple"', meaning: "text must be wrapped in quotes" },
      { symbol: ".push()", meaning: '"add this item to the end of the list"' },
      {
        symbol: "fruits[0]",
        meaning: "get the FIRST item (positions start at 0!)",
      },
    ],
  },
  {
    title: "What is a for loop?",
    explanation:
      'A loop repeats an action. Think of it like: "Count from 1 to 100, and for each number, do something." It has 3 parts: where to start, when to stop, and how to count.',
    codeExample: `for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// Prints: 1, 2, 3, 4, 5`,
    symbolBreakdown: [
      { symbol: "for", meaning: '"I want to repeat something"' },
      {
        symbol: "(  ;  ;  )",
        meaning: "three instructions separated by semicolons",
      },
      {
        symbol: "let i = 1",
        meaning: "START: create a counter called i, starting at 1",
      },
      { symbol: "i <= 5", meaning: "STOP: keep going while i is 5 or less" },
      {
        symbol: "i++",
        meaning: "COUNT: add 1 to i each time (shortcut for i = i + 1)",
      },
      { symbol: "{ }", meaning: "curly braces wrap the code that repeats" },
    ],
  },
  {
    title: "What is if / else?",
    explanation:
      'An "if" is a decision. Like: "IF it\'s raining, bring an umbrella. OTHERWISE (else), wear sunglasses." You can chain multiple checks with "else if".',
    codeExample: `if (temperature > 25) {
  console.log("Hot!");
} else if (temperature > 15) {
  console.log("Nice.");
} else {
  console.log("Cold!");
}`,
    symbolBreakdown: [
      { symbol: "if", meaning: '"check if this is true"' },
      {
        symbol: "( )",
        meaning: "the condition to check goes inside parentheses",
      },
      {
        symbol: "{ }",
        meaning: '"if true, do what\'s inside these curly braces"',
      },
      { symbol: "else if", meaning: '"otherwise, check this next condition"' },
      {
        symbol: "else",
        meaning: '"if NOTHING above was true, do this instead"',
      },
      { symbol: ">", meaning: '"is greater than"' },
    ],
  },
  {
    title: "= vs === (this trips up everyone!)",
    explanation:
      "This is the #1 beginner confusion. One equals sign (=) STORES a value. Three equals signs (===) COMPARES two values. They look similar but do completely different things!",
    codeExample: `let x = 5;       // STORE: "put 5 in the box x"
x === 5           // COMPARE: "is x equal to 5?" → true
x === 3           // COMPARE: "is x equal to 3?" → false

// COMMON MISTAKE:
if (x = 3)    // WRONG! This stores 3 in x
if (x === 3)  // CORRECT! This checks if x is 3`,
    symbolBreakdown: [
      { symbol: "=", meaning: "STORE a value (put something in a box)" },
      { symbol: "===", meaning: "COMPARE two values (are they the same?)" },
      { symbol: "&&", meaning: '"AND" — both conditions must be true' },
      { symbol: "||", meaning: '"OR" — at least one must be true' },
    ],
  },
  {
    title: "What is % (modulo)?",
    explanation:
      'The % symbol gives you the REMAINDER after dividing. If the remainder is 0, it divides evenly. This is how you check "is this number divisible by 3?" — the KEY to FizzBuzz!',
    codeExample: `10 % 3  // → 1  (10 ÷ 3 = 3 remainder 1)
9 % 3   // → 0  (divisible! no remainder)
15 % 5  // → 0  (divisible!)

// "Is i divisible by 3?"
if (i % 3 === 0) {
  // yes!
}`,
    symbolBreakdown: [
      {
        symbol: "%",
        meaning: '"divide and give me the REMAINDER" (not percentage!)',
      },
      {
        symbol: "% 3 === 0",
        meaning: '"the remainder is 0" = "divides evenly by 3"',
      },
      { symbol: "&&", meaning: '"AND" — check BOTH conditions at once' },
      {
        symbol: "i % 3 === 0 && i % 5 === 0",
        meaning: '"divisible by 3 AND 5" (this is FizzBuzz!)',
      },
    ],
  },
  {
    title: "What is a function?",
    explanation:
      'A function is a recipe. You give it a name, list what ingredients (inputs) it needs, and write the steps inside. "return" means "here\'s the final answer."',
    codeExample: `function double(number) {
  return number * 2;
}
double(5);   // → 10
double(100); // → 200`,
    symbolBreakdown: [
      { symbol: "function", meaning: '"I\'m defining a new recipe"' },
      { symbol: "double", meaning: "the name you give your recipe" },
      { symbol: "(number)", meaning: "the input/ingredient the recipe needs" },
      { symbol: "{ }", meaning: "the steps of the recipe go inside" },
      { symbol: "return", meaning: "\"here's the answer, I'm done!\"" },
    ],
  },
];

const reverseStringLesson: MiniLessonConcept[] = [
  {
    title: "What is a string?",
    explanation:
      "A string is text — letters, numbers, symbols wrapped in quotes. Each character has a position number (index) starting from 0. You can grab any character by its position.",
    codeExample: `const word = "hello";
word[0]       // → "h"
word[4]       // → "o"
word.length   // → 5`,
    symbolBreakdown: [
      {
        symbol: '" "',
        meaning: 'quotes tell the computer "this is text, not code"',
      },
      {
        symbol: "word[0]",
        meaning: "get the character at position 0 (first one)",
      },
      { symbol: ".length", meaning: '"how many characters are in this text?"' },
    ],
  },
  {
    title: "Building text with +=",
    explanation:
      'You can build up text one piece at a time. Start with nothing ("") and keep adding characters. The += symbol means "add this to what\'s already there."',
    codeExample: `let result = "";
result += "h";   // result is "h"
result += "i";   // result is "hi"
result += "!";   // result is "hi!"`,
    symbolBreakdown: [
      { symbol: '""', meaning: "empty text (nothing inside the quotes)" },
      { symbol: "+=", meaning: '"add this to the end of what I already have"' },
      {
        symbol: "let",
        meaning: "using let (not const) because the value keeps changing",
      },
    ],
  },
  {
    title: "Looping backwards",
    explanation:
      "A normal loop counts up (0, 1, 2...). To reverse a string, you loop BACKWARDS — start at the last character and count down to 0. Use i-- instead of i++.",
    codeExample: `const word = "hello";
// Last position: word.length - 1 = 4

for (let i = 4; i >= 0; i--) {
  console.log(word[i]);
}
// Prints: o, l, l, e, h`,
    symbolBreakdown: [
      { symbol: "i--", meaning: "subtract 1 each time (count DOWN)" },
      { symbol: "i++", meaning: "add 1 each time (count UP) — the opposite" },
      { symbol: "i >= 0", meaning: '"keep going while i is 0 or more"' },
      {
        symbol: "word.length - 1",
        meaning:
          "position of the LAST character (length is 5, last position is 4)",
      },
    ],
  },
  {
    title: "Putting it together: reverse!",
    explanation:
      "Combine what you learned: start with empty text, loop backwards through the string, and add each character. By going backwards, you build the reversed version!",
    codeExample: `let reversed = "";
const word = "hi";

reversed += word[1];  // reversed is "i"
reversed += word[0];  // reversed is "ih"
// "hi" reversed is "ih"!`,
    symbolBreakdown: [
      { symbol: "word[i]", meaning: "the character at position i in the word" },
      {
        symbol: "reversed += word[i]",
        meaning: '"take this character and add it to my result"',
      },
      {
        symbol: "return reversed",
        meaning: "\"here's the reversed string, I'm done!\"",
      },
    ],
  },
];

const twoSumLesson: MiniLessonConcept[] = [
  {
    title: "What is an array?",
    explanation:
      'An array is a numbered list. Each item has a position called an "index" starting from 0. Think of seats in a row — seat 0, seat 1, seat 2...',
    codeExample: `const nums = [2, 7, 11, 15];
nums[0]       // → 2
nums[1]       // → 7
nums.length   // → 4`,
    symbolBreakdown: [
      { symbol: "[ ]", meaning: "square brackets create a list" },
      { symbol: "nums[0]", meaning: "get item at position 0 (the first item)" },
      { symbol: ".length", meaning: '"how many items in this list?"' },
    ],
  },
  {
    title: "What is a Map?",
    explanation:
      'A Map is like a phone book — you store pairs of (name → number). Later you can quickly ask "do I have Alice\'s number?" and look it up instantly.',
    codeExample: `const book = new Map();
book.set("Alice", 42);   // store
book.has("Alice");        // → true
book.get("Alice");        // → 42
book.has("Bob");          // → false`,
    symbolBreakdown: [
      { symbol: "new Map()", meaning: '"create a new empty phone book"' },
      { symbol: ".set(key, value)", meaning: '"store this pair"' },
      {
        symbol: ".has(key)",
        meaning: '"is this key in the book?" → true/false',
      },
      { symbol: ".get(key)", meaning: '"look up and give me the value"' },
    ],
  },
  {
    title: "The complement trick",
    explanation:
      "If two numbers need to add up to 9, and you're looking at 2, you NEED 7 (because 9 - 2 = 7). That missing piece is the \"complement.\" Just check if you've seen it before!",
    codeExample: `const target = 9;
const current = 2;
const need = target - current;
// need = 7

// "Have I seen a 7 before?"`,
    symbolBreakdown: [
      { symbol: "-", meaning: "subtraction: target minus current number" },
      {
        symbol: "target - nums[i]",
        meaning: '"what number do I NEED to reach the target?"',
      },
    ],
  },
  {
    title: "Looping through a list",
    explanation:
      "Use a for loop to visit every item one by one. The variable i is the position, and nums[i] is the actual value at that position.",
    codeExample: `const nums = [10, 20, 30];
for (let i = 0; i < nums.length; i++) {
  console.log(nums[i]);
}
// Prints: 10, 20, 30`,
    symbolBreakdown: [
      { symbol: "i = 0", meaning: "start at the first position" },
      {
        symbol: "i < nums.length",
        meaning: "keep going until we've checked every item",
      },
      { symbol: "nums[i]", meaning: "the actual value at position i" },
      { symbol: "i", meaning: "just the position NUMBER (0, 1, 2...)" },
    ],
  },
  {
    title: "Returning the answer",
    explanation:
      '"return" means "I found it! Here\'s the answer." For Two Sum, you return the two positions (indices) where the matching numbers are.',
    codeExample: `// When you find the pair:
return [seen.get(need), i];
// "The answer is these two positions!"`,
    symbolBreakdown: [
      { symbol: "return", meaning: '"stop here and give back the answer"' },
      {
        symbol: "[a, b]",
        meaning: "an array with two items — the two positions",
      },
      {
        symbol: "seen.get(need)",
        meaning: '"look up where I saw that number before"',
      },
    ],
  },
];

// ── Beginner Problems Mini Lessons ─────────────────────────

const oddOrEvenLesson: MiniLessonConcept[] = [
  {
    title: "What is a function?",
    explanation:
      'A function is like a recipe. You give it a name, tell it what ingredient (input) it needs, and write the steps inside. "return" means "here\'s the final answer."',
    codeExample: `function greet(name) {
  return "Hello, " + name;
}
greet("Ali");   // → "Hello, Ali"`,
    symbolBreakdown: [
      { symbol: "function", meaning: '"I\'m defining a new recipe"' },
      { symbol: "greet", meaning: "the name you give your recipe" },
      { symbol: "(name)", meaning: "the input/ingredient the recipe needs" },
      { symbol: "{ }", meaning: "the steps of the recipe go inside" },
      { symbol: "return", meaning: "\"here's the answer, I'm done!\"" },
    ],
  },
  {
    title: "What is if / else?",
    explanation:
      'An "if" is a decision. Like: "IF it\'s raining, bring an umbrella. OTHERWISE (else), wear sunglasses." The computer checks the condition and runs only one path.',
    codeExample: `if (age >= 18) {
  return "adult";
} else {
  return "minor";
}`,
    symbolBreakdown: [
      { symbol: "if", meaning: '"check if this is true"' },
      {
        symbol: "( )",
        meaning: "the condition to check goes inside parentheses",
      },
      {
        symbol: "{ }",
        meaning: '"if true, do what\'s inside these curly braces"',
      },
      { symbol: "else", meaning: '"if it was NOT true, do this instead"' },
    ],
  },
  {
    title: "What is % (modulo)?",
    explanation:
      'The % symbol gives you the REMAINDER after dividing. If the remainder is 0, it divides evenly. This is how you check "is this number even?" — even numbers divide by 2 with no remainder!',
    codeExample: `4 % 2   // → 0  (even! divides evenly)
7 % 2   // → 1  (odd! remainder of 1)
0 % 2   // → 0  (even!)
-3 % 2  // → -1 (odd!)`,
    symbolBreakdown: [
      { symbol: "%", meaning: '"divide and give me the REMAINDER"' },
      { symbol: "% 2 === 0", meaning: '"the remainder is 0" = "it\'s even"' },
      {
        symbol: "% 2 !== 0",
        meaning: '"the remainder is NOT 0" = "it\'s odd"',
      },
      { symbol: "===", meaning: '"is exactly equal to?" (comparison)' },
    ],
  },
  {
    title: "Returning text (strings)",
    explanation:
      "When a function needs to give back text, you wrap it in quotes. The return statement sends the answer back to whoever called the function.",
    codeExample: `function mood(score) {
  if (score > 7) {
    return "happy";
  } else {
    return "meh";
  }
}
mood(9);  // → "happy"
mood(3);  // → "meh"`,
    symbolBreakdown: [
      {
        symbol: '"happy"',
        meaning: "text (string) — must be wrapped in quotes",
      },
      { symbol: "return", meaning: '"stop here and give back this answer"' },
      { symbol: ">", meaning: '"is greater than"' },
    ],
  },
];

const sumArrayLesson: MiniLessonConcept[] = [
  {
    title: "What is an array?",
    explanation:
      "An array is a list of items, like a shopping list. Each item has a position number starting from 0. You can find out how many items are in it with .length.",
    codeExample: `const nums = [10, 20, 30];
nums[0]       // → 10 (first item)
nums[2]       // → 30 (third item)
nums.length   // → 3`,
    symbolBreakdown: [
      { symbol: "[ ]", meaning: "square brackets create a list (array)" },
      { symbol: "nums[0]", meaning: "get the item at position 0 (first item)" },
      { symbol: ".length", meaning: '"how many items are in this list?"' },
    ],
  },
  {
    title: "What is a for loop?",
    explanation:
      'A loop repeats an action. Think of it like: "Go through each item in the list, one by one, and do something." It has 3 parts: where to start, when to stop, and how to count.',
    codeExample: `for (let i = 0; i < 3; i++) {
  console.log(i);
}
// Prints: 0, 1, 2`,
    symbolBreakdown: [
      { symbol: "for", meaning: '"I want to repeat something"' },
      { symbol: "let i = 0", meaning: "START: create a counter starting at 0" },
      { symbol: "i < 3", meaning: "STOP: keep going while i is less than 3" },
      { symbol: "i++", meaning: "COUNT: add 1 to i each time" },
      { symbol: "{ }", meaning: "curly braces wrap the code that repeats" },
    ],
  },
  {
    title: "The accumulator pattern",
    explanation:
      'To add up numbers, start with a variable at 0 (the "accumulator"), then keep adding each number to it. At the end, the variable holds the total.',
    codeExample: `let total = 0;
total += 10;  // total is 10
total += 20;  // total is 30
total += 30;  // total is 60`,
    symbolBreakdown: [
      { symbol: "let total = 0", meaning: "create a box starting at 0" },
      { symbol: "+=", meaning: '"add this to what\'s already there"' },
      {
        symbol: "total += nums[i]",
        meaning: '"add the current number to our running total"',
      },
    ],
  },
];

const findMaxLesson: MiniLessonConcept[] = [
  {
    title: "What is an array?",
    explanation:
      "An array is a numbered list. Each item has a position (index) starting from 0. You can access any item by its position.",
    codeExample: `const nums = [3, 7, 2, 9];
nums[0]       // → 3
nums[3]       // → 9
nums.length   // → 4`,
    symbolBreakdown: [
      { symbol: "[ ]", meaning: "square brackets create a list" },
      { symbol: "nums[0]", meaning: "get item at position 0" },
      { symbol: ".length", meaning: '"how many items?"' },
    ],
  },
  {
    title: "Tracking the best so far",
    explanation:
      "To find the biggest number, remember the best one you've seen so far. Start with the first item, then check each next item — if it's bigger, that becomes your new best.",
    codeExample: `let max = nums[0];  // start with the first item
// then compare each next item...
if (nums[1] > max) {
  max = nums[1];  // found a bigger one!
}`,
    symbolBreakdown: [
      {
        symbol: "let max = nums[0]",
        meaning: '"the best so far is the first item"',
      },
      { symbol: ">", meaning: '"is greater than"' },
      {
        symbol: "max = nums[i]",
        meaning: '"update: THIS is now the biggest I\'ve seen"',
      },
    ],
  },
  {
    title: "Looping through a list",
    explanation:
      "Use a for loop to visit every item. Since we already used the first item as our starting max, we can start the loop from position 1.",
    codeExample: `const nums = [3, 7, 2, 9];
let max = nums[0]; // max = 3

for (let i = 1; i < nums.length; i++) {
  if (nums[i] > max) {
    max = nums[i];
  }
}
// max is 9`,
    symbolBreakdown: [
      {
        symbol: "i = 1",
        meaning: "start at position 1 (we already have position 0)",
      },
      {
        symbol: "i < nums.length",
        meaning: "keep going until we've checked every item",
      },
      { symbol: "nums[i]", meaning: "the actual value at position i" },
    ],
  },
];

const countVowelsLesson: MiniLessonConcept[] = [
  {
    title: "What is a string?",
    explanation:
      "A string is text — letters, numbers, symbols wrapped in quotes. Each character has a position (index) starting from 0. You can loop through every character just like an array.",
    codeExample: `const word = "hello";
word[0]       // → "h"
word[4]       // → "o"
word.length   // → 5`,
    symbolBreakdown: [
      { symbol: '" "', meaning: 'quotes tell the computer "this is text"' },
      { symbol: "word[0]", meaning: "get the character at position 0" },
      { symbol: ".length", meaning: '"how many characters?"' },
    ],
  },
  {
    title: "Checking if something is in a list",
    explanation:
      "You can use .includes() to check if a value exists in a string or array. It returns true or false.",
    codeExample: `"aeiou".includes("a")  // → true
"aeiou".includes("b")  // → false
"aeiou".includes("e")  // → true`,
    symbolBreakdown: [
      {
        symbol: ".includes()",
        meaning: '"does this contain...?" → true or false',
      },
      { symbol: '"aeiou"', meaning: "a string containing all the vowels" },
      { symbol: "true", meaning: "yes, it's in there!" },
      { symbol: "false", meaning: "no, it's not" },
    ],
  },
  {
    title: "Making text lowercase",
    explanation:
      '"A" and "a" are different to a computer. To handle both uppercase and lowercase letters, convert the whole string to lowercase first with .toLowerCase().',
    codeExample: `"Hello".toLowerCase()  // → "hello"
"ABC".toLowerCase()    // → "abc"

const char = "A";
"aeiou".includes(char.toLowerCase())  // → true`,
    symbolBreakdown: [
      {
        symbol: ".toLowerCase()",
        meaning: '"convert all letters to lowercase"',
      },
    ],
  },
  {
    title: "Counting with a loop",
    explanation:
      "To count vowels: start a counter at 0, loop through each character, and if it's a vowel, add 1 to the counter.",
    codeExample: `let count = 0;
const word = "Hi";

// word[0] is "H" → lowercase is "h" → not a vowel
// word[1] is "i" → lowercase is "i" → vowel! count becomes 1`,
    symbolBreakdown: [
      { symbol: "let count = 0", meaning: "start counting from zero" },
      {
        symbol: "count++",
        meaning: '"add 1 to count" (same as count = count + 1)',
      },
    ],
  },
];

const doubleEachLesson: MiniLessonConcept[] = [
  {
    title: "What is an array?",
    explanation:
      "An array is a list of items. You create one with square brackets. You can add new items to the end with .push().",
    codeExample: `const nums = [1, 2, 3];
const result = [];
result.push(10);
// result is [10]`,
    symbolBreakdown: [
      {
        symbol: "[ ]",
        meaning: "square brackets create a list (empty if nothing inside)",
      },
      { symbol: ".push()", meaning: '"add this item to the end of the list"' },
    ],
  },
  {
    title: "Looping through a list",
    explanation:
      "A for loop lets you visit every item in an array, one at a time. The variable i is the position, and nums[i] is the actual value at that position.",
    codeExample: `const nums = [4, 5, 6];
for (let i = 0; i < nums.length; i++) {
  console.log(nums[i]);
}
// Prints: 4, 5, 6`,
    symbolBreakdown: [
      { symbol: "i = 0", meaning: "start at the first position" },
      {
        symbol: "i < nums.length",
        meaning: "keep going until we've seen every item",
      },
      { symbol: "nums[i]", meaning: "the actual value at position i" },
      { symbol: "i++", meaning: "move to the next position" },
    ],
  },
  {
    title: "Building a new list",
    explanation:
      "To transform a list, create a new empty list, loop through the original, do something to each item, and push the result into the new list.",
    codeExample: `const nums = [1, 2, 3];
const doubled = [];

doubled.push(nums[0] * 2);  // push 2
doubled.push(nums[1] * 2);  // push 4
doubled.push(nums[2] * 2);  // push 6
// doubled is [2, 4, 6]`,
    symbolBreakdown: [
      { symbol: "*", meaning: "multiplication (times)" },
      {
        symbol: "nums[i] * 2",
        meaning: '"take this number and multiply by 2"',
      },
      {
        symbol: "result.push(...)",
        meaning: '"add the doubled number to our new list"',
      },
    ],
  },
];

export const seedProblems: Omit<Problem, "createdBy" | "createdAt">[] = [
  // ── Beginner Problems (simpler than FizzBuzz) ─────────────
  {
    id: "odd-or-even",
    title: "Odd or Even",
    description: `Write a function \`oddOrEven(n)\` that takes a number and returns the string \`"even"\` if the number is even, or \`"odd"\` if the number is odd.`,
    starterCode: `function oddOrEven(n) {\n  // Your code here\n}`,
    testCases: [
      { input: "4", expectedOutput: '"even"' },
      { input: "7", expectedOutput: '"odd"' },
      { input: "0", expectedOutput: '"even"' },
      { input: "-3", expectedOutput: '"odd"' },
      { input: "1", expectedOutput: '"odd"' },
    ],
    difficulty: "easy",
    language: "javascript",
    referenceSolution: `function oddOrEven(n) {
  if (n % 2 === 0) {
    return "even";
  } else {
    return "odd";
  }
}`,
    hints: [
      "Think about what makes a number even — it divides by 2 with no remainder.",
      "The % (modulo) operator gives you the remainder. What is the remainder when an even number is divided by 2?",
      "Use if (n % 2 === 0) to check if a number is even, and return the appropriate string.",
    ],
    miniLesson: oddOrEvenLesson,
    beginnerStarterCode: `function oddOrEven(n) {

  // TODO: Check if n is even
  //       Hint: a number is even if n % 2 === 0
  //       If yes: return "even"

  // TODO: Otherwise, it must be odd
  //       return "odd"

}`,
  },
  {
    id: "sum-array",
    title: "Sum of Array",
    description: `Write a function \`sumArray(nums)\` that takes an array of numbers and returns their total sum.

If the array is empty, return \`0\`.`,
    starterCode: `function sumArray(nums) {\n  // Your code here\n}`,
    testCases: [
      { input: "[1, 2, 3]", expectedOutput: "6" },
      { input: "[]", expectedOutput: "0" },
      { input: "[10]", expectedOutput: "10" },
      { input: "[-1, -2, -3]", expectedOutput: "-6" },
      { input: "[0, 0, 0]", expectedOutput: "0" },
    ],
    difficulty: "easy",
    language: "javascript",
    referenceSolution: `function sumArray(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}`,
    hints: [
      "Start with a variable set to 0 to keep track of the running total.",
      "Use a for loop to go through each number in the array and add it to your total.",
      "After the loop finishes, return the total. This also works for an empty array — the loop just won't run, so total stays 0.",
    ],
    miniLesson: sumArrayLesson,
    beginnerStarterCode: `function sumArray(nums) {
  // Start with a total of 0
  let total = 0;

  // This loop goes through every number in the array
  for (let i = 0; i < nums.length; i++) {

    // TODO: Add the current number to the total
    //       Hint: use "total += nums[i]"

  }

  return total;
}`,
  },
  {
    id: "find-max",
    title: "Find the Maximum",
    description: `Write a function \`findMax(nums)\` that takes an array of numbers and returns the largest number.

You may assume the array always has at least one number.`,
    starterCode: `function findMax(nums) {\n  // Your code here\n}`,
    testCases: [
      { input: "[3, 7, 2, 9, 1]", expectedOutput: "9" },
      { input: "[5]", expectedOutput: "5" },
      { input: "[-1, -5, -2]", expectedOutput: "-1" },
      { input: "[4, 4, 4]", expectedOutput: "4" },
      { input: "[1, 2, 3, 4, 100]", expectedOutput: "100" },
    ],
    difficulty: "easy",
    language: "javascript",
    referenceSolution: `function findMax(nums) {
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}`,
    hints: [
      "Start by assuming the first number is the biggest.",
      "Loop through the rest of the array. For each number, check if it's bigger than your current max.",
      "If you find a bigger number, update your max variable. After the loop, return max.",
    ],
    miniLesson: findMaxLesson,
    beginnerStarterCode: `function findMax(nums) {
  // Assume the first number is the biggest (for now)
  let max = nums[0];

  // Start at position 1 since we already have position 0
  for (let i = 1; i < nums.length; i++) {

    // TODO: Check if the current number is bigger than max
    //       Hint: use "if (nums[i] > max)"
    //       If yes: update max with "max = nums[i]"

  }

  return max;
}`,
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    description: `Write a function \`countVowels(str)\` that takes a string and returns the number of vowels (a, e, i, o, u) in it.

The function should be case-insensitive — both \`"A"\` and \`"a"\` count as vowels.`,
    starterCode: `function countVowels(str) {\n  // Your code here\n}`,
    testCases: [
      { input: '"hello"', expectedOutput: "2" },
      { input: '""', expectedOutput: "0" },
      { input: '"bcdfg"', expectedOutput: "0" },
      { input: '"aeiou"', expectedOutput: "5" },
      { input: '"HeLLo WoRLd"', expectedOutput: "3" },
    ],
    difficulty: "easy",
    language: "javascript",
    referenceSolution: `function countVowels(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if ("aeiou".includes(str[i].toLowerCase())) {
      count++;
    }
  }
  return count;
}`,
    hints: [
      "Loop through each character in the string and check if it's a vowel.",
      'Use .toLowerCase() on each character so you don\'t miss uppercase vowels. You can check if a character is a vowel with "aeiou".includes(char).',
      "Keep a counter starting at 0. Each time you find a vowel, add 1 to the counter with count++.",
    ],
    miniLesson: countVowelsLesson,
    beginnerStarterCode: `function countVowels(str) {
  // Start counting from zero
  let count = 0;

  // Loop through every character in the string
  for (let i = 0; i < str.length; i++) {

    // TODO: Check if the current character is a vowel
    //       Hint: use str[i].toLowerCase() to make it lowercase
    //       Hint: use "aeiou".includes(...) to check if it's a vowel
    //       If yes: add 1 to count with "count++"

  }

  return count;
}`,
  },
  {
    id: "double-each",
    title: "Double Each",
    description: `Write a function \`doubleEach(nums)\` that takes an array of numbers and returns a new array where every number is doubled.

If the array is empty, return an empty array \`[]\`.`,
    starterCode: `function doubleEach(nums) {\n  // Your code here\n}`,
    testCases: [
      { input: "[1, 2, 3]", expectedOutput: "[2,4,6]" },
      { input: "[]", expectedOutput: "[]" },
      { input: "[5]", expectedOutput: "[10]" },
      { input: "[0, -1, 4]", expectedOutput: "[0,-2,8]" },
      { input: "[-3, -5]", expectedOutput: "[-6,-10]" },
    ],
    difficulty: "easy",
    language: "javascript",
    referenceSolution: `function doubleEach(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    result.push(nums[i] * 2);
  }
  return result;
}`,
    hints: [
      "Create a new empty array to store the results.",
      "Loop through each number in the input array, multiply it by 2, and push it into the result array.",
      "After the loop, return the result array. For an empty input, the loop won't run and you'll return an empty array.",
    ],
    miniLesson: doubleEachLesson,
    beginnerStarterCode: `function doubleEach(nums) {
  // Create a new empty list for our results
  const result = [];

  // Loop through every number in the input
  for (let i = 0; i < nums.length; i++) {

    // TODO: Multiply the current number by 2 and add it to result
    //       Hint: use "result.push(nums[i] * 2)"

  }

  return result;
}`,
  },
  // ── Original Problems ─────────────────────────────────────
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
    miniLesson: fizzBuzzLesson,
    beginnerStarterCode: `function fizzBuzz(n) {
  // We'll collect all answers in this list
  const result = [];

  // This loop goes through every number from 1 to n
  for (let i = 1; i <= n; i++) {

    // TODO: Check if i is divisible by BOTH 3 and 5
    //       Hint: use "if (i % 3 === 0 && i % 5 === 0)"
    //       If yes: result.push("FizzBuzz")

    // TODO: Otherwise, check if i is divisible by 3
    //       Hint: use "else if (i % 3 === 0)"
    //       If yes: result.push("Fizz")

    // TODO: Otherwise, check if i is divisible by 5
    //       Hint: use "else if (i % 5 === 0)"
    //       If yes: result.push("Buzz")

    // TODO: If none of the above, add the number as text
    //       Hint: use "else { result.push(i.toString()) }"

  }

  return result;
}`,
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
    miniLesson: reverseStringLesson,
    beginnerStarterCode: `function reverseString(str) {
  // We'll build the reversed string here, starting empty
  let reversed = "";

  // This loop starts at the LAST character and goes backward
  // str.length - 1 is the position of the last character
  for (let i = str.length - 1; i >= 0; i--) {

    // TODO: Add the current character to our reversed string
    //       Hint: str[i] gives you the character at position i
    //       Hint: use "reversed += str[i]" to add it

  }

  return reversed;
}`,
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
    miniLesson: twoSumLesson,
    beginnerStarterCode: `function twoSum(nums, target) {
  // A Map lets us remember numbers we've already seen
  // We store each number and its position (index)
  const seen = new Map();

  // Loop through every number in the array
  for (let i = 0; i < nums.length; i++) {

    // Calculate what number we NEED to reach the target
    // Example: if target is 9 and current number is 2, we need 7
    const need = target - nums[i];

    // TODO: Check if "need" is a number we've already seen
    //       Hint: use "if (seen.has(need))"
    //       If yes, return both positions: [seen.get(need), i]

    // TODO: Remember the current number and its position
    //       Hint: use "seen.set(nums[i], i)"

  }
}`,
  },
];
