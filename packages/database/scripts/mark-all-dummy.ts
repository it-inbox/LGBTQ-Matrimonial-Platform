import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      isDummyUser: true,
    },
  });
  console.log(`Successfully updated ${result.count} existing users with isDummyUser = true.`);
}

main()
  .catch((e) => {
    console.error("Error updating users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
