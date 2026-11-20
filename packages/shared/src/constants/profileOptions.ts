import { Gender, Orientation, OutnessStatus, PhotoVisibility } from "../enums.js";

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Man", value: "MAN" },
  { label: "Woman", value: "WOMAN" },
  { label: "Non-Binary", value: "NON_BINARY" },
  { label: "Trans Man", value: "TRANS_MAN" },
  { label: "Trans Woman", value: "TRANS_WOMAN" },
  { label: "Genderqueer", value: "GENDERQUEER" },
  { label: "Agender", value: "AGENDER" },
  { label: "Other", value: "OTHER" },
];

export const ORIENTATION_OPTIONS: { label: string; value: Orientation }[] = [
  { label: "Gay", value: "GAY" },
  { label: "Lesbian", value: "LESBIAN" },
  { label: "Bisexual", value: "BISEXUAL" },
  { label: "Pansexual", value: "PANSEXUAL" },
  { label: "Queer", value: "QUEER" },
  { label: "Asexual", value: "ASEXUAL" },
  { label: "Demisexual", value: "DEMISEXUAL" },
  { label: "Other", value: "OTHER" },
];

export const OUTNESS_OPTIONS: { id: OutnessStatus; label: string }[] = [
  { id: "OUT_TO_ALL", label: "Yes, openly" },
  { id: "OUT_TO_SELECT_FEW", label: "Only to some" },
  { id: "DISCREET_NOT_OUT", label: "No" },
];

export const MARITAL_STATUS_OPTIONS: { id: string; desc: string }[] = [
  { id: "Never Married", desc: "Single, never legally or ritually married." },
  { id: "Divorced", desc: "Previously married, legally separated/divorced." },
  { id: "Widowed", desc: "Spouse has passed away." },
  { id: "Awaiting Divorce", desc: "Divorce proceedings currently underway." },
  { id: "Annulled", desc: "Previous marriage was officially annulled." },
];

export const QUALIFICATION_OPTIONS: string[] = [
  "Doctorate / Ph.D",
  "Master's Degree",
  "Bachelor's Degree",
  "Diploma",
  "High School",
  "Other",
];

export const DEGREE_OPTIONS_BY_QUALIFICATION: Record<string, string[]> = {
  "Doctorate / Ph.D": [
    "Ph.D (Doctor of Philosophy)",
    "Professional Doctorate (Ed.D, DBA, Psy.D)",
    "Medical Doctorate (M.D. / D.M. / M.S. / MBBS Specialist)",
    "Doctor of Science (D.Sc / Sc.D)",
    "Doctor of Laws (LL.D / S.J.D / J.S.D)",
    "Doctor of Pharmacy (Pharm.D)",
    "Post-Doctoral Fellow",
    "Other Doctorate",
  ],
  "Master's Degree": [
    "M.S. / M.Sc / M.Tech (Science & Engineering)",
    "MBA (Master of Business Administration)",
    "M.A. (Master of Arts / Humanities)",
    "M.Eng (Master of Engineering)",
    "M.Com / M.Fin (Commerce & Finance)",
    "MCA / M.S. IT (Computer Science & IT)",
    "M.D. / M.S. / MDS (Medicine & Dental Surgery)",
    "LL.M (Master of Laws)",
    "M.Des (Master of Design)",
    "M.Arch (Master of Architecture)",
    "M.Ed (Education)",
    "M.P.A. / M.P.P. (Public Admin & Policy)",
    "M.P.H. (Public Health)",
    "M.S.W. (Social Work)",
    "Other Master's",
  ],
  "Bachelor's Degree": [
    "B.S. / B.Sc / B.Tech / B.E. (Science, Engineering & Tech)",
    "B.A. (Bachelor of Arts / Humanities)",
    "B.B.A. / B.Com / B.M.S. (Business, Commerce & Management)",
    "B.C.A. / B.S. IT (Computer Applications & IT)",
    "M.D. / M.B.B.S. (Medicine & Surgery - Primary Medical Degree)",
    "B.D.S. (Dental Surgery)",
    "B.Pharm (Pharmacy)",
    "LL.B / J.D. (Law)",
    "B.Arch (Architecture)",
    "B.Des / B.F.A. (Design & Fine Arts)",
    "B.Ed (Education)",
    "B.S.N. / B.Sc Nursing (Nursing)",
    "B.H.M. (Hospitality & Hotel Management)",
    "B.J. / B.M.C. (Journalism & Communication)",
    "Other Bachelor's",
  ],
  "Diploma": [
    "Associate Degree (A.A. / A.S. / A.A.S.)",
    "Post-Graduate Diploma (PGD / PGCert)",
    "Technical / Engineering Diploma",
    "Vocational / Trade Certificate (ITI / Apprenticeship)",
    "Diploma in Computing / IT",
    "Diploma in Nursing / Healthcare",
    "Diploma in Business / Management",
    "Diploma in Design / Media",
    "Other Diploma / Certificate",
  ],
  "High School": [
    "High School Diploma / Secondary Certificate",
    "Higher Secondary / 12th Standard",
    "IB (International Baccalaureate)",
    "Cambridge / A-Levels / IGCSE",
    "Other High School",
  ],
  "Other": [
    "Chartered / Certified Accountant (CPA, CA, ACCA)",
    "Chartered Financial Analyst (CFA / FRM)",
    "Professional Certification / License (PMP, Bar, Board)",
    "Self-Taught / Alternative Education",
    "Other Qualification",
  ],
};

export function getDegreesForQualification(qualification?: string): string[] {
  if (!qualification) return DEGREE_OPTIONS_BY_QUALIFICATION["Bachelor's Degree"];
  return (
    DEGREE_OPTIONS_BY_QUALIFICATION[qualification] ||
    DEGREE_OPTIONS_BY_QUALIFICATION["Bachelor's Degree"] ||
    []
  );
}

export const DEGREE_OPTIONS: string[] = Array.from(
  new Set(Object.values(DEGREE_OPTIONS_BY_QUALIFICATION).flat())
);

export const SECTOR_OPTIONS: string[] = [
  "Private / IT",
  "Finance & Banking",
  "Healthcare & Medicine",
  "Education & Academia",
  "Government / PSU",
  "Business / Entrepreneur",
  "Media & Creative",
  "Legal & Law",
  "Other",
];

export const RELIGION_OPTIONS: string[] = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Folk Religion / Shinto / Taoism",
  "Sikhism",
  "Judaism",
  "Jainism",
  "Baháʼí",
  "Spiritual but not religious",
  "Atheist / Agnostic",
  "Other",
];

export const LANGUAGE_OPTIONS: string[] = [
  "Amharic",
  "Arabic",
  "Bengali",
  "Bhojpuri",
  "Burmese",
  "Dutch",
  "English",
  "Farsi (Persian)",
  "French",
  "German",
  "Gujarati",
  "Hausa",
  "Hindi",
  "Indonesian",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Korean",
  "Maithili",
  "Malay",
  "Malayalam",
  "Mandarin Chinese",
  "Marathi",
  "Nigerian Pidgin",
  "Odia (Oriya)",
  "Pashto",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Sindhi",
  "Sinhala",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Tagalog (Filipino)",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Vietnamese",
  "Wu Chinese (Shanghainese)",
  "Yoruba",
  "Yue Chinese (Cantonese)",
  "Other",
];

export const HOBBY_OPTIONS: string[] = [
  "Music",
  "Movies",
  "Reading",
  "Gaming",
  "Cooking",
  "Travel",
  "Photography",
  "Fitness",
  "Walking",
  "Dance",
  "Singing",
  "Shopping",
  "Swimming",
  "Running",
  "Cycling",
  "Drawing",
  "Painting",
  "Writing",
  "Baking",
  "Gardening",
  "Hiking",
  "Yoga",
  "Meditation",
  "Sports",
  "Fashion",
  "Coding",
  "Learning",
  "Crafts",
  "Sewing",
  "Knitting",
  "Crochet",
  "DIY",
  "Design",
  "Blogging",
  "Podcasting",
  "Vlogging",
  "Collecting",
  "Chess",
  "Puzzles",
  "Board Games",
  "Volunteering",
  "Camping",
  "Fishing",
  "Birdwatching",
  "Stargazing",
  "Calligraphy",
  "Origami",
  "Pottery",
];

export const DIET_OPTIONS: string[] = [
  "Vegetarian",
  "Vegan",
  "Eggetarian",
  "Non-Vegetarian",
];

export const DRINKING_OPTIONS: { id: string; label: string }[] = [
  { id: "Non-drinker", label: "Non-drinker" },
  { id: "Socially", label: "Social drinker" },
  { id: "Regularly", label: "Regularly" },
];

export const SMOKING_OPTIONS: { id: string; label: string }[] = [
  { id: "Non-smoker", label: "Non-smoker" },
  { id: "Occasionally", label: "Occasionally" },
  { id: "Regularly", label: "Regularly" },
  { id: "Trying to quit", label: "Trying to quit" },
];

export const PET_OPTIONS: string[] = [
  "Have pets",
  "Want pets",
  "Open to pets",
  "Don't want pets",
];

export const CHILDREN_OPTIONS: string[] = [
  "Want children",
  "Don't want children",
  "Open to children",
  "Have children",
  "Not sure yet",
];

export const ANNUAL_INCOME_OPTIONS: string[] = [
  "Under ₹5 Lakh",
  "₹5 Lakh - ₹10 Lakh",
  "₹10 Lakh - ₹20 Lakh",
  "₹20 Lakh - ₹35 Lakh",
  "₹35 Lakh - ₹50 Lakh",
  "₹50 Lakh - ₹1 Crore",
  "₹1 Crore+",
  "Prefer not to say",
];

export const PHOTO_VISIBILITY_OPTIONS: {
  id: PhotoVisibility;
  title: string;
  badge: string;
  desc: string;
  example: string;
}[] = [
    {
      id: "MUTUAL_MATCHES_ONLY",
      title: "Mutual Matches Only",
      badge: "Recommended",
      desc: "Photos unblur automatically only when interest is mutual.",
      example: "Stay blurred to strangers; unblurs once you both connect.",
    },
    {
      id: "REQUEST_REQUIRED",
      title: "Require My Approval",
      badge: "Maximum Privacy",
      desc: "Photos remain locked until you accept individual requests.",
      example: "You review and grant photo access one member at a time.",
    },
    {
      id: "ALL_MEMBERS",
      title: "Visible to All Members",
      badge: "Open",
      desc: "Photos are clear to any verified member right away.",
      example: "Best for active discovery and direct matchmaking.",
    },
  ];

