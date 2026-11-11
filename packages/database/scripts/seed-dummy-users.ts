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
const TARGET_USERS = 10_000; // Target: 10,000 dummy users
const BATCH_SIZE = 1_000; // 1,000 records per transaction chunk for fast reliable SQL delivery

const DEGREE_MAP: Record<string, string[]> = {
  "Doctorate / Ph.D": ["Ph.D. Computer Science", "Ph.D. Economics", "M.D. Medicine", "Ph.D. Molecular Biology"],
  "Master's Degree": ["M.Tech Software Engineering", "MBA International Business", "M.Sc Data Analytics", "LL.M International Law", "M.A. Psychology"],
  "Bachelor's Degree": ["B.Tech Computer Science", "B.Des Product Design", "B.Sc Mathematics", "B.A. Literature", "B.Com Finance", "B.Arch Architecture"],
  "Diploma": ["Diploma in Graphic Design", "Diploma in Culinary Arts", "Diploma in Web Technologies"],
  "High School": ["High School Diploma", "Senior Secondary"],
  "Other": ["Professional Certificate", "Certified Associate"],
};

const INSTITUTIONS = [
  "IIT Delhi", "IIT Bombay", "BITS Pilani", "Delhi University", "Stanford University",
  "UC Berkeley", "University of Melbourne", "University of Toronto", "Oxford University",
  "National University of Singapore", "ETH Zurich", "Indian School of Business", "London School of Economics"
];

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
  console.log(`🚀 Preparing to seed ${TARGET_USERS.toLocaleString()} dummy users using multi-row raw SQL...`);
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
    const educationRows: string[] = [];
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

      // Distinct non-routable dummy phone: +999000000001 through +999000010000
      const dummyPhone = `+999${String(globalIndex).padStart(9, "0")}`;

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
      const degreeList = DEGREE_MAP[education] || ["Graduate Degree"];
      const degree = getRandomItem(degreeList);
      const institution = getRandomItem(INSTITUTIONS);
      const gradYear = birthYear + 22 + Math.floor(Math.random() * 5);

      const diet = getRandomItem(DIETS);
      const hobbiesList = getRandomSubset(HOBBIES, 4);

      // Photo visibility: 45% ALL_MEMBERS, 35% MUTUAL_MATCHES_ONLY, 20% REQUEST_REQUIRED
      const photoRand = Math.random();
      const photoVisibility =
        photoRand < 0.45
          ? "ALL_MEMBERS"
          : photoRand < 0.80
          ? "MUTUAL_MATCHES_ONLY"
          : "REQUEST_REQUIRED";
      const samplePhoto = getRandomItem(PHOTO_URLS);

      // User SQL Row: id, phone_number, is_verified, is_active, is_dummy_user, created_at, updated_at
      userRows.push(`(
        '${userId}',
        '${dummyPhone}',
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
        ${formatSqlArray(["English", "Hindi"])},
        ${escapeSql(marital)},
        ${escapeSql(dummyPhone)},
        ${escapeSql(loc.city)},
        ${escapeSql(loc.state)},
        ${escapeSql(loc.country)},
        ${escapeSql(education)},
        ${escapeSql(degree)},
        ${escapeSql(sector)},
        ${escapeSql(profession)},
        NULL,
        '₹15 Lakh - ₹25 Lakh',
        'Excited to connect with genuine, like-minded people on EverPride.',
        ${escapeSql(diet)},
        'Socially',
        'Never',
        'Dog lover',
        ${formatSqlArray(hobbiesList)},
        '${photoVisibility}',
        false,
        NOW(),
        NOW()
      )`);

      // Profile Education SQL Row
      educationRows.push(`(
        '${randomUUID()}',
        '${profileId}',
        ${escapeSql(education)},
        ${escapeSql(degree)},
        ${escapeSql(degree)},
        NULL,
        ${escapeSql(institution)},
        ${gradYear},
        NOW()
      )`);

      // Preference SQL Row: id, profile_id, preferred_genders, preferred_orientations, min_age, max_age, max_distance_km, created_at, updated_at
      preferenceRows.push(`(
        '${randomUUID()}',
        '${profileId}',
        '{MAN,WOMAN,NON_BINARY}',
        '{GAY,LESBIAN,QUEER,BISEXUAL}',
        21,
        55,
        NULL,
        NOW(),
        NOW()
      )`);

      // Photo SQL Row: id, profile_id, original_url, blurred_url, is_primary, is_watermarked, is_approved, created_at
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
        INSERT INTO "users" (id, phone_number, is_verified, is_active, is_dummy_user, created_at, updated_at)
        VALUES ${userRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "profiles" (
          id, user_id, display_name, gender, orientation, pronouns, outness_status, date_of_birth, height_cm,
          nationality, religion, mother_tongue, languages_spoken, marital_status, phone_number,
          city, state, country, education, degree, sector, profession, company, annual_income, bio, diet,
          drinking, smoking, pets, hobbies, photo_visibility, ghost_mode_enabled, created_at, updated_at
        ) VALUES ${profileRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "profile_educations" (
          id, profile_id, qualification, degree, degree_name, major, institution, year, created_at
        ) VALUES ${educationRows.join(",")};
      `);

      await tx.$executeRawUnsafe(`
        INSERT INTO "partner_preferences" (
          id, profile_id, preferred_genders, preferred_orientations, min_age, max_age, max_distance_km, created_at, updated_at
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
    const rate = Math.round(totalInserted / (elapsedSec || 1));
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
