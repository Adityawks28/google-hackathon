#!/bin/bash

# Test script for the Tutor API Chatbot Flow.
# Ensure your dev server is running (npm run dev) before execution.

BASE_URL="http://localhost:3000/api/tutor"

echo "--------------------------------------------------"
echo "Testing BRAINSTORM mode..."
echo "--------------------------------------------------"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "test_problem_123",
    "mode": "brainstorm",
    "code": "function add(a, b) { return a + b; }",
    "error": "",
    "hintLevel": 0,
    "userId": "test_user_123",
    "history": []
  }'

echo -e "\n\n--------------------------------------------------"
echo "Testing HELP mode (with error and history)..."
echo "--------------------------------------------------"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "test_problem_123",
    "mode": "help",
    "code": "function add(a, b) { retun a + b; }",
    "error": "SyntaxError: Unexpected identifier",
    "hintLevel": 1,
    "userId": "test_user_123",
    "history": [
      {
        "role": "user",
        "content": "Why is my code failing?",
        "timestamp": 1710000000000
      }
    ]
  }'
echo -e "\n"
