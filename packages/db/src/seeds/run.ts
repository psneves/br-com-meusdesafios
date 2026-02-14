import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { TrackableTemplate } from "../entities";
import { TRACKABLE_TEMPLATES } from "./trackable-templates";

async function seed() {
  console.log("Initializing database connection...");
  await AppDataSource.initialize();

  console.log("Seeding trackable templates...");
  const templateRepo = AppDataSource.getRepository(TrackableTemplate);

  for (const template of TRACKABLE_TEMPLATES) {
    const existing = await templateRepo.findOneBy({ code: template.code });

    if (existing) {
      console.log(`  Template ${template.code} already exists, skipping`);
      continue;
    }

    await templateRepo.save(templateRepo.create(template));
    console.log(`  Created template: ${template.code}`);
  }

  console.log("Seeding complete!");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
