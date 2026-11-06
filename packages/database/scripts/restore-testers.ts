import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of seeded sample profile phone numbers that MUST have isDummyUser = true
const SEED_PHONE_NUMBERS = [
  "+919876543210", // Aarav Sharma
  "+919811223344", // Rohan Varma
  "+919877001122", // Ananya Sen
  "+919844556677", // Priya Nair
  "+919855667788", // Devansh Mehra
  "+919866778899", // Maya Kulkarni
  "+919871122334", // Kabir Malhotra
  "+919822334455", // Tara Deshmukh
  "+919833445566", // Sameer Joshi
  "+919899001122", // Reyansh Roy
  "+919811002233", // Vikram Sengupta
  "+447911123456", // Zaid Khan
  "+14165550199",  // Neil Fernandez
  "+919811447788", // Siddharth Bhasin
  "+919818889900", // Tenzin Dorjee
  "+919820011223", // Bhavik Shah
  "+61412345678",  // Liam O'Connor
  "+919817722334", // Aditya Kapoor
];

// Real tester accounts that MUST have isDummyUser = false
const TESTER_ACCOUNTS = [
  {
    phoneNumber: "+917760675849",
    displayName: "Steve",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    dateOfBirth: new Date("1995-06-15"),
    heightCm: 175,
    education: "Bachelor's Degree",
    degree: "B.Tech Computer Science",
    profession: "Software Engineer",
    bio: "Hey there! Looking to connect.",
    diet: "Non-Vegetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    phoneNumber: "+919999611207",
    displayName: "Tester One",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    dateOfBirth: new Date("1996-01-01"),
    heightCm: 176,
    education: "Bachelor's Degree",
    degree: "B.Tech",
    profession: "Product Specialist",
    bio: "Tester account.",
    diet: "Vegetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    phoneNumber: "+919654654289",
    displayName: "Tester Two",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    dateOfBirth: new Date("1994-04-10"),
    heightCm: 180,
    education: "Bachelor's Degree",
    degree: "B.Com",
    profession: "Finance Analyst",
    bio: "Tester account.",
    diet: "Non-Vegetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    phoneNumber: "+918154097807",
    displayName: "Tester Three",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    dateOfBirth: new Date("1993-07-22"),
    heightCm: 174,
    education: "Master's Degree",
    degree: "MBA",
    profession: "Marketing Lead",
    bio: "Tester account.",
    diet: "Vegetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    phoneNumber: "+919624587897",
    displayName: "Tester Four",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    dateOfBirth: new Date("1997-12-05"),
    heightCm: 178,
    education: "Bachelor's Degree",
    degree: "B.Des",
    profession: "UX Designer",
    bio: "Tester account.",
    diet: "Eggetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    phoneNumber: "+8809054092332",
    displayName: "Tester Five",
    gender: "MAN" as const,
    orientation: "GAY" as const,
    pronouns: "he/him",
    outnessStatus: "OUT_TO_ALL" as const,
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    dateOfBirth: new Date("1995-09-18"),
    heightCm: 172,
    education: "Bachelor's Degree",
    degree: "BBA",
    profession: "Operations Manager",
    bio: "Tester account.",
    diet: "Non-Vegetarian",
    photoVisibility: "ALL_MEMBERS" as const,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function main() {
  console.log("1. Marking all sample seed users with isDummyUser = true...");
  const dummyResult = await prisma.user.updateMany({
    where: {
      phoneNumber: { in: SEED_PHONE_NUMBERS },
    },
    data: {
      isDummyUser: true,
    },
  });
  console.log(`✓ Updated ${dummyResult.count} seed sample users to isDummyUser = true.`);

  console.log("\n2. Restoring/Upserting real tester accounts with isDummyUser = false...");
  for (const tester of TESTER_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: tester.phoneNumber },
      create: {
        phoneNumber: tester.phoneNumber,
        isVerified: true,
        isActive: true,
        isDummyUser: false,
      },
      update: {
        isVerified: true,
        isActive: true,
        isDummyUser: false,
      },
    });

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          displayName: tester.displayName,
          gender: tester.gender,
          orientation: tester.orientation,
          pronouns: tester.pronouns,
          outnessStatus: tester.outnessStatus,
          city: tester.city,
          state: tester.state,
          country: tester.country,
          dateOfBirth: tester.dateOfBirth,
          heightCm: tester.heightCm,
          education: tester.education,
          degree: tester.degree,
          profession: tester.profession,
          bio: tester.bio,
          diet: tester.diet,
          photoVisibility: tester.photoVisibility,
          ghostModeEnabled: false,
          photos: {
            create: tester.photos.map((url, idx) => ({
              originalUrl: url,
              blurredUrl: url,
              isPrimary: idx === 0,
              isApproved: true,
            })),
          },
          educations: {
            create: [
              {
                qualification: tester.education,
                degree: tester.degree,
                degreeName: tester.degree,
                institution: "University",
                year: 2018,
              },
            ],
          },
          partnerPreference: {
            create: {
              preferredGenders: ["MAN"],
              preferredOrientations: ["GAY", "BISEXUAL", "QUEER"],
              minAge: 21,
              maxAge: 45,
            },
          },
        },
      });
    } else {
      // Ensure displayName is set if was missing
      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          displayName: tester.displayName,
        },
      });
    }

    console.log(`✓ Tester restored: ${tester.displayName} (${tester.phoneNumber}) [isDummyUser = false]`);
  }

  console.log("\n3. Verifying final user counts...");
  const dummyCount = await prisma.user.count({ where: { isDummyUser: true } });
  const realCount = await prisma.user.count({ where: { isDummyUser: false } });
  console.log(`Summary: ${dummyCount} dummy users, ${realCount} real/tester users.`);
}

main()
  .catch((e) => {
    console.error("Error restoring testers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

