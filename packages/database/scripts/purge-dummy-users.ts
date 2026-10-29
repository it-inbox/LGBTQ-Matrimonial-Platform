import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purgeDummyUsers() {
  console.log("🔍 Checking for dummy users (isDummyUser = true)...");

  // Count dummy users
  const dummyCount = await prisma.user.count({
    where: { isDummyUser: true },
  });

  const realCount = await prisma.user.count({
    where: { isDummyUser: false },
  });

  console.log(`📊 Current Database Stats:`);
  console.log(`   - Dummy users found: ${dummyCount}`);
  console.log(`   - Real users protected: ${realCount}`);

  if (dummyCount === 0) {
    console.log("✨ No dummy users found to delete. Exiting cleanly.");
    return;
  }

  console.log(`🗑️ Deleting ${dummyCount} dummy users and their cascaded data...`);

  // Delete dummy users - PostgreSQL CASCADE handles profiles, photos, preferences, conversations, etc.
  const deleteResult = await prisma.user.deleteMany({
    where: { isDummyUser: true },
  });

  console.log(`✅ Successfully purged ${deleteResult.count} dummy users!`);
  
  const remainingUsers = await prisma.user.count();
  console.log(`🔒 Remaining real users in database: ${remainingUsers}`);
}

purgeDummyUsers()
  .catch((e) => {
    console.error("❌ Error purging dummy users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
