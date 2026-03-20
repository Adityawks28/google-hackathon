# AI coding tutor repo

This is a repo for a hackathon project.

The main idea is a website where students can solve simple programing problems while getting input from an AI tutor.

# Coding Guidelines

- Keep all implementations MINIMAL and follow patterns in the codebase
- Keep abstractions minimal
- Do not worry about retrocompatiblity unless explicitly told by the user
  - If you are unsure always ask the user whether it is a concern
- Use interfaces instead of types
- Use ES module imports/exports (e.g., `import { ... } from '...'`) instead of `require()` style.
- NEVER doc, setDoc, and getDoc directly. ALWAYS use the implemented models in lib/db/ to store or read from the database.
- Use ONLY global imports (e.g, @/lib/db/utils). Also please only import at the top of the files
- ALWAYS be strict about arguments on functions. Instead of doing `message?: string` as an argument, the user should explicitly pass `null` instead of this fragile `?` pattern.
