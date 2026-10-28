import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import {
  User,
  Check,
  ArrowLeft,
  Save,
  Shield,
  Heart,
  MapPin,
  AlignLeft,
  Sparkles,
  Briefcase,
  Coffee,
  Camera,
  UploadCloud,
  X,
  Star,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { allCountries } from "../../data/countries";
import { getStatesForCountry, getCitiesForState } from "../../data/locations";

const TOP_LANGUAGES = [
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

const HOBBIES_LIST = [
  "Acting",
  "Astrology",
  "Audiobooks",
  "Baking",
  "Board Games",
  "Camping",
  "Chess",
  "Cinema",
  "Coding",
  "Coffee",
  "Cooking",
  "Crafting",
  "Cycling",
  "Dancing",
  "Esports",
  "Fashion",
  "Filmmaking",
  "Fitness",
  "Gardening",
  "Gym",
  "Hiking",
  "Journaling",
  "Live Concerts",
  "Meditation",
  "Mixology",
  "Museums",
  "Music",
  "Painting",
  "Pets",
  "Photography",
  "Plant Care",
  "Podcasts",
  "Poetry",
  "Puzzles",
  "Queer Art",
  "Reading",
  "Road Trips",
  "Running",
  "Singing",
  "Stand-up Comedy",
  "Swimming",
  "Tarot",
  "Theatre",
  "Travel",
  "Video Games",
  "Volunteering",
  "Water Sports",
  "Wildlife",
  "Wine Tasting",
  "Writing",
  "Yoga",
];

export interface SectionTab {
  id: string;
  label: string;
  icon: any;
  description: string;
}

const SECTION_TABS: SectionTab[] = [
  {
    id: "demographics",
    label: "About & Demographics",
    icon: User,
    description: "Name, DOB, height, location & beliefs",
  },
  {
    id: "identity",
    label: "Identity & Pronouns",
    icon: Sparkles,
    description: "Gender, orientation & outness",
  },
  {
    id: "marital-status",
    label: "Marital Status",
    icon: Heart,
    description: "Legal & marital background",
  },
  {
    id: "education-work",
    label: "Education & Work",
    icon: Briefcase,
    description: "Degrees, sector & profession",
  },
  {
    id: "bio",
    label: "Bio / About You",
    icon: AlignLeft,
    description: "Personal story & life goals",
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Interests",
    icon: Coffee,
    description: "Diet, drinking, smoking & hobbies",
  },
  {
    id: "partner-preferences",
    label: "Looking For",
    icon: Heart,
    description: "Partner preferences & filters",
  },
  {
    id: "photos",
    label: "Pictures & Gallery",
    icon: Camera,
    description: "Manage photos & primary picture",
  },
  {
    id: "privacy",
    label: "Privacy & Visibility",
    icon: Shield,
    description: "Photo shields & ghost mode",
  },
];

export const EditProfilePage: React.FC = () => {
  const { profile, fetchProfile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const [activeSection, setActiveSection] = useState<string>(() => {
    return window.location.hash.replace("#", "") || "demographics";
  });

  const [formData, setFormData] = useState({
    // Step 1: About You & Demographics
    displayName: "",
    dateOfBirth: "",
    heightCm: 170,
    nationality: "India",
    country: "India",
    state: "",
    city: "",
    religion: "",
    languagesSpoken: ["English"] as string[],

    // Step 2: Identity & Pronouns
    gender: "MAN",
    orientation: "GAY",
    pronouns: "",
    outnessStatus: "DISCREET_NOT_OUT",

    // Step 3: Marital Status
    maritalStatus: "Never Married",

    // Step 4: Education & Work
    education: "Bachelor's Degree",
    degree: "",
    sector: "Private / IT",
    profession: "",

    // Photos
    photos: [] as string[],

    // Bio
    bio: "",

    // Lifestyle & Interests
    diet: "Vegetarian",
    drinking: "Non-drinker",
    smoking: "Non-smoker",
    hobbies: [] as string[],

    // Privacy Safeguards
    photoVisibility: "MUTUAL_MATCHES_ONLY",
    ghostModeEnabled: false,

    // Partner Preferences (Looking For)
    preferredGenders: ["MAN"] as string[],
    preferredOrientations: ["GAY"] as string[],
    minAge: 21,
    maxAge: 50,
    minHeightCm: 150,
    maxHeightCm: 200,
    acceptableOutness: ["DISCREET_NOT_OUT", "OUT_TO_SELECT_FEW", "OUT_TO_ALL"] as string[],
  });

  useEffect(() => {
    if (profile) {
      const pref = (profile as any).partnerPreference;
      const photoUrls = (profile as any).photos?.map((p: any) => p.originalUrl || p.url || p) || [];
      const nationalityVal = (profile as any).nationality || (profile as any).country || "India";

      setFormData({
        displayName: profile.displayName || "",
        dateOfBirth: (profile as any).dateOfBirth
          ? new Date((profile as any).dateOfBirth).toISOString().split("T")[0]
          : "",
        heightCm: (profile as any).heightCm || 170,
        nationality: nationalityVal,
        country: (profile as any).country || nationalityVal || "India",
        state: profile.state || "",
        city: profile.city || "",
        religion: (profile as any).religion || "",
        languagesSpoken: (profile as any).languagesSpoken?.length
          ? (profile as any).languagesSpoken
          : (profile as any).motherTongue
          ? [(profile as any).motherTongue]
          : ["English"],

        gender: profile.gender || "MAN",
        orientation: profile.orientation || "GAY",
        pronouns: profile.pronouns || "",
        outnessStatus: profile.outnessStatus || "DISCREET_NOT_OUT",

        maritalStatus: (profile as any).maritalStatus || "Never Married",

        education: (profile as any).education || "Bachelor's Degree",
        degree: (profile as any).degree || "",
        sector: (profile as any).sector || "Private / IT",
        profession: (profile as any).profession || "",

        photos: photoUrls,

        bio: profile.bio || "",

        diet: (profile as any).diet || "Vegetarian",
        drinking: (profile as any).drinking || "Non-drinker",
        smoking: (profile as any).smoking || "Non-smoker",
        hobbies: (profile as any).hobbies || [],

        photoVisibility: (profile as any).photoVisibility || "MUTUAL_MATCHES_ONLY",
        ghostModeEnabled: (profile as any).ghostModeEnabled || false,

        preferredGenders: pref?.preferredGenders?.length ? pref.preferredGenders : ["MAN"],
        preferredOrientations: pref?.preferredOrientations?.length ? pref.preferredOrientations : ["GAY"],
        minAge: pref?.minAge ?? 21,
        maxAge: pref?.maxAge ?? 50,
        minHeightCm: pref?.minHeightCm ?? 150,
        maxHeightCm: pref?.maxHeightCm ?? 200,
        acceptableOutness: pref?.acceptableOutness?.length
          ? pref.acceptableOutness
          : ["DISCREET_NOT_OUT", "OUT_TO_SELECT_FEW", "OUT_TO_ALL"],
      });
    }
  }, [profile]);

  // Jump to section based on hash on mount or when hash changes
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      setActiveSection(hash);
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        // Offset for sticky navbar
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.hash]);

  // Track active section during scrolling using IntersectionObserver
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    SECTION_TABS.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    navigate(`/profile/edit#${sectionId}`, { replace: true });
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChange = (field: string, value: any) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: "preferredGenders" | "preferredOrientations" | "acceptableOutness" | "languagesSpoken" | "hobbies",
    value: string
  ) => {
    setError(null);
    setFormData((prev) => {
      const current = prev[field] as string[];
      const exists = current.includes(value);
      if (exists) {
        // Enforce minimum 1 for partner preferences
        if (
          (field === "preferredGenders" || field === "preferredOrientations" || field === "acceptableOutness") &&
          current.length === 1
        ) {
          return prev;
        }
        return { ...prev, [field]: current.filter((x) => x !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    ];
    const unused = samplePhotos.filter((p) => !formData.photos.includes(p));
    const nextPhoto = unused.length > 0 ? unused[0] : samplePhotos[formData.photos.length % samplePhotos.length];
    if (formData.photos.length < 6) {
      handleChange("photos", [...formData.photos, nextPhoto]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (formData.photos.length >= 6) return;
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) return;

        // Compress and optimize image to ensure fast network payload & reliable DB storage
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setFormData((prev) => {
              if (prev.photos.length >= 6) return prev;
              return { ...prev, photos: [...prev.photos, optimizedDataUrl] };
            });
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value
    e.target.value = "";
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const selected = prev.photos[index];
      const remaining = prev.photos.filter((_, i) => i !== index);
      return { ...prev, photos: [selected, ...remaining] };
    });
  };

  const handleRemovePhoto = (index: number) => {
    handleChange(
      "photos",
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || formData.displayName.trim().length < 2) {
      const msg = "Display Name must be at least 2 characters.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    if (!formData.state.trim() || !formData.city.trim()) {
      const msg = "State and City are required.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    if (formData.minAge > formData.maxAge) {
      const msg = "Minimum partner age cannot be greater than maximum partner age.";
      setError(msg);
      showToast("error", msg);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        displayName: formData.displayName.trim(),
        gender: formData.gender,
        orientation: formData.orientation,
        pronouns: formData.pronouns.trim() || undefined,
        outnessStatus: formData.outnessStatus,
        dateOfBirth: formData.dateOfBirth || undefined,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        nationality: formData.nationality.trim() || undefined,
        religion: formData.religion.trim() || undefined,
        motherTongue: formData.languagesSpoken[0] || "English",
        languagesSpoken: formData.languagesSpoken,
        maritalStatus: formData.maritalStatus,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || formData.nationality.trim() || "India",
        education: formData.education.trim() || undefined,
        degree: formData.degree.trim() || undefined,
        sector: formData.sector.trim() || undefined,
        profession: formData.profession.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        diet: formData.diet.trim() || undefined,
        drinking: formData.drinking || undefined,
        smoking: formData.smoking || undefined,
        hobbies: formData.hobbies,
        photos: formData.photos,
        photoVisibility: formData.photoVisibility,
        ghostModeEnabled: formData.ghostModeEnabled,
        partnerPreference: {
          preferredGenders: formData.preferredGenders,
          preferredOrientations: formData.preferredOrientations,
          minAge: Number(formData.minAge),
          maxAge: Number(formData.maxAge),
          minHeightCm: formData.minHeightCm ? Number(formData.minHeightCm) : undefined,
          maxHeightCm: formData.maxHeightCm ? Number(formData.maxHeightCm) : undefined,
          acceptableOutness: formData.acceptableOutness,
        },
      };

      await api.patch("/profiles/me", payload);
      await fetchProfile();
      setSuccess(true);
      showToast("success", "Profile updated successfully!");
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update profile details";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT SIDEBAR: SECTION NAVIGATION TABS */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Sections
            </div>
            <nav className="space-y-1">
              {SECTION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-rose-50 text-rose-600 shadow-xs border border-rose-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold leading-tight">{tab.label}</p>
                      <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT: HEADER & PROFILE SECTIONS FORM */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Top Header inside right column */}
          <div className="flex items-center justify-between">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Discover
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Your Profile</h1>
              <p className="text-xs text-slate-500">
                Manage your personal demographics, authentic identity, marital background, career, and lifestyle.
              </p>
            </div>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>All changes and preferences have been updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CARD 1: ABOUT YOU & DEMOGRAPHICS */}
            <div id="demographics" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About You & Demographics
              </h2>
              <p className="text-[11px] text-slate-400">Basic personal information, location, and beliefs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Name / Display Alias <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: You do not need to use your legal name. You may use your chosen name or alias.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleChange("heightCm", parseInt(e.target.value) || 170)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Nationality & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nationality
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => {
                    const newNat = e.target.value;
                    handleChange("nationality", newNat);
                    if (newNat) {
                      handleChange("country", newNat);
                      handleChange("state", "");
                      handleChange("city", "");
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select Country</option>
                  {allCountries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  State / Province <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  disabled={!formData.nationality}
                  onChange={(e) => {
                    handleChange("state", e.target.value);
                    handleChange("city", "");
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">{formData.nationality ? "Select State" : "Select Nationality First"}</option>
                  {formData.nationality &&
                    getStatesForCountry(formData.nationality).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* City & Religion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.city}
                  disabled={!formData.state}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                  {formData.nationality &&
                    formData.state &&
                    getCitiesForState(formData.nationality, formData.state).map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Religion / Beliefs
                </label>
                <select
                  value={formData.religion}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Islam">Islam</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Folk Religion / Shinto / Taoism">Folk Religion / Shinto / Taoism</option>
                  <option value="Sikhism">Sikhism</option>
                  <option value="Judaism">Judaism</option>
                  <option value="Jainism">Jainism</option>
                  <option value="Baháʼí">Baháʼí</option>
                  <option value="Spiritual but not religious">Spiritual but not religious</option>
                  <option value="Atheist / Agnostic">Atheist / Agnostic</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Languages Spoken (Alphabetical Top 50 Chips) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Languages Spoken
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.languagesSpoken.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                {TOP_LANGUAGES.map((lang) => {
                  const selected = formData.languagesSpoken.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleArrayItem("languagesSpoken", lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: IDENTITY & PRONOUNS */}
        <div id="identity" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Identity & Pronouns
              </h2>
              <p className="text-[11px] text-slate-400">Affirm your authentic gender, sexual orientation, and outness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender Identity <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="MAN">Man</option>
                <option value="WOMAN">Woman</option>
                <option value="NON_BINARY">Non-Binary</option>
                <option value="TRANS_MAN">Trans Man</option>
                <option value="TRANS_WOMAN">Trans Woman</option>
                <option value="GENDERQUEER">Genderqueer</option>
                <option value="AGENDER">Agender</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Orientation <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.orientation}
                onChange={(e) => handleChange("orientation", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="GAY">Gay</option>
                <option value="LESBIAN">Lesbian</option>
                <option value="BISEXUAL">Bisexual</option>
                <option value="PANSEXUAL">Pansexual</option>
                <option value="QUEER">Queer</option>
                <option value="ASEXUAL">Asexual</option>
                <option value="DEMISEXUAL">Demisexual</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pronouns
              </label>
              <input
                type="text"
                placeholder="e.g. they/them, she/her, he/him"
                value={formData.pronouns}
                onChange={(e) => handleChange("pronouns", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Outness Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.outnessStatus}
                onChange={(e) => handleChange("outnessStatus", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="DISCREET_NOT_OUT">Discreet / Not out</option>
                <option value="OUT_TO_SELECT_FEW">Out to select few friends</option>
                <option value="OUT_TO_ALL">Openly out</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3: MARITAL STATUS */}
        <div id="marital-status" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Marital Status
              </h2>
              <p className="text-[11px] text-slate-400">Your current legal and marital background</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: "Never Married", desc: "Single, never legally or ritually married." },
              { id: "Divorced", desc: "Previously married, legally separated/divorced." },
              { id: "Widowed", desc: "Spouse has passed away." },
              { id: "Awaiting Divorce", desc: "Divorce proceedings currently underway." },
              { id: "Annulled", desc: "Previous marriage was officially annulled." },
            ].map((status) => (
              <label
                key={status.id}
                onClick={() => handleChange("maritalStatus", status.id)}
                className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.maritalStatus === status.id
                    ? "border-brand-500 bg-brand-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{status.id}</span>
                  {formData.maritalStatus === status.id && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{status.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* CARD 4: EDUCATION & WORK */}
        <div id="education-work" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Education & Work
              </h2>
              <p className="text-[11px] text-slate-400">Academic background and career profession</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Highest Qualification
              </label>
              <select
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">Select</option>
                <option value="Doctorate / Ph.D">Doctorate / Ph.D</option>
                <option value="Master's Degree">Master's Degree (MBA, MTech, MS, etc.)</option>
                <option value="Bachelor's Degree">Bachelor's Degree (BTech, BA, BSc, etc.)</option>
                <option value="Diploma">Diploma / Associate Degree</option>
                <option value="High School">High School</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Degree / Major
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Economics"
                value={formData.degree}
                onChange={(e) => handleChange("degree", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Sector of Work
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">Select</option>
                <option value="Private / IT">Technology & IT</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Healthcare & Medicine">Healthcare & Medicine</option>
                <option value="Education & Academia">Education & Academia</option>
                <option value="Government / PSU">Government / Public Sector</option>
                <option value="Business / Entrepreneur">Business / Entrepreneur</option>
                <option value="Media & Creative">Media, Design & Creative</option>
                <option value="Legal & Law">Legal & Law</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Title / Profession
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Product Designer, Architect"
                value={formData.profession}
                onChange={(e) => handleChange("profession", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* CARD 5: ABOUT YOU (BIO) */}
        <div id="bio" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AlignLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About You (Bio)
              </h2>
              <p className="text-[11px] text-slate-400">Share your story, values, and what you hope to build</p>
            </div>
          </div>

          <textarea
            rows={4}
            placeholder="Share your values, personality, passions, and what kind of life partner you hope to build a future with..."
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 leading-relaxed"
          />
        </div>

        {/* CARD 6: LIFESTYLE & HOBBIES */}
        <div id="lifestyle" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Lifestyle & Interests
              </h2>
              <p className="text-[11px] text-slate-400">Dietary habits, drinking, smoking, and hobbies</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Vegetarian", "Vegan", "Eggetarian", "Non-Vegetarian"].map((dietOption) => (
                  <button
                    type="button"
                    key={dietOption}
                    onClick={() => handleChange("diet", dietOption)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.diet === dietOption
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {dietOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Drinking Habits */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Drinking
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "Non-drinker", label: "Non-drinker" },
                  { id: "Socially", label: "Social drinker" },
                  { id: "Regularly", label: "Regularly" },
                ].map((drinkOption) => (
                  <button
                    type="button"
                    key={drinkOption.id}
                    onClick={() => handleChange("drinking", drinkOption.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.drinking === drinkOption.id
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {drinkOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking Habits */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Smoking
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Non-smoker", label: "Non-smoker" },
                  { id: "Occasionally", label: "Occasionally" },
                  { id: "Regularly", label: "Regularly" },
                  { id: "Trying to quit", label: "Trying to quit" },
                ].map((smokeOption) => (
                  <button
                    type="button"
                    key={smokeOption.id}
                    onClick={() => handleChange("smoking", smokeOption.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.smoking === smokeOption.id
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {smokeOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hobbies / Interests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Hobbies & Interests
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.hobbies.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                {HOBBIES_LIST.map((hobby) => {
                  const selected = formData.hobbies.includes(hobby);
                  return (
                    <button
                      type="button"
                      key={hobby}
                      onClick={() => toggleArrayItem("hobbies", hobby)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {hobby}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 7: LOOKING FOR (PARTNER PREFERENCES) */}
        <div id="partner-preferences" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Looking For (Partner Preferences)
              </h2>
              <p className="text-[11px] text-slate-400">Filter and discover matches matching your preferences</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Gender(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "MAN", label: "Man" },
                  { id: "WOMAN", label: "Woman" },
                  { id: "NON_BINARY", label: "Non-Binary" },
                  { id: "TRANS_MAN", label: "Trans Man" },
                  { id: "TRANS_WOMAN", label: "Trans Woman" },
                  { id: "GENDERQUEER", label: "Genderqueer" },
                  { id: "AGENDER", label: "Agender" },
                  { id: "OTHER", label: "Other" },
                ].map((item) => {
                  const selected = formData.preferredGenders.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleArrayItem("preferredGenders", item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Orientation(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "GAY", label: "Gay" },
                  { id: "LESBIAN", label: "Lesbian" },
                  { id: "BISEXUAL", label: "Bisexual" },
                  { id: "PANSEXUAL", label: "Pansexual" },
                  { id: "QUEER", label: "Queer" },
                  { id: "ASEXUAL", label: "Asexual" },
                  { id: "DEMISEXUAL", label: "Demisexual" },
                  { id: "OTHER", label: "Other" },
                ].map((item) => {
                  const selected = formData.preferredOrientations.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleArrayItem("preferredOrientations", item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Partner Age
                </label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={formData.minAge}
                  onChange={(e) => handleChange("minAge", parseInt(e.target.value) || 18)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Max Partner Age
                </label>
                <input
                  type="number"
                  min={18}
                  max={90}
                  value={formData.maxAge}
                  onChange={(e) => handleChange("maxAge", parseInt(e.target.value) || 50)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 8: PICTURES & GALLERY */}
        <div id="photos" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-50 text-brand-600 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Profile Pictures & Gallery
                </h2>
                <p className="text-[11px] text-slate-400">
                  Add up to 6 pictures. Your primary photo appears as your main display avatar.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {formData.photos.length} / 6 Photos
            </span>
          </div>

          <div className="space-y-5">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {formData.photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs group bg-slate-100"
                >
                  <img
                    src={url}
                    alt={`Profile photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badges / Primary Tag */}
                  {idx === 0 ? (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Primary Photo</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryPhoto(idx)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 hover:bg-brand-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      Make Primary
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    title="Remove photo"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none">
                    <span className="text-[10px] font-medium text-white/90">
                      Photo {idx + 1}
                    </span>
                  </div>
                </div>
              ))}

              {/* Upload Slots */}
              {formData.photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/70 hover:bg-brand-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer p-4 text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-brand-600">
                      Upload from Device
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or WebP</span>
                  </div>
                </label>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <p className="text-slate-500 text-[11px]">
                Tip: Click <strong>"Make Primary"</strong> on any picture to set it as your main profile cover.
              </p>
              <div className="flex items-center gap-2">
                {formData.photos.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 text-slate-700 hover:text-brand-700 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    + Add Sample Demo Picture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 9: PRIVACY SAFEGUARDS */}
        <div id="privacy" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Privacy Safeguards & Visibility
              </h2>
              <p className="text-[11px] text-slate-400">Controls and visibility of your photos and identity on EverPride</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Photo Visibility Shield Setting
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    id: "MUTUAL_MATCHES_ONLY",
                    title: "Mutual Matches Only (Recommended)",
                    desc: "Photos unblur automatically only after both members accept each other's interest.",
                  },
                  {
                    id: "REQUEST_REQUIRED",
                    title: "Require My Approval",
                    desc: "Your photos remain blurred with a lock icon. Members must request access, and you decide who can view.",
                  },
                  {
                    id: "ALL_MEMBERS",
                    title: "Visible to All Members",
                    desc: "Photos are visible to any signed-in verified member of EverPride.",
                  },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    onClick={() => handleChange("photoVisibility", tier.id)}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.photoVisibility === tier.id
                        ? "border-brand-500 bg-brand-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{tier.title}</span>
                      {formData.photoVisibility === tier.id && (
                        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{tier.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label
                onClick={() => handleChange("ghostModeEnabled", !formData.ghostModeEnabled)}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.ghostModeEnabled}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900">Enable Ghost Mode</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse profiles without leaving a trace in their recent visitors list.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Make sure to save after updating your preferences.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 cursor-pointer shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all ml-auto"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </form>
        </div>
      </div>

      {/* Bottom-Right Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all duration-300 animate-slide-up max-w-sm ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/20"
              : "bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/20"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
