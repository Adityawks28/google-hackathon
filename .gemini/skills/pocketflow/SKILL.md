---
name: pocketflow
description: Understands the PocketFlow framework, the prep-exec-post node lifecycle, and how to build Agentic Coding workflows and chatbot patterns using it. Use this when implementing PocketFlow nodes or complex AI graph workflows.
---

# PocketFlow Skill

PocketFlow is a minimalist framework (~100 lines, zero dependencies) designed for **Agentic Coding**—a paradigm where human developers design the high-level logic (the graph) and AI agents implement the specific details (the nodes). It models workflows as a Nested Directed Graph interacting with a Shared Store.

## Philosophy

- **Nodes:** The atomic units of work.
- **Flows:** Collections of nodes connected by directional edges.
- **Shared Store:** A central state (like a dictionary) that all nodes read from and write to, avoiding complex parameter drilling.

## Packages

PocketFlow is available in multiple languages:

- **Python (PyPI):** `pocketflow`
- **TypeScript (NPM):** `pocketflow` (or `pocketflow-node` for Node.js-specific implementations)

## The Prep-Exec-Post Lifecycle

Each Node strictly separates data management from computation through three distinct methods:

1. **`prep(shared)`**
   - **Purpose:** Data Acquisition.
   - **Action:** Reads from the `SharedStore` and returns only the specific inputs needed for computation.
   - **AI Context:** Keeps the node isolated from the global state structure.

2. **`exec(prep_res)`**
   - **Purpose:** Computation (e.g., calling an LLM, searching a DB).
   - **Action:** Takes the output of `prep` as its only input and performs the core work.
   - **AI Context:** PocketFlow's built-in retries target _only_ this method, saving time and money if an LLM fails.

3. **`post(shared, prep_res, exec_res)`**
   - **Purpose:** State Update & Routing.
   - **Action:** Writes the results back to the `SharedStore` and returns an "action" string (e.g., `"success"`, `"default"`) to determine the next node in the Flow.

## Advanced Patterns

For detailed implementation examples of specific architectures (like Chatbots or Agentic workflows), see [references/patterns.md](references/patterns.md).
