import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing records...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.matchInterest.deleteMany();
  await prisma.photoAccessRequest.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.partnerPreference.deleteMany();
  await prisma.profilePhoto.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding sample users with phone numbers...");

  const usersData = [
    // 0: Aarav Sharma (Default logged in user)
    {
      phoneNumber: "+919876543210",
      profile: {
        displayName: "Aarav Sharma",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1996-05-14"),
        heightCm: 178,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Hindi",
        languagesSpoken: ["Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919876543210",
        phoneVerified: true,
        backupEmail: "aarav.backup@example.com",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        education: "Master's Degree",
        degree: "M.Tech Software Engineering",
        sector: "Private / IT",
        profession: "Senior Product Architect",
        annualIncome: "₹25 Lakh - ₹35 Lakh",
        bio: "Tech lead by day, filter-coffee lover and weekend road-tripper. Believer in mutual respect, clear communication, and progressive queer families.",
        diet: "Vegetarian",
        hobbies: ["Photography", "Running", "Hiking", "Cooking"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "NON_BINARY" as const, "TRANS_MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const, "QUEER" as const],
          minAge: 22,
          maxAge: 40,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 1: Rohan Varma
    {
      phoneNumber: "+919811223344",
      profile: {
        displayName: "Rohan Varma",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/they",
        outnessStatus: "OUT_TO_SELECT_FEW" as const,
        dateOfBirth: new Date("1995-11-20"),
        heightCm: 182,
        nationality: "India",
        religion: "Spiritual but not religious",
        motherTongue: "English",
        languagesSpoken: ["English", "Hindi", "Marathi"],
        maritalStatus: "Never Married",
        phoneNumber: "+919811223344",
        phoneVerified: true,
        backupEmail: "rohan.v@example.com",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        education: "Bachelor's Degree",
        degree: "B.Des Product Design (NID)",
        sector: "Design / Creative",
        profession: "UI/UX Design Director",
        annualIncome: "₹20 Lakh - ₹30 Lakh",
        bio: "Passionate about typography, art exhibitions, indie cinema, and cozy terrace dinners. Looking for a genuine life partner to build a kind home together.",
        diet: "Eggetarian",
        hobbies: ["Art & Exhibitions", "Cinema", "Reading", "Yoga"],
        photoVisibility: "REQUEST_REQUIRED" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "NON_BINARY" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 25,
          maxAge: 36,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const, "DISCREET_NOT_OUT" as const],
        },
      },
    },

    // 2: Ananya Sen
    {
      phoneNumber: "+919877001122",
      profile: {
        displayName: "Ananya Sen",
        gender: "WOMAN" as const,
        orientation: "LESBIAN" as const,
        pronouns: "she/her",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1997-03-08"),
        heightCm: 165,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Bengali",
        languagesSpoken: ["Bengali", "English", "Hindi"],
        maritalStatus: "Never Married",
        phoneNumber: "+919877001122",
        phoneVerified: true,
        backupEmail: "ananya.sen@example.com",
        city: "Kolkata",
        state: "West Bengal",
        country: "India",
        education: "Master's Degree",
        degree: "M.A. Comparative Literature",
        sector: "Education / Research",
        profession: "Assistant Professor & Writer",
        annualIncome: "₹12 Lakh - ₹18 Lakh",
        bio: "Books, poetry, feminist debates, and warm herbal tea. Seeking a thoughtful, authentic partnership based on equality and deep connection.",
        diet: "Non-Vegetarian",
        hobbies: ["Literature", "Poetry", "Gardening", "Baking"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["WOMAN" as const],
          preferredOrientations: ["LESBIAN" as const, "BISEXUAL" as const, "QUEER" as const],
          minAge: 23,
          maxAge: 33,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 3: Priya Nair
    {
      phoneNumber: "+919844556677",
      profile: {
        displayName: "Priya Nair",
        gender: "WOMAN" as const,
        orientation: "LESBIAN" as const,
        pronouns: "she/her",
        outnessStatus: "OUT_TO_SELECT_FEW" as const,
        dateOfBirth: new Date("1994-09-15"),
        heightCm: 168,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Malayalam",
        languagesSpoken: ["Malayalam", "English", "Tamil"],
        maritalStatus: "Never Married",
        phoneNumber: "+919844556677",
        phoneVerified: true,
        backupEmail: "priya.nair@example.com",
        city: "Kochi",
        state: "Kerala",
        country: "India",
        education: "Doctorate / PhD",
        degree: "MD Internal Medicine",
        sector: "Healthcare",
        profession: "Consultant Physician",
        annualIncome: "₹20 Lakh - ₹30 Lakh",
        bio: "Dedicated healthcare professional who loves coastal sunsets, classical Carnatic music, and quiet Sunday brunches. Value emotional maturity and mutual support.",
        diet: "Pescatarian",
        hobbies: ["Classical Music", "Running", "Swimming", "Travel"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["WOMAN" as const],
          preferredOrientations: ["LESBIAN" as const, "BISEXUAL" as const],
          minAge: 26,
          maxAge: 35,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 4: Devansh Mehra
    {
      phoneNumber: "+919855667788",
      profile: {
        displayName: "Devansh Mehra",
        gender: "TRANS_MAN" as const,
        orientation: "QUEER" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1995-01-25"),
        heightCm: 172,
        nationality: "India",
        religion: "Sikhism",
        motherTongue: "Punjabi",
        languagesSpoken: ["Punjabi", "Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919855667788",
        phoneVerified: true,
        backupEmail: "devansh.m@example.com",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        education: "Bachelor's Degree",
        degree: "B.Tech Computer Science",
        sector: "Finance / FinTech",
        profession: "FinTech Systems Architect",
        annualIncome: "₹30 Lakh - ₹40 Lakh",
        bio: "Proud trans man, marathon runner, and fitness enthusiast. Looking for a loyal, open-minded life partner to celebrate every step of life with.",
        diet: "Non-Vegetarian",
        hobbies: ["Weightlifting", "Marathons", "Gaming", "Podcasts"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "WOMAN" as const, "TRANS_WOMAN" as const, "NON_BINARY" as const],
          preferredOrientations: ["QUEER" as const, "BISEXUAL" as const, "PANSEXUAL" as const],
          minAge: 24,
          maxAge: 35,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 5: Maya Kulkarni
    {
      phoneNumber: "+919866778899",
      profile: {
        displayName: "Maya Kulkarni",
        gender: "TRANS_WOMAN" as const,
        orientation: "BISEXUAL" as const,
        pronouns: "she/her",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1996-08-12"),
        heightCm: 174,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Marathi",
        languagesSpoken: ["Marathi", "Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919866778899",
        phoneVerified: true,
        backupEmail: "maya.k@example.com",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        education: "Master's Degree",
        degree: "MBA Marketing",
        sector: "Corporate / Retail",
        profession: "Brand Strategy Lead",
        annualIncome: "₹18 Lakh - ₹25 Lakh",
        bio: "Fashion enthusiast, coffee aficionado, and animal rescuer with two rescued cats. Seeking a caring and forward-thinking life partner.",
        diet: "Vegetarian",
        hobbies: ["Fashion & Styling", "Animal Welfare", "Baking", "Interior Design"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "TRANS_MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const, "QUEER" as const],
          minAge: 25,
          maxAge: 37,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 6: Kabir Malhotra
    {
      phoneNumber: "+919871122334",
      profile: {
        displayName: "Kabir Malhotra",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1993-06-18"),
        heightCm: 180,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Hindi",
        languagesSpoken: ["Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919871122334",
        phoneVerified: true,
        backupEmail: "kabir.m@example.com",
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        education: "Master's Degree",
        degree: "MBA Finance (IIM Bangalore)",
        sector: "Private / Consulting",
        profession: "Management Consultant",
        annualIncome: "₹35 Lakh - ₹50 Lakh",
        bio: "Strategist at work, home chef on weekends. Passionate about architecture, specialty coffees, and deep conversations under fairy lights.",
        diet: "Non-Vegetarian",
        hobbies: ["Cooking", "Tennis", "Travel", "Coffee Brewing"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const],
          minAge: 26,
          maxAge: 36,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 7: Tara Deshmukh
    {
      phoneNumber: "+919822334455",
      profile: {
        displayName: "Tara Deshmukh",
        gender: "WOMAN" as const,
        orientation: "BISEXUAL" as const,
        pronouns: "she/her",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1995-12-04"),
        heightCm: 167,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Marathi",
        languagesSpoken: ["Marathi", "Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919822334455",
        phoneVerified: true,
        backupEmail: "tara.deshmukh@example.com",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        education: "Master's Degree",
        degree: "Master in Fine Arts",
        sector: "Media & Arts",
        profession: "Contemporary Art Curator",
        annualIncome: "₹15 Lakh - ₹22 Lakh",
        bio: "Curating indie art spaces and storytelling galleries. Nature walks, jazz records, and handwritten letters make my day.",
        diet: "Vegetarian",
        hobbies: ["Art & Exhibitions", "Jazz", "Pottery", "Cycling"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["WOMAN" as const, "NON_BINARY" as const],
          preferredOrientations: ["LESBIAN" as const, "BISEXUAL" as const, "QUEER" as const],
          minAge: 25,
          maxAge: 34,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 8: Sameer Joshi
    {
      phoneNumber: "+919833445566",
      profile: {
        displayName: "Sameer Joshi",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_SELECT_FEW" as const,
        dateOfBirth: new Date("1994-04-10"),
        heightCm: 176,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Gujarati",
        languagesSpoken: ["Gujarati", "Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919833445566",
        phoneVerified: true,
        backupEmail: "sameer.j@example.com",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        education: "Bachelor's Degree",
        degree: "Chartered Accountant (CA)",
        sector: "Finance / Accounting",
        profession: "Partner, Audit & Advisory",
        annualIncome: "₹28 Lakh - ₹38 Lakh",
        bio: "Numbers during the day, theatre and acoustic guitar by night. Honest, grounded, and looking for a meaningful queer matrimonial bond.",
        diet: "Vegetarian",
        hobbies: ["Theatre", "Acoustic Guitar", "Badminton", "Reading"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 27,
          maxAge: 35,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 9: Reyansh Roy
    {
      phoneNumber: "+919899001122",
      profile: {
        displayName: "Reyansh Roy",
        gender: "NON_BINARY" as const,
        orientation: "QUEER" as const,
        pronouns: "they/them",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1998-02-14"),
        heightCm: 170,
        nationality: "India",
        religion: "Spiritual but not religious",
        motherTongue: "Bengali",
        languagesSpoken: ["Bengali", "English", "Hindi"],
        maritalStatus: "Never Married",
        phoneNumber: "+919899001122",
        phoneVerified: true,
        backupEmail: "reyansh.roy@example.com",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        education: "Master's Degree",
        degree: "M.S. Human-Computer Interaction",
        sector: "Private / IT",
        profession: "Lead UX Researcher",
        annualIncome: "₹22 Lakh - ₹32 Lakh",
        bio: "Designing accessible digital experiences. Avid board-gamer, comic collector, and plant parent. Seeking mutual kindness and queer joy.",
        diet: "Vegan",
        hobbies: ["Board Games", "Plant Care", "Sci-Fi", "Baking"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "WOMAN" as const, "NON_BINARY" as const, "TRANS_MAN" as const, "TRANS_WOMAN" as const],
          preferredOrientations: ["QUEER" as const, "PANSEXUAL" as const, "BISEXUAL" as const],
          minAge: 23,
          maxAge: 34,
          acceptableOutness: ["OUT_TO_ALL" as const],
        },
      },
    },

    // 10: Vikram Sengupta
    {
      phoneNumber: "+919811002233",
      profile: {
        displayName: "Vikram Sengupta",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1992-09-30"),
        heightCm: 183,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Bengali",
        languagesSpoken: ["Bengali", "English", "Hindi"],
        maritalStatus: "Never Married",
        phoneNumber: "+919811002233",
        phoneVerified: true,
        backupEmail: "vikram.s@example.com",
        city: "Kolkata",
        state: "West Bengal",
        country: "India",
        education: "Master's Degree",
        degree: "LL.M International Human Rights",
        sector: "Legal / Policy",
        profession: "Senior Legal Counsel",
        annualIncome: "₹30 Lakh - ₹45 Lakh",
        bio: "Human rights advocate, vinyl enthusiast, and heritage walk guide. Looking for an empathetic partner with a strong moral compass.",
        diet: "Non-Vegetarian",
        hobbies: ["History", "Heritage Walks", "Vinyl Records", "Chess"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 28,
          maxAge: 38,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 11: Zaid Khan (UK citizen / NRI)
    {
      phoneNumber: "+447911123456",
      profile: {
        displayName: "Zaid Khan",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1993-08-14"),
        heightCm: 181,
        nationality: "United Kingdom",
        religion: "Islam",
        motherTongue: "Urdu",
        languagesSpoken: ["English", "Urdu", "Hindi"],
        maritalStatus: "Never Married",
        phoneNumber: "+447911123456",
        phoneVerified: true,
        backupEmail: "zaid.k@example.com",
        city: "London",
        state: "Greater London",
        country: "United Kingdom",
        education: "Master's Degree",
        degree: "MSc Data Science (UCL)",
        sector: "Private / IT",
        profession: "Principal AI Scientist",
        annualIncome: "£90,000 - £120,000",
        bio: "London-based tech enthusiast who loves indie film festivals, weekend cycling along the Thames, and culinary experiments.",
        diet: "Halal",
        hobbies: ["Cycling", "Cinema", "Data Science", "Cooking"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const],
          minAge: 26,
          maxAge: 36,
          acceptableOutness: ["OUT_TO_ALL" as const],
        },
      },
    },

    // 12: Neil Fernandez (Canadian / Catholic / Divorced)
    {
      phoneNumber: "+14165550199",
      profile: {
        displayName: "Neil Fernandez",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1989-10-05"),
        heightCm: 179,
        nationality: "Canada",
        religion: "Christianity",
        motherTongue: "English",
        languagesSpoken: ["English", "French"],
        maritalStatus: "Divorced",
        phoneNumber: "+14165550199",
        phoneVerified: true,
        backupEmail: "neil.fernandez@example.com",
        city: "Toronto",
        state: "Ontario",
        country: "Canada",
        education: "Bachelor's Degree",
        degree: "B.Arch Architecture",
        sector: "Architecture / Design",
        profession: "Senior Urban Planner",
        annualIncome: "CAD $110,000 - $140,000",
        bio: "Passionate about sustainable architecture, mountain hiking, acoustic folk gigs, and thoughtful dinner talks. Ready for a stable, lasting companion.",
        diet: "Non-Vegetarian",
        hobbies: ["Hiking", "Woodworking", "Architecture", "Photography"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 28,
          maxAge: 42,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 13: Siddharth Bhasin (Delhi / Sikhism / Divorced)
    {
      phoneNumber: "+919811447788",
      profile: {
        displayName: "Siddharth Bhasin",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_SELECT_FEW" as const,
        dateOfBirth: new Date("1991-03-22"),
        heightCm: 185,
        nationality: "India",
        religion: "Sikhism",
        motherTongue: "Punjabi",
        languagesSpoken: ["Punjabi", "Hindi", "English"],
        maritalStatus: "Divorced",
        phoneNumber: "+919811447788",
        phoneVerified: true,
        backupEmail: "sid.bhasin@example.com",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        education: "Master's Degree",
        degree: "M.Com & CFA",
        sector: "Banking / Investment",
        profession: "Vice President, Equity Research",
        annualIncome: "₹45 Lakh - ₹60 Lakh",
        bio: "Finance professional who enjoys classical music concerts, marathon training, and rooftop barbecue nights. Looking for a genuine, mutual bond.",
        diet: "Non-Vegetarian",
        hobbies: ["Running", "Travel", "Squash", "Cooking"],
        photoVisibility: "REQUEST_REQUIRED" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const],
          minAge: 27,
          maxAge: 38,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 14: Tenzin Dorjee (Buddhism / Artist)
    {
      phoneNumber: "+919818889900",
      profile: {
        displayName: "Tenzin Dorjee",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1996-07-19"),
        heightCm: 175,
        nationality: "India",
        religion: "Buddhism",
        motherTongue: "Tibetan",
        languagesSpoken: ["Tibetan", "English", "Hindi"],
        maritalStatus: "Never Married",
        phoneNumber: "+919818889900",
        phoneVerified: true,
        backupEmail: "tenzin.d@example.com",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        education: "Bachelor's Degree",
        degree: "BFA Visual Communication",
        sector: "Media & Design",
        profession: "Creative Illustrator & Animator",
        annualIncome: "₹16 Lakh - ₹24 Lakh",
        bio: "Illustrator inspired by mountain flora, mindfulness, and retro synth music. Looking for warm laughter, mutual artistic support, and honesty.",
        diet: "Vegetarian",
        hobbies: ["Painting", "Meditation", "Cycling", "Animation"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const, "NON_BINARY" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 24,
          maxAge: 35,
          acceptableOutness: ["OUT_TO_ALL" as const],
        },
      },
    },

    // 15: Bhavik Shah (Jainism / Mumbai)
    {
      phoneNumber: "+919820011223",
      profile: {
        displayName: "Bhavik Shah",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1994-12-11"),
        heightCm: 177,
        nationality: "India",
        religion: "Jainism",
        motherTongue: "Gujarati",
        languagesSpoken: ["Gujarati", "Hindi", "English"],
        maritalStatus: "Never Married",
        phoneNumber: "+919820011223",
        phoneVerified: true,
        backupEmail: "bhavik.shah@example.com",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        education: "Master's Degree",
        degree: "MS Supply Chain & Logistics",
        sector: "Logistics / Supply Chain",
        profession: "Operations Director",
        annualIncome: "₹26 Lakh - ₹36 Lakh",
        bio: "Rooted in Jain values with a progressive queer mindset. Enthusiastic trekker, avid reader, and home cook.",
        diet: "Vegetarian",
        hobbies: ["Trekking", "Reading", "Swimming", "Badminton"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const],
          minAge: 25,
          maxAge: 35,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },

    // 16: Liam O'Connor (Australian Citizen / Melbourne / Secular)
    {
      phoneNumber: "+61412345678",
      profile: {
        displayName: "Liam O'Connor",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1995-04-18"),
        heightCm: 184,
        nationality: "Australia",
        religion: "Atheist / Agnostic",
        motherTongue: "English",
        languagesSpoken: ["English"],
        maritalStatus: "Never Married",
        phoneNumber: "+61412345678",
        phoneVerified: true,
        backupEmail: "liam.oc@example.com",
        city: "Melbourne",
        state: "Victoria",
        country: "Australia",
        education: "Doctorate / PhD",
        degree: "PhD Environmental Science",
        sector: "Renewables & Climate",
        profession: "Senior Climate Policy Advisor",
        annualIncome: "AUD $125,000 - $155,000",
        bio: "Climate scientist working on renewable transition. Lover of specialty pour-overs, coastal camping, and warm discussions.",
        diet: "Pescatarian",
        hobbies: ["Surfing", "Camping", "Specialty Coffee", "Podcast Hosting"],
        photoVisibility: "ALL_MEMBERS" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "QUEER" as const],
          minAge: 25,
          maxAge: 38,
          acceptableOutness: ["OUT_TO_ALL" as const],
        },
      },
    },

    // 17: Aditya Kapoor (Widowed / Chandigarh)
    {
      phoneNumber: "+919817722334",
      profile: {
        displayName: "Aditya Kapoor",
        gender: "MAN" as const,
        orientation: "GAY" as const,
        pronouns: "he/him",
        outnessStatus: "OUT_TO_ALL" as const,
        dateOfBirth: new Date("1988-08-27"),
        heightCm: 178,
        nationality: "India",
        religion: "Hinduism",
        motherTongue: "Hindi",
        languagesSpoken: ["Hindi", "English", "Punjabi"],
        maritalStatus: "Widowed",
        phoneNumber: "+919817722334",
        phoneVerified: true,
        backupEmail: "aditya.k@example.com",
        city: "Chandigarh",
        state: "Chandigarh",
        country: "India",
        education: "Master's Degree",
        degree: "M.D. Pediatrics",
        sector: "Healthcare",
        profession: "Pediatric Specialist",
        annualIncome: "₹32 Lakh - ₹45 Lakh",
        bio: "Gentle soul, doctor, and gardener. Seeking a resilient and sincere soulmate for life's second chapter with deep love and mutual respect.",
        diet: "Vegetarian",
        hobbies: ["Gardening", "Violin", "Reading", "Baking"],
        photoVisibility: "MUTUAL_MATCHES_ONLY" as const,
        ghostModeEnabled: false,
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        ],
        partnerPreference: {
          preferredGenders: ["MAN" as const],
          preferredOrientations: ["GAY" as const, "BISEXUAL" as const],
          minAge: 28,
          maxAge: 44,
          acceptableOutness: ["OUT_TO_ALL" as const, "OUT_TO_SELECT_FEW" as const],
        },
      },
    },
  ];

  const createdUsers: any[] = [];

  for (const item of usersData) {
    const user = await prisma.user.create({
      data: {
        phoneNumber: item.phoneNumber,
        isVerified: true,
        isActive: true,
      },
    });

    const { photos, partnerPreference, ...profileData } = item.profile;

    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        userId: user.id,
        photos: {
          create: photos.map((url, idx) => ({
            originalUrl: url,
            blurredUrl: url,
            isPrimary: idx === 0,
            isApproved: true,
          })),
        },
        partnerPreference: {
          create: partnerPreference,
        },
      },
    });

    createdUsers.push({ user, profile });
    console.log(`✓ Seeded user: ${item.profile.displayName} (${item.phoneNumber})`);
  }

  // ─────────────────────────────────────────────────────────────
  // Seed Matches, Interests & Unblur Requests
  // ─────────────────────────────────────────────────────────────
  const aarav = createdUsers[0].user;      // +919876543210 (Logged in test user)
  const rohan = createdUsers[1].user;      // PENDING Received Interest & Unblur
  const devansh = createdUsers[4].user;    // They Declined Interest, I Accepted Unblur
  const kabir = createdUsers[6].user;      // PENDING Sent Interest & Unblur
  const sameer = createdUsers[8].user;     // I Declined Interest & Unblur
  const vikram = createdUsers[10].user;    // Match (ACCEPTED Interest) & They Accepted Unblur
  const zaid = createdUsers[11].user;      // UK NRI user - Received Interest
  const neil = createdUsers[12].user;      // Canadian - Sent Interest
  const sid = createdUsers[13].user;       // Delhi - Match (ACCEPTED)
  const tenzin = createdUsers[14].user;    // Buddhist - Received Interest
  const bhavik = createdUsers[15].user;    // Jain - Sent Interest
  const liam = createdUsers[16].user;      // Australian - They Declined Unblur
  const aditya = createdUsers[17].user;    // Widowed - Match (ACCEPTED)

  console.log("Seeding Interests and Matches...");

  // 1. RECEIVED INTERESTS (Pending):
  // Rohan -> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: rohan.id,
      receiverId: aarav.id,
      status: "PENDING",
      message: "Hi Aarav, your profile and values really resonate with me! Would love to connect.",
    },
  });

  // Zaid -> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: zaid.id,
      receiverId: aarav.id,
      status: "PENDING",
      message: "Hello Aarav! Visiting Bengaluru next month, would love to get to know you.",
    },
  });

  // Tenzin -> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: tenzin.id,
      receiverId: aarav.id,
      status: "PENDING",
      message: "Hey! Loved your love for hiking and filter coffee. Let's talk!",
    },
  });
  console.log("✓ Seeded 3 Received interests (PENDING)");

  // 2. SENT INTERESTS (Pending):
  // Aarav -> Kabir
  await prisma.matchInterest.create({
    data: {
      senderId: aarav.id,
      receiverId: kabir.id,
      status: "PENDING",
      message: "Hi Kabir, love your passion for architecture and cooking. Let's talk!",
    },
  });

  // Aarav -> Neil
  await prisma.matchInterest.create({
    data: {
      senderId: aarav.id,
      receiverId: neil.id,
      status: "PENDING",
      message: "Hey Neil, fellow outdoor lover here! Would love to connect across timezones.",
    },
  });

  // Aarav -> Bhavik
  await prisma.matchInterest.create({
    data: {
      senderId: aarav.id,
      receiverId: bhavik.id,
      status: "PENDING",
      message: "Hi Bhavik, love your grounding and outlook on life.",
    },
  });
  console.log("✓ Seeded 3 Sent interests (PENDING)");

  // 3. I DECLINED:
  // Sameer -> Aarav (Aarav declined)
  await prisma.matchInterest.create({
    data: {
      senderId: sameer.id,
      receiverId: aarav.id,
      status: "DECLINED",
      message: "Hello Aarav, thought we share similar life goals.",
    },
  });
  console.log("✓ Seeded I Declined (DECLINED by Aarav)");

  // 4. THEY DECLINED:
  // Aarav -> Devansh (Devansh declined)
  await prisma.matchInterest.create({
    data: {
      senderId: aarav.id,
      receiverId: devansh.id,
      status: "DECLINED",
      message: "Hey Devansh, great to see a fellow runner! Would love to get to know you.",
    },
  });
  console.log("✓ Seeded They Declined (DECLINED by Devansh)");

  // 5. MUTUAL MATCHES (ACCEPTED Interests):
  // Vikram <-> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: vikram.id,
      receiverId: aarav.id,
      status: "ACCEPTED",
      message: "Looking forward to speaking with you Aarav!",
    },
  });

  // Sid <-> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: aarav.id,
      receiverId: sid.id,
      status: "ACCEPTED",
      message: "Hi Siddharth, happy to connect on EverPride!",
    },
  });

  // Aditya <-> Aarav
  await prisma.matchInterest.create({
    data: {
      senderId: aditya.id,
      receiverId: aarav.id,
      status: "ACCEPTED",
      message: "Pleasure to connect with you, Aarav.",
    },
  });
  console.log("✓ Seeded 3 Mutual Matches (ACCEPTED)");

  // Auto-seed active Conversations for Accepted matches
  const p1a = vikram.id < aarav.id ? vikram.id : aarav.id;
  const p2a = vikram.id < aarav.id ? aarav.id : vikram.id;
  const conv1 = await prisma.conversation.create({
    data: {
      participant1Id: p1a,
      participant2Id: p2a,
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: vikram.id,
      content: "Hi Aarav! Wonderful to match here. How was your week?",
    },
  });

  const p1b = sid.id < aarav.id ? sid.id : aarav.id;
  const p2b = sid.id < aarav.id ? aarav.id : sid.id;
  const conv2 = await prisma.conversation.create({
    data: {
      participant1Id: p1b,
      participant2Id: p2b,
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: aarav.id,
      content: "Hello Siddharth! Great to connect with you.",
    },
  });
  console.log("✓ Seeded Conversations & initial messages for mutual matches");

  // ─────────────────────────────────────────────────────────────
  // Seed Photo Access Requests (Unblur) covering all 6 states
  // ─────────────────────────────────────────────────────────────
  console.log("Seeding Unblur / Photo Access requests...");

  // 1. Unblur Received (PENDING): Rohan requested Aarav's photos
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: rohan.id,
      targetId: aarav.id,
      status: "PENDING",
    },
  });

  // Zaid requested Aarav's photos
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: zaid.id,
      targetId: aarav.id,
      status: "PENDING",
    },
  });
  console.log("✓ Seeded Unblur Received (PENDING)");

  // 2. Unblur Sent (PENDING): Aarav requested Kabir's photos
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: aarav.id,
      targetId: kabir.id,
      status: "PENDING",
    },
  });

  // Aarav requested Neil's photos
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: aarav.id,
      targetId: neil.id,
      status: "PENDING",
    },
  });
  console.log("✓ Seeded Unblur Sent (PENDING)");

  // 3. Unblur I Accepted: Devansh requested Aarav's photos, Aarav accepted
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: devansh.id,
      targetId: aarav.id,
      status: "ACCEPTED",
    },
  });
  console.log("✓ Seeded Unblur I Accepted (ACCEPTED by Aarav)");

  // 4. Unblur They Accepted: Aarav requested Vikram's photos, Vikram accepted
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: aarav.id,
      targetId: vikram.id,
      status: "ACCEPTED",
    },
  });

  // Aarav requested Sid's photos, Sid accepted
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: aarav.id,
      targetId: sid.id,
      status: "ACCEPTED",
    },
  });
  console.log("✓ Seeded Unblur They Accepted (ACCEPTED by target)");

  // 5. Unblur I Declined: Sameer requested Aarav's photos, Aarav declined
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: sameer.id,
      targetId: aarav.id,
      status: "DECLINED",
    },
  });
  console.log("✓ Seeded Unblur I Declined (DECLINED by Aarav)");

  // 6. Unblur They Declined: Aarav requested Liam's photos, Liam declined
  await prisma.photoAccessRequest.create({
    data: {
      requesterId: aarav.id,
      targetId: liam.id,
      status: "DECLINED",
    },
  });
  console.log("✓ Seeded Unblur They Declined (DECLINED by target)");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
