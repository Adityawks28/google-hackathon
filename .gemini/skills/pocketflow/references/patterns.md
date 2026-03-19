# PocketFlow Patterns

## The Chatbot Pattern

In a chatbot application, a core requirement is to handle continuous looping, gathering user input, processing it with an AI, and returning the result. PocketFlow accomplishes this by looping back to earlier nodes based on the "action" returned in `post`.

**Example Loop Logic:**

- Node A (`UserInputNode`) gets text from the user and writes it to `shared`. Returns `"process"`.
- Node B (`LLMProcessNode`) takes the input from `shared`, calls an LLM, and writes the response to `shared`. Returns `"loop"`.

By configuring the Flow to route the `"loop"` action from Node B back to Node A, you establish an infinite or conditional conversational loop entirely decoupled from the core LLM processing.

## The Agentic Pattern

Agentic coding shines when you want to create modular tools that a central "planner" can invoke. The Prep-Exec-Post pattern organizes this cleanly:

1. **Planner Node:**
   - **Prep:** Gathers user query and available tool descriptions.
   - **Exec:** Calls LLM to decide which tool to use.
   - **Post:** Saves the tool choice to `shared` and returns an action matching the chosen tool (e.g., `"search_web"`).
2. **Tool Nodes (e.g., WebSearchNode):**
   - **Prep:** Reads the search query from `shared`.
   - **Exec:** Executes the API request (this isolated step benefits from automatic retries).
   - **Post:** Appends the results to `shared.context` and returns `"synthesize"`.
3. **Synthesis Node:**
   - **Prep:** Gathers original query and `shared.context`.
   - **Exec:** Generates the final answer.
   - **Post:** Returns `"done"`.

This clear separation means each node is only responsible for its explicit phase, making it robust against hallucination and easy to debug.
