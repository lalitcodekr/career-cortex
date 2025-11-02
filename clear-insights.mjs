import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to delete all IndustryInsight records...");
  try {
    const { count } = await prisma.industryInsight.deleteMany({});
    console.log(`✅ Success! Deleted ${count} industry insight(s).`);
    console.log('You can now restart your app with "npm run dev".');
  } catch (error) {
    console.error("❌ Failed to delete insights:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
