#!/usr/bin/env node

import { exec } from "child_process";

// Read input from stdin
let inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    if (!inputData.trim()) {
      // No input, just exit success
      console.log(JSON.stringify({ message: "No input received" }));
      process.exit(0);
    }

    const context = JSON.parse(inputData);
    const { tool_name, tool_input, error } = context;

    // Check if tool execution had an error (if available in context)
    if (error) {
      console.error(`Tool execution failed, skipping format: ${error}`);
      console.log(JSON.stringify({ message: "Tool execution failed" }));
      process.exit(0);
    }

    if (tool_name === "write_file" || tool_name === "replace") {
      const filePath = tool_input.file_path;

      if (filePath) {
        console.error(`Running Prettier on: ${filePath}`);

        exec(`npm run format:fix -- "${filePath}"`, (err, stdout, stderr) => {
          if (err) {
            console.error(`Prettier failed: ${stderr}`);
            // Don't fail the hook, just log error
          } else {
            console.error(`Prettier success: ${stdout.trim()}`);
          }

          // Always return success JSON to Geminicli
          console.log(JSON.stringify({ message: "Format hook executed" }));
        });
      } else {
        console.log(JSON.stringify({ message: "No file path found" }));
      }
    } else {
      console.log(JSON.stringify({ message: "Ignored tool" }));
    }
  } catch (e) {
    console.error(`Hook error: ${e.message}`);
    // Return success to avoid blocking the agent, but log error
    console.log(JSON.stringify({ message: "Hook error trapped" }));
    process.exit(0);
  }
});
