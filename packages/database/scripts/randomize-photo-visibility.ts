import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function randomizePhotoVisibility() {
  console.log("🎲 Randomizing photoVisibility for dummy users in database...");

  // Randomly distribute across:
  // - ALL_MEMBERS (photos visible to all members in discovery feed)
  // - MUTUAL_MATCHES_ONLY (photos blurred until mutual match)
  // - REQUEST_REQUIRED (photos blurred until request approved)
  //
  // Let's do roughly:
  // ~45% ALL_MEMBERS (clear photos for great discovery experience)
  // ~35% MUTUAL_MATCHES_ONLY
  // ~20% REQUEST_REQUIRED
  const result = await prisma.$executeRawUnsafe(`
    UPDATE profiles
    SET photo_visibility = CASE
      WHEN random() < 0.45 THEN 'ALL_MEMBERS'::"PhotoVisibility"
      WHEN random() < 0.80 THEN 'MUTUAL_MATCHES_ONLY'::"PhotoVisibility"
      ELSE 'REQUEST_REQUIRED'::"PhotoVisibility"
    END
    WHERE user_id IN (
      SELECT id FROM users WHERE is_dummy_user = true
    );
  `);

  console.log(`✅ Updated photoVisibility for ${result} dummy profiles!`);

  const stats = await prisma.profile.groupBy({
    by: ["photoVisibility"],
    _count: { id: true },
  });

  console.log("📊 New photoVisibility distribution:");
  for (const s of stats) {
    console.log(`   - ${s.photoVisibility}: ${s._count.id.toLocaleString()} profiles`);
  }
}

randomizePhotoVisibility()
  .catch((e) => {
    console.error("❌ Error randomizing photo visibility:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
