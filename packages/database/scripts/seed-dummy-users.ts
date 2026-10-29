import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { buildLocationPool, LocationEntry } from "./seeder-locations";
import {
  FIRST_NAMES,
  LAST_NAMES,
  PROFESSIONS,
  SECTORS,
  EDUCATIONS,
  RELIGIONS,
  MARITAL_STATUSES,
  DIETS,
  HOBBIES,
  GENDERS,
  ORIENTATIONS,
  OUTNESS,
  PHOTO_URLS,
} from "./seeder-data";

const prisma = new PrismaClient();

// Configuration
const TARGET_USERS = 100_000; // Fast initial large batch (100k)
const BATCH_SIZE = 2_500; // 2,500 records per transaction chunk to balance memory and speed
const PRECOMPUTED_PASSWORD_HASH = "$2b$10$wN1rM7Q4LzM8d3eR2vVbGe3V4x3a1B2C3D4E5F6G7H8I9J0K1L2M"; // Precomputed "Password@123"

function getRandomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[], max = 3): T[] {
  const count = Math.floor(Math.random() * max) + 1;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

function formatSqlArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map((item) => `"${item.replace(/"/g, '\\"')}"`).join(",");
  return `'{${escaped}}'`;
}

async function runSeeder() {
  console.log(`🚀 Preparing to seed ${TARGET_USERS.toLocaleString()} dummy users using Multi-Row Raw SQL...`);
  console.log("🌍 Building weighted location pools (Tier 1: 65% same-sex marriage nations)...");

  const { tier1, tier2, tier3 } = buildLocationPool();
  console.log(`   - Tier 1 Locations (Same-sex marriage legal): ${tier1.length}`);
  console.log(`   - Tier 2 Locations (LGBTQ+ community hubs): ${tier2.length}`);
  console.log(`   - Tier 3 Locations (Global coverage): ${tier3.length}`);

  const totalBatches = Math.ceil(TARGET_USERS / BATCH_SIZE);
  const startTime = Date.now();
  let totalInserted = 0;

  for (let batch = 1; batch <= totalBatches; batch++) {
    const currentBatchSize = Math.min(BATCH_SIZE, TARGET_USERS - totalInserted);
    if (currentBatchSize <= 0) break;

    const userRows: string[] = [];
    const profileRows: string[] = [];
    const preferenceRows: string[] = [];
    const photoRows: string[] = [];

    for (let i = 0; i < currentBatchSize; i++) {
      const globalIndex = totalInserted + i + 1;
      const userId = randomUUID();
      const profileId = randomUUID();

      // Weighted location selection
      const rand = Math.random();
      let loc: LocationEntry;
      if (rand < 0.65 && tier1.length > 0) {
        loc = getRandomItem(tier1);
      } else if (rand < 0.90 && tier2.length > 0) {
        loc = getRandomItem(tier2);
      } else {
        loc = getRandomItem(tier3.length > 0 ? tier3 : tier1);
      }

      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const displayName = `${firstName} ${lastName}`;
      const gender = getRandomItem(GENDERS);
      const orientation = getRandomItem(ORIENTATIONS);
      const outness = getRandomItem(OUTNESS);

      // Distinct non-routable dummy phone & email
      const dummyPhone = `+999${String(globalIndex).padStart(9, "0")}`;
      const dummyEmail = `dummy_${globalIndex}@dummy.everpride.internal`;

      // Demographics
      const birthYear = 1970 + Math.floor(Math.random() * 34); // 1970 to 2004 (ages 22 - 56)
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
      const dobStr = `${birthYear}-${birthMonth}-${birthDay} 00:00:00`;
      const height = 152 + Math.floor(Math.random() * 40); // 152 to 192 cm

      const religion = getRandomItem(RELIGIONS);
      const marital = getRandomItem(MARITAL_STATUSES);
      const profession = getRandomItem(PROFESSIONS);
      const sector = getRandomItem(SECTORS);
      const education = getRandomItem(EDUCATIONS);
      const diet = getRandomItem(DIETS);
      const hobbiesList = getRandomSubset(HOBBIES, 4);

      // 30% photo protected (blurred)
      const isProtected = Math.random() < 0.3;
      const photoVisibility = isProtected ? "REQUEST_REQUIRED" : "MUTUAL_MATCHES_ONLY";
      const samplePhoto = getRandomItem(PHOTO_URLS);

      // User SQL Row
      userRows.push(`(
        '${userId}',
        '${dummyPhone}',
        '${dummyEmail}',
        '${PRECOMPUTED_PASSWORD_HASH}',
        'USER',
        true,
        true,
        true,
        NOW(),
        NOW()
      )`);

      // Profile SQL Row
      profileRows.push(`(
        '${profileId}',
        '${userId}',
        ${escapeSql(displayName)},
        '${gender}',
        '${orientation}',
        'they/them',
        '${outness}',
        '${dobStr}',
        ${height},
        ${escapeSql(loc.country)},
        ${escapeSql(religion)},
        'English',
        ${formatSqlArray(["English", "Spanish"])},
        ${escapeSql(marital)},
        ${escapeSql(dummyPhone)},
        true,
        ${escapeSql(loc.city)},
        ${escapeSql(loc.state)},
        ${escapeSql(loc.country)},
        ${escapeSql(education)},
        ${escapeSql(sector)},
        ${escapeSql(profession)},
        '₹15 Lakh - ₹25 Lakh',
        'Excited to connect with genuine people on EverPride.',
        ${escapeSql(diet)},
        ${formatSqlArray(hobbiesList)},
        '${photoVisibility}',
        false,
        NOW(),
        NOW()
      )`);

      // Preference SQL Row
      preferenceRows.push(`(
        '${randomUUID()}',
        '${profileId}',
        '{MAN,WOMAN,NON_BINARY}',
        '{GAY,LESBIAN,QUEER,BISEXUAL}',
        21,
        55,
        150,
        195,
        '{OUT_TO_ALL,OUT_TO_SELECT_FEW,DISCREET_NOT_OUT}',
        NOW(),
        NOW()
      )`);

      // Photo SQL Row
      photoRows.push(`(
        '${randomUUID()}',
        '${profileId}',
        '${samplePhoto}',
        '${samplePhoto}',
        true,
        true,
        true,
        NOW()
      )`);
    }

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`
        INSERT INTO "users" (id, phone_number, email, password_hash, role, is_verified, is_active, is_dummy_user, created_at, updated_at)
        VALUES ${userRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "profiles" (
          id, user_id, display_name, gender, orientation, pronouns, outness_status, date_of_birth, height_cm,
          nationality, religion, mother_tongue, languages_spoken, marital_status, phone_number, phone_verified,
          city, state, country, education, sector, profession, annual_income, bio, diet, hobbies,
          photo_visibility, ghost_mode_enabled, created_at, updated_at
        ) VALUES ${profileRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "partner_preferences" (
          id, profile_id, preferred_genders, preferred_orientations, min_age, max_age, min_height_cm, max_height_cm, acceptable_outness, created_at, updated_at
        ) VALUES ${preferenceRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "profile_photos" (
          id, profile_id, original_url, blurred_url, is_primary, is_watermarked, is_approved, created_at
        ) VALUES ${photoRows.join(",")};
      `);
    });

    totalInserted += currentBatchSize;
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rate = Math.round(totalInserted / elapsedSec);
    const progress = ((totalInserted / TARGET_USERS) * 100).toFixed(1);

    console.log(
      `📦 [Batch ${batch}/${totalBatches}] Inserted ${totalInserted.toLocaleString()} / ${TARGET_USERS.toLocaleString()} users (${progress}%) - Rate: ${rate} users/sec`
    );
  }

  const durationMin = ((Date.now() - startTime) / 60000).toFixed(2);
  console.log(`\n🎉 Seeding complete! Inserted ${totalInserted.toLocaleString()} dummy users in ${durationMin} minutes.`);
}

runSeeder()
  .catch((e) => {
    console.error("❌ Fatal Seeder Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
