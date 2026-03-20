#!/bin/bash
# Seed Firebase emulator with starter problems and data.
# Usage: docker compose up -d && npm run seed

FIRESTORE_HOST="http://127.0.0.1:8080"
PROJECT="demo-google-hackathon"
BASE_URL="$FIRESTORE_HOST/v1/projects/$PROJECT/databases/(default)/documents"

echo "Waiting for Firestore emulator..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" "$FIRESTORE_HOST/" | grep -q "200"; then
    echo "Firestore emulator is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Firestore emulator not reachable at $FIRESTORE_HOST after 30s"
    exit 1
  fi
  sleep 1
done

echo "Seeding problems..."

# Odd or Even
curl -s -X PATCH "$BASE_URL/problems/odd-or-even" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Odd or Even"},
      "description": {"stringValue": "Write a function `oddOrEven(n)` that takes a number and returns the string `\"even\"` if the number is even, or `\"odd\"` if the number is odd."},
      "starterCode": {"stringValue": "function oddOrEven(n) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "4"}, "expectedOutput": {"stringValue": "\"even\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "7"}, "expectedOutput": {"stringValue": "\"odd\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "0"}, "expectedOutput": {"stringValue": "\"even\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "-3"}, "expectedOutput": {"stringValue": "\"odd\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "1"}, "expectedOutput": {"stringValue": "\"odd\""}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Odd or Even"

# Sum of Array
curl -s -X PATCH "$BASE_URL/problems/sum-array" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Sum of Array"},
      "description": {"stringValue": "Write a function `sumArray(nums)` that takes an array of numbers and returns their total sum.\n\nIf the array is empty, return `0`."},
      "starterCode": {"stringValue": "function sumArray(nums) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "[1, 2, 3]"}, "expectedOutput": {"stringValue": "6"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[]"}, "expectedOutput": {"stringValue": "0"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[10]"}, "expectedOutput": {"stringValue": "10"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[-1, -2, -3]"}, "expectedOutput": {"stringValue": "-6"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[0, 0, 0]"}, "expectedOutput": {"stringValue": "0"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Sum of Array"

# Find the Maximum
curl -s -X PATCH "$BASE_URL/problems/find-max" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Find the Maximum"},
      "description": {"stringValue": "Write a function `findMax(nums)` that takes an array of numbers and returns the largest number.\n\nYou may assume the array always has at least one number."},
      "starterCode": {"stringValue": "function findMax(nums) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "[3, 7, 2, 9, 1]"}, "expectedOutput": {"stringValue": "9"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[5]"}, "expectedOutput": {"stringValue": "5"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[-1, -5, -2]"}, "expectedOutput": {"stringValue": "-1"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[4, 4, 4]"}, "expectedOutput": {"stringValue": "4"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[1, 2, 3, 4, 100]"}, "expectedOutput": {"stringValue": "100"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Find the Maximum"

# Count Vowels
curl -s -X PATCH "$BASE_URL/problems/count-vowels" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Count Vowels"},
      "description": {"stringValue": "Write a function `countVowels(str)` that takes a string and returns the number of vowels (a, e, i, o, u) in it.\n\nThe function should be case-insensitive — both `\"A\"` and `\"a\"` count as vowels."},
      "starterCode": {"stringValue": "function countVowels(str) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "\"hello\""}, "expectedOutput": {"stringValue": "2"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"\""}, "expectedOutput": {"stringValue": "0"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"bcdfg\""}, "expectedOutput": {"stringValue": "0"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"aeiou\""}, "expectedOutput": {"stringValue": "5"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"HeLLo WoRLd\""}, "expectedOutput": {"stringValue": "3"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Count Vowels"

# Double Each
curl -s -X PATCH "$BASE_URL/problems/double-each" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Double Each"},
      "description": {"stringValue": "Write a function `doubleEach(nums)` that takes an array of numbers and returns a new array where every number is doubled.\n\nIf the array is empty, return an empty array `[]`."},
      "starterCode": {"stringValue": "function doubleEach(nums) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "[1, 2, 3]"}, "expectedOutput": {"stringValue": "[2,4,6]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[]"}, "expectedOutput": {"stringValue": "[]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[5]"}, "expectedOutput": {"stringValue": "[10]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[0, -1, 4]"}, "expectedOutput": {"stringValue": "[0,-2,8]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[-3, -5]"}, "expectedOutput": {"stringValue": "[-6,-10]"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Double Each"

# FizzBuzz
curl -s -X PATCH "$BASE_URL/problems/fizzbuzz" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "FizzBuzz"},
      "description": {"stringValue": "Write a function `fizzBuzz(n)` that returns an array of strings from 1 to n where:\n- Multiples of 3 are replaced with \"Fizz\"\n- Multiples of 5 are replaced with \"Buzz\"\n- Multiples of both 3 and 5 are replaced with \"FizzBuzz\"\n- All other numbers are converted to strings"},
      "starterCode": {"stringValue": "function fizzBuzz(n) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "5"}, "expectedOutput": {"stringValue": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "15"}, "expectedOutput": {"stringValue": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "1"}, "expectedOutput": {"stringValue": "[\"1\"]"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - FizzBuzz"

# Reverse String
curl -s -X PATCH "$BASE_URL/problems/reverse-string" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Reverse a String"},
      "description": {"stringValue": "Write a function `reverseString(str)` that takes a string and returns the string reversed.\n\nDo not use the built-in `.reverse()` method."},
      "starterCode": {"stringValue": "function reverseString(str) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "easy"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "\"hello\""}, "expectedOutput": {"stringValue": "\"olleh\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"world\""}, "expectedOutput": {"stringValue": "\"dlrow\""}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "\"\""}, "expectedOutput": {"stringValue": "\"\""}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Reverse a String"

# Two Sum
curl -s -X PATCH "$BASE_URL/problems/two-sum" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Two Sum"},
      "description": {"stringValue": "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nWrite a function `twoSum(nums, target)` that returns an array of two indices."},
      "starterCode": {"stringValue": "function twoSum(nums, target) {\n  // Your code here\n}"},
      "difficulty": {"stringValue": "medium"},
      "language": {"stringValue": "javascript"},
      "createdBy": {"stringValue": "seed"},
      "createdAt": {"integerValue": "1700000000000"},
      "testCases": {"arrayValue": {"values": [
        {"mapValue": {"fields": {"input": {"stringValue": "[2,7,11,15], 9"}, "expectedOutput": {"stringValue": "[0,1]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[3,2,4], 6"}, "expectedOutput": {"stringValue": "[1,2]"}}}},
        {"mapValue": {"fields": {"input": {"stringValue": "[3,3], 6"}, "expectedOutput": {"stringValue": "[0,1]"}}}}
      ]}}
    }
  }' > /dev/null && echo "  - Two Sum"

echo "Seed complete! Run 'npm run dev' to start."
