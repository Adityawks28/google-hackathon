import { problemModel } from "@/lib/db";
import { seedProblems } from "@/lib/lessons";

async function seed() {
  console.log("Starting to seed problems...");

  for (const problem of seedProblems) {
    const { id, ...problemData } = problem;
    const fullProblem = {
      ...problemData,
      createdAt: Date.now(),
      createdBy: "system-seed",
    };

    await problemModel.create(fullProblem as any, id);
    console.log(`Successfully seeded problem: ${id}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding problems:", error);
  process.exit(1);
});
