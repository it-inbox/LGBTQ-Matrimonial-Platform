import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  GraduationCap,
  Star,
  Lock,
  ChevronDown,
  Search,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { allCountries } from "../../data/countries";
import { getStatesForCountry, getCitiesForState, getCitiesForCountry } from "../../data/locations";
import { Input, Select, Button, SelectableChip, ChoiceCard, AlertBanner, SectionCard } from "../../components/ui";
import { AgeRangeSlider } from "../../components/common/AgeRangeSlider";
import {
  DEGREE_OPTIONS,
  getDegreesForQualification,
  ANNUAL_INCOME_OPTIONS,
  PET_OPTIONS,
  CHILDREN_OPTIONS,
  OUTNESS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "@everpride/shared";

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
    label: "About You",
    icon: User,
    description: "Basic personal details and location",
  },
  {
    id: "identity",
    label: "Identity",
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
    id: "education",
    label: "Education Details",
    icon: GraduationCap,
    description: "Degrees, institutions & study fields",
  },
  {
    id: "work",
    label: "Career",
    icon: Briefcase,
    description: "Industry sector & job title",
  },
  {
    id: "bio",
    label: "Bio",
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
    id: "photos",
    label: "Your Pictures",
    icon: Camera,
    description: "Manage photos & primary picture",
  },
];

export const EditProfilePage: React.FC = () => {
  const { profile, setProfile } = useAuthStore();
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

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: About You
    displayName: "",
    dateOfBirth: "",
    heightCm: 170,
    nationality: "India",
    originCountry: "",
    originCity: "",
    country: "India",
    state: "",
    city: "",
    religion: "",
    languagesSpoken: ["English"] as string[],

    // Step 2: Identity
    gender: "MAN",
    orientation: "GAY",
    pronouns: "",
    outnessStatus: "DISCREET_NOT_OUT",

    // Step 3: Marital Status
    maritalStatus: "Never Married",

    // Step 4: Education & Work
    education: "Bachelor's Degree",
    degree: "",
    educations: [] as Array<{
      qualification?: string;
      degree: string;
      degreeName?: string;
      major?: string;
      institution: string;
      year?: number;
    }>,
    sector: "Private / IT",
    profession: "",
    annualIncome: "",

    // Photos
    photos: [] as string[],

    // Bio
    bio: "",

    // Lifestyle & Interests
    diet: "Vegetarian",
    drinking: "Non-drinker",
    smoking: "Non-smoker",
    pets: "",
    children: "",
    hobbies: [] as string[],

    // Privacy Safeguards
    photoVisibility: "MUTUAL_MATCHES_ONLY",
    ghostModeEnabled: false,

    // Partner Preferences (Looking For)
    preferredGenders: ["MAN"] as string[],
    preferredOrientations: ["GAY"] as string[],
    minAge: 21,
    maxAge: 50,
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
        originCountry: (profile as any).originCountry || "",
        originCity: (profile as any).originCity || "",
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
        educations: (profile as any).educations?.length
          ? (profile as any).educations.map((e: any) => ({
            qualification: e.qualification || e.degree || "Bachelor's Degree",
            degree: e.qualification || e.degree || "Bachelor's Degree",
            degreeName: e.degreeName || (e.qualification && e.degree !== e.qualification ? e.degree : ""),
            major: e.major || "",
            institution: e.institution || "",
            year: e.year || undefined,
          }))
          : [
            {
              degree: (profile as any).education || "Bachelor's Degree",
              degreeName: (profile as any).degree || "",
              major: "",
              institution: "",
            },
          ],
        sector: (profile as any).sector || "Private / IT",
        profession: (profile as any).profession || "",
        annualIncome: (profile as any).annualIncome || "",

        photos: photoUrls,

        bio: profile.bio || "",

        diet: (profile as any).diet || "Vegetarian",
        drinking: (profile as any).drinking || "Non-drinker",
        smoking: (profile as any).smoking || "Non-smoker",
        pets: (profile as any).pets || "",
        children: (profile as any).children || "",
        hobbies: (profile as any).hobbies || [],

        photoVisibility: (profile as any).photoVisibility || "MUTUAL_MATCHES_ONLY",
        ghostModeEnabled: (profile as any).ghostModeEnabled || false,

        preferredGenders: pref?.preferredGenders?.length ? pref.preferredGenders : ["MAN"],
        preferredOrientations: pref?.preferredOrientations?.length ? pref.preferredOrientations : ["GAY"],
        minAge: pref?.minAge ?? 21,
        maxAge: pref?.maxAge ?? 50,
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
    field: "preferredGenders" | "preferredOrientations" | "languagesSpoken" | "hobbies",
    value: string
  ) => {
    setError(null);
    setFormData((prev) => {
      const current = prev[field] as string[];
      const exists = current.includes(value);
      if (exists) {
        // Enforce minimum 1 for partner preferences
        if (
          (field === "preferredGenders" || field === "preferredOrientations") &&
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

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...(prev.educations || []),
        { degree: "Bachelor's Degree", major: "", institution: "" },
      ],
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.educations || [])];
      let newEntry = { ...updated[index], [field]: value };
      if (field === "degree" && value !== updated[index]?.degree) {
        const validDegrees = getDegreesForQualification(value);
        if (newEntry.degreeName && !validDegrees.includes(newEntry.degreeName)) {
          newEntry.degreeName = "";
        }
      }
      updated[index] = newEntry;
      return {
        ...prev,
        educations: updated,
        education: updated[0]?.degree || prev.education,
        degree: updated[0]?.degreeName || updated[0]?.major || prev.degree,
      };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.educations || []).filter((_, i) => i !== index);
      return {
        ...prev,
        educations: updated,
        education: updated[0]?.degree || "",
        degree: updated[0]?.major || "",
      };
    });
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
    if (loading) return;
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

    setLoading(true);
    setError(null);
    try {
      const payload = {
        displayName: formData.displayName.trim(),
        gender: formData.gender,
        orientation: formData.orientation,
        pronouns: formData.pronouns.trim() || undefined,
        outnessStatus: formData.outnessStatus,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        nationality: formData.nationality.trim() || undefined,
        motherTongue: formData.languagesSpoken[0] || "English",
        languagesSpoken: formData.languagesSpoken,
        maritalStatus: formData.maritalStatus,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        originCountry: formData.originCountry.trim() || undefined,
        originCity: formData.originCity.trim() || undefined,
        education: (formData.educations?.[0]?.degree || formData.education || "").trim() || undefined,
        degree: (formData.educations?.[0]?.degreeName || formData.educations?.[0]?.major || formData.degree || "").trim() || undefined,
        educations: (formData.educations || [])
          .filter((e) => e.degree && e.institution.trim())
          .map((e) => ({
            qualification: e.degree.trim(),
            degree: (e.degreeName || e.degree).trim(),
            degreeName: e.degreeName?.trim() || null,
            major: e.major?.trim() || null,
            institution: e.institution.trim(),
            year: e.year ? Number(e.year) : null,
          })),
        sector: formData.sector.trim() || undefined,
        profession: formData.profession.trim() || undefined,
        annualIncome: formData.annualIncome ? formData.annualIncome.trim() : undefined,
        bio: formData.bio.trim() || undefined,
        diet: formData.diet.trim() || undefined,
        drinking: formData.drinking || undefined,
        smoking: formData.smoking || undefined,
        pets: formData.pets ? formData.pets.trim() : undefined,
        children: formData.children ? formData.children.trim() : undefined,
        hobbies: formData.hobbies,
        photos: formData.photos,
      };

      const res = await api.patch("/profiles/me", payload);
      setProfile(res.data);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
        {/* LEFT SIDEBAR: SECTION NAVIGATION TABS (Desktop only, hidden on mobile & tab) */}
        <aside className="hidden lg:block lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${isActive
                      ? "bg-rose-50 text-rose-600 shadow-xs border border-rose-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive
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
            </div>
          </div>

          {success && (
            <AlertBanner
              variant="success"
              message="All changes and preferences have been updated successfully!"
              onClose={() => setSuccess(false)}
            />
          )}

          {error && (
            <AlertBanner
              variant="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-10">
            {/* SECTION 1: ABOUT YOU & */}
            <section id="demographics" className="space-y-6">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                About You
              </h2>
              <div className="space-y-7">
                <div>
                  <Input
                    label="NAME *"
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    helperText="Note: You do not need to use your legal name. You may use your chosen name or alias."
                  />
                </div>

                {/* Row 2: Non-updatable Demographics (DOB, Height, Religion) */}
                <div className="space-y-4">
                  {/* DOB (Not updatable) */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Date of Birth
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "Set on signup"}
                    </p>
                  </div>

                  {/* Height (Not updatable) */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Height
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {formData.heightCm
                        ? `${formData.heightCm} cm (${Math.floor(formData.heightCm / 30.48)}'${Math.round(
                          (formData.heightCm % 30.48) / 2.54
                        )}")`
                        : "Not specified"}
                    </p>
                  </div>

                  {/* Religion / Belief (Not updatable) */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Religion
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {formData.religion || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Current Residence: Country | State / Province | City */}
                <div className="pt-2">
                  <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block mb-3">
                    Current Residence
                  </span>
                  <div className="space-y-4">
                    <Select
                      label="COUNTRY *"
                      value={formData.country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        handleChange("country", newCountry);
                        handleChange("state", "");
                        handleChange("city", "");
                      }}
                    >
                      <option value="">Select Country</option>
                      {allCountries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="STATE *"
                      value={formData.state}
                      disabled={!formData.country}
                      onChange={(e) => {
                        handleChange("state", e.target.value);
                        handleChange("city", "");
                      }}
                    >
                      <option value="">{formData.country ? "Select State" : "Select Country First"}</option>
                      {formData.country &&
                        getStatesForCountry(formData.country).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                    </Select>

                    <Select
                      label="CITY *"
                      value={formData.city}
                      disabled={!formData.state}
                      onChange={(e) => handleChange("city", e.target.value)}
                    >
                      <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                      {formData.country &&
                        formData.state &&
                        getCitiesForState(formData.country, formData.state).map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                    </Select>
                  </div>
                </div>

                {/* Origin & Citizenship: Nationality | Origin Country | Hometown */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block mb-3">
                    Origin & Citizenship
                  </span>
                  <div className="space-y-4">
                    <Select
                      label="NATIONALITY / CITIZENSHIP *"
                      value={formData.nationality}
                      onChange={(e) => handleChange("nationality", e.target.value)}
                    >
                      <option value="">Select Nationality</option>
                      {allCountries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="COUNTRY OF ORIGIN"
                      value={formData.originCountry}
                      onChange={(e) => handleChange("originCountry", e.target.value)}
                    >
                      <option value="">Select Country of Origin</option>
                      {allCountries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="HOMETOWN"
                      value={formData.originCity}
                      disabled={!formData.originCountry && !formData.nationality}
                      onChange={(e) => handleChange("originCity", e.target.value)}
                    >
                      <option value="">
                        {formData.originCountry || formData.nationality
                          ? "Select Hometown"
                          : "Select Country of Origin or Nationality First"}
                      </option>
                      {(formData.originCountry || formData.nationality) &&
                        getCitiesForCountry(formData.originCountry || formData.nationality).map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                    </Select>
                  </div>
                </div>

                {/* Row 4: Languages Spoken (Dropdown Multi-Select) */}
                <div ref={langDropdownRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Languages
                  </label>

                  <div
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-all flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                      {formData.languagesSpoken.length === 0 ? (
                        <span className="text-xs text-slate-400">Select languages spoken...</span>
                      ) : (
                        formData.languagesSpoken.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleArrayItem("languagesSpoken", lang);
                              }}
                              className="text-brand-500 hover:text-brand-800 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${langDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>

                  {langDropdownOpen && (
                    <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                        {TOP_LANGUAGES.filter((l) =>
                          l.toLowerCase().includes(langSearch.toLowerCase())
                        ).map((lang) => {
                          const isSelected = formData.languagesSpoken.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleArrayItem("languagesSpoken", lang)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${isSelected
                                ? "bg-brand-50 text-brand-700 font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              <span>{lang}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 2: IDENTITY */}
            <section id="identity" className="space-y-6">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Identity
              </h2>
              <div className="space-y-7">
                {/* Gender Identity (Inline Pill Chips) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Gender Identity *
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
                    ].map((g) => (
                      <SelectableChip
                        key={g.id}
                        selected={formData.gender === g.id}
                        shape="rect"
                        onClick={() => handleChange("gender", g.id)}
                      >
                        {g.label}
                      </SelectableChip>
                    ))}
                  </div>
                </div>

                {/* Orientation (Inline Pill Chips) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Orientation *
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
                    ].map((o) => (
                      <SelectableChip
                        key={o.id}
                        selected={formData.orientation === o.id}
                        shape="rect"
                        onClick={() => handleChange("orientation", o.id)}
                      >
                        {o.label}
                      </SelectableChip>
                    ))}
                  </div>
                </div>

                {/* Pronouns (Input) */}
                <div className="max-w-md">
                  <Input
                    label="PRONOUNS"
                    placeholder="e.g. they/them, she/her, he/him"
                    value={formData.pronouns}
                    onChange={(e) => handleChange("pronouns", e.target.value)}
                  />
                </div>

                {/* Outness Status (Styled like Dietary/Drinking/Smoking) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Are you out of the closet? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {OUTNESS_OPTIONS.map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => handleChange("outnessStatus", st.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${formData.outnessStatus === st.id
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 3: MARITAL STATUS */}
            <section id="marital-status" className="space-y-4">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Marital Status
              </h2>
              <div className="space-y-3">
                {MARITAL_STATUS_OPTIONS.map((status) => (
                  <ChoiceCard
                    key={status.id}
                    selected={formData.maritalStatus === status.id}
                    title={status.id}
                    onClick={() => handleChange("maritalStatus", status.id)}
                  />
                ))}
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 4: EDUCATION (Separated) */}
            <section id="education" className="space-y-6">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Education Details
              </h2>
              {/* Qualifications & Degrees (Multiple) */}
              <div className="space-y-6">
                <div className="space-y-5">
                  {(formData.educations || []).map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-5 relative group"
                    >
                      {formData.educations.length > 1 && (
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            title="Remove qualification"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Qualification Level (Inline Selectable Pill Chips) */}
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Doctorate / Ph.D",
                            "Master's Degree",
                            "Bachelor's Degree",
                            "Diploma",
                            "High School",
                            "Other",
                          ].map((q) => (
                            <SelectableChip
                              key={q}
                              selected={edu.degree === q}
                              shape="rect"
                              onClick={() => handleUpdateEducation(idx, "degree", q)}
                            >
                              {q}
                            </SelectableChip>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {edu.degree !== "High School" && (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Degree <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={edu.degreeName || ""}
                                onChange={(e) => handleUpdateEducation(idx, "degreeName", e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500 font-medium"
                              >
                                <option value="">Select Degree</option>
                                {getDegreesForQualification(edu.degree).map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                field of study
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Computer Science, Economics, Fine Arts"
                                value={edu.major || ""}
                                onChange={(e) => handleUpdateEducation(idx, "major", e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            {edu.degree === "High School"
                              ? "School"
                              : edu.degree === "Diploma" || edu.degree === "Other"
                                ? "INSTITUTION"
                                : "University"}{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={
                              edu.degree === "High School"
                                ? "e.g. DPS, St. Xavier's, City High School"
                                : edu.degree === "Diploma" || edu.degree === "Other"
                                  ? "e.g. National Institute of Design, Tech Academy"
                                  : "e.g. Stanford University, Delhi University"
                            }
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(idx, "institution", e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* + Add Qualification Button (Below qualification cards) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Qualification</span>
                  </button>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 5: CAREER (Separated) */}
            <section id="work" className="space-y-6">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Career
              </h2>
              <div className="space-y-7">
                {/* Sector of Work (Inline Selectable Pill Chips) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Sector of Work
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "Private / IT", label: "Technology & IT" },
                      { id: "Finance & Banking", label: "Finance & Banking" },
                      { id: "Healthcare & Medicine", label: "Healthcare & Medicine" },
                      { id: "Education & Academia", label: "Education & Academia" },
                      { id: "Government / PSU", label: "Government / PSU" },
                      { id: "Business / Entrepreneur", label: "Business / Entrepreneur" },
                      { id: "Media & Creative", label: "Media & Creative" },
                      { id: "Legal & Law", label: "Legal & Law" },
                      { id: "Other", label: "Other" },
                    ].map((sec) => (
                      <SelectableChip
                        key={sec.id}
                        selected={formData.sector === sec.id}
                        shape="rect"
                        onClick={() => handleChange("sector", sec.id)}
                      >
                        {sec.label}
                      </SelectableChip>
                    ))}
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <Input
                    label="JOB TITLE"
                    placeholder="e.g. Senior Product Designer, Architect"
                    value={formData.profession}
                    onChange={(e) => handleChange("profession", e.target.value)}
                  />
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Annual Income
                  </label>
                  <select
                    value={formData.annualIncome || ""}
                    onChange={(e) => handleChange("annualIncome", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="">Select Annual Income (Optional)</option>
                    {ANNUAL_INCOME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 6: BIO */}
            <section id="bio" className="space-y-4">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Bio
              </h2>
              <textarea
                rows={4}
                placeholder="Share your values, personality, passions, and what kind of life partner you hope to build a future with..."
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 7: LIFESTYLE & HOBBIES */}
            <section id="lifestyle" className="space-y-6">
              <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                Lifestyle & Interests
              </h2>
              <div className="space-y-7">
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
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${formData.diet === dietOption
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
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${formData.drinking === drinkOption.id
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
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${formData.smoking === smokeOption.id
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        {smokeOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Preferences */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Pet Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PET_OPTIONS.map((petOption) => (
                      <SelectableChip
                        key={petOption}
                        selected={formData.pets === petOption}
                        shape="rect"
                        onClick={() => handleChange("pets", formData.pets === petOption ? "" : petOption)}
                      >
                        {petOption}
                      </SelectableChip>
                    ))}
                  </div>
                </div>

                {/* Children Preferences */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Children Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHILDREN_OPTIONS.map((childOption) => (
                      <SelectableChip
                        key={childOption}
                        selected={formData.children === childOption}
                        shape="rect"
                        onClick={() => handleChange("children", formData.children === childOption ? "" : childOption)}
                      >
                        {childOption}
                      </SelectableChip>
                    ))}
                  </div>
                </div>

                {/* Hobbies / Interests */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Hobbies & Interests
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {formData.hobbies.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HOBBIES_LIST.map((hobby) => (
                      <SelectableChip
                        key={hobby}
                        selected={formData.hobbies.includes(hobby)}
                        shape="pill"
                        onClick={() => toggleArrayItem("hobbies", hobby)}
                      >
                        {hobby}
                      </SelectableChip>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* SECTION 8: YOUR PICTURES */}
            <section id="photos" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-rose-600 uppercase tracking-wider">
                  Your Pictures
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {formData.photos.length} / 6 Photos
                </span>
              </div>
              <div className="space-y-6">
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
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <p className="text-slate-500 text-[11px]">
                    Tip: Click <strong>"Make Primary"</strong> on any picture to set it as your main profile cover.
                  </p>
                </div>
              </div>
            </section>

            {/* Sticky Submit Button */}
            <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Make sure to save after updating your preferences.
              </span>
              <Button
                type="submit"
                isLoading={loading}
                icon={<Save className="w-4 h-4" />}
                size="md"
                className="w-full sm:w-auto px-7 ml-auto shadow-md shadow-brand-500/20"
              >
                Save All Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom-Right Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all duration-300 animate-slide-up max-w-sm ${toast.type === "success"
            ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/20"
            : "bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/20"
            }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${toast.type === "success"
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
