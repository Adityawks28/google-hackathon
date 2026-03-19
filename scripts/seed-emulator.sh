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
