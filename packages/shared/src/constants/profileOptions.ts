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
  { id: "DISCREET_NOT_OUT", label: "Discreet / Not out" },
  { id: "OUT_TO_SELECT_FEW", label: "Out to select few friends" },
  { id: "OUT_TO_ALL", label: "Openly out" },
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
