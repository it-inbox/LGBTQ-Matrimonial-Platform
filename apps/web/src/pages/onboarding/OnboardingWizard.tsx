import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth.store";
import {
  Shield,
  Check,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Heart,
  Phone,
  Mail,
  User,
  Sparkles,
  Camera,
  BookOpen,
  Briefcase,
  Coffee,
  CheckCircle2,
  Lock,
  UploadCloud,
  X,
} from "lucide-react";
import { allCountries } from "../../data/countries";
import { getStatesForCountry, getCitiesForState } from "../../data/locations";
import { HOBBIES_LIST } from "../../data/hobbies";

export interface OnboardingFormData {
  displayName: string;
  dateOfBirth: string;
  heightCm: number;
  nationality: string;
  country: string;
  state: string;
  city: string;
  religion: string;
  languagesSpoken: string[];
  gender: string;
  orientation: string;
  pronouns: string;
  outnessStatus: string;
  maritalStatus: string;
  education: string;
  degree: string;
  sector: string;
  profession: string;
  annualIncome: string;
  photos: string[];
  photoVisibility: string;
  bio: string;
  diet: string;
  drinking: string;
  smoking: string;
  hobbies: string[];
  ghostModeEnabled: boolean;
  preferredGenders: string[];
  preferredOrientations: string[];
  minAge: number;
  maxAge: number;
  acceptableOutness: string[];
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default Form State
  const initialFormData: OnboardingFormData = {
    // Step 1: About You
    displayName: "",
    dateOfBirth: "",
    heightCm: 170,
    nationality: "",
    country: "",
    state: "",
    city: "",
    religion: "",
    languagesSpoken: ["English"],

    // Step 2: Identity
    gender: "",
    orientation: "",
    pronouns: "",
    outnessStatus: "",

    // Step 3: Marital Status
    maritalStatus: "Never Married",

    // Step 4: Education & Work
    education: "Bachelor's Degree",
    degree: "",
    sector: "Private / IT",
    profession: "",
    annualIncome: "",

    // Step 5: Upload Photos
    photos: [],
    photoVisibility: "MUTUAL_MATCHES_ONLY",

    // Step 6: Bio
    bio: "",

    // Step 7: More About You (Lifestyle)
    diet: "Vegetarian",
    drinking: "Non-drinker",
    smoking: "Non-smoker",
    hobbies: [],

    // Privacy (retained from system)
    ghostModeEnabled: false,

    // Partner Preferences (Looking for)
    preferredGenders: ["MAN"],
    preferredOrientations: ["GAY"],
    minAge: 22,
    maxAge: 32,
    acceptableOutness: ["DISCREET_NOT_OUT", "OUT_TO_SELECT_FEW", "OUT_TO_ALL"],
  };

  const storageKey = user?.id ? `everpride_onboarding_draft_${user.id}` : "everpride_onboarding_draft";

  // Form State initialized from localStorage draft if present
  const [formData, setFormData] = useState<OnboardingFormData>(() => {
    try {
      const saved = localStorage.getItem(user?.id ? `everpride_onboarding_draft_${user.id}` : "everpride_onboarding_draft");
      if (saved) {
        return { ...initialFormData, ...JSON.parse(saved) };
      }
    } catch { }
    return initialFormData;
  });

  // Step initialized from localStorage if present
  const [step, setStep] = useState<number>(() => {
    try {
      const key = user?.id ? `everpride_onboarding_step_${user.id}` : "everpride_onboarding_step";
      const savedStep = localStorage.getItem(key);
      if (savedStep) {
        const parsed = parseInt(savedStep, 10);
        if (parsed >= 1 && parsed <= 7) return parsed;
      }
    } catch { }
    return 1;
  });

  // Auto-save form data changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch { }
  }, [formData, storageKey]);

  // Auto-save step changes to localStorage
  useEffect(() => {
    try {
      const stepKey = user?.id ? `everpride_onboarding_step_${user.id}` : "everpride_onboarding_step";
      localStorage.setItem(stepKey, step.toString());
    } catch { }
  }, [step, user?.id]);

  // Pull initial preferences from landing page hero if available and no draft saved
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (!savedDraft) {
        const heroPref = localStorage.getItem("everpride_hero_preferences");
        if (heroPref) {
          const parsed = JSON.parse(heroPref);
          setFormData((prev) => ({
            ...prev,
            preferredGenders: [parsed.gender || "MAN"],
            preferredOrientations: [parsed.orientation || "GAY"],
            minAge: parsed.minAge || 22,
            maxAge: parsed.maxAge || 32,
          }));
        }
      }
    } catch { }
  }, [storageKey]);

  const totalSteps = 7;
  const progressPercent = Math.round((step / totalSteps) * 100);

  const stepTitles = [
    "About You",
    "Identity & Pronouns",
    "Marital Status",
    "Education & Work",
    "Upload Photos",
    "Bio / About You",
    "More About You (Lifestyle)",
  ];

  const handleChange = (field: string, value: any) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "languagesSpoken" | "hobbies", value: string) => {
    setError(null);
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((x) => x !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // STEP VALIDATIONS
  const validateCurrentStep = (): boolean => {
    setError(null);

    // Step 1: About You
    if (step === 1) {
      if (!formData.displayName.trim() || formData.displayName.trim().length < 2) {
        setError("Display Name is required (at least 2 characters).");
        return false;
      }
      if (!formData.dateOfBirth) {
        setError("Date of birth is required.");
        return false;
      }
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        setError("Please select a valid date of birth.");
        return false;
      }
      const ageDiffMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) {
        setError("You must be at least 18 years old to create a profile.");
        return false;
      }
      if (!formData.state.trim() || !formData.city.trim()) {
        setError("Please select your State and City.");
        return false;
      }
    }

    // Step 2: Identity
    if (step === 2) {
      if (!formData.gender) {
        setError("Please select your Gender Identity.");
        return false;
      }
      if (!formData.orientation) {
        setError("Please select your Sexual / Romantic Orientation.");
        return false;
      }
      if (!formData.outnessStatus) {
        setError("Please select your Outness Status.");
        return false;
      }
    }

    // Step 5: Photos
    if (step === 5) {
      // Photo uploading can be skipped or added, but privacy tier must be set
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setError(null);
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle real device photo upload with client-side compression
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
    // Reset file input value to allow uploading the same file again if desired
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    handleChange(
      "photos",
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create the profile
      const payload = {
        displayName: formData.displayName.trim(),
        gender: formData.gender,
        orientation: formData.orientation,
        pronouns: formData.pronouns.trim() || undefined,
        outnessStatus: formData.outnessStatus,
        dateOfBirth: formData.dateOfBirth,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        nationality: formData.nationality.trim() || "India",
        religion: formData.religion.trim() || undefined,
        motherTongue: formData.languagesSpoken[0] || "English",
        languagesSpoken: formData.languagesSpoken,
        maritalStatus: formData.maritalStatus,
        phoneNumber: user?.phoneNumber || undefined,
        phoneVerified: true,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        education: formData.education.trim() || undefined,
        degree: formData.degree.trim() || undefined,
        sector: formData.sector.trim() || undefined,
        profession: formData.profession.trim() || undefined,
        annualIncome: undefined,
        photos: formData.photos,
        bio: formData.bio.trim() || undefined,
        diet: formData.diet.trim() || undefined,
        drinking: formData.drinking || undefined,
        smoking: formData.smoking || undefined,
        hobbies: formData.hobbies,
        photoVisibility: formData.photoVisibility,
        ghostModeEnabled: formData.ghostModeEnabled,
        partnerPreference: {
          preferredGenders: formData.preferredGenders,
          preferredOrientations: formData.preferredOrientations,
          minAge: Number(formData.minAge),
          maxAge: Number(formData.maxAge),
          acceptableOutness: formData.acceptableOutness,
        },
      };

      await api.post("/profiles", payload);
      await fetchProfile();
      localStorage.removeItem("everpride_hero_preferences");
      localStorage.removeItem(storageKey);
      localStorage.removeItem(user?.id ? `everpride_onboarding_step_${user.id}` : "everpride_onboarding_step");
      localStorage.removeItem("everpride_onboarding_draft");
      localStorage.removeItem("everpride_onboarding_step");
      navigate("/discover");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete onboarding. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 max-w-2xl mx-auto">
      {/* ONBOARDING COMPLETION PERCENTAGE HEADER */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              STEP {step} OF {totalSteps}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-extrabold text-brand-600 truncate max-w-[220px] sm:max-w-none">
              {stepTitles[step - 1]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900">{progressPercent}%</span>
            <span className="text-[11px] text-slate-400 font-semibold">Completed</span>
          </div>
        </div>

        {/* Dynamic Rainbow Progress Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-pink-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/80 p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2 animate-shake">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: ABOUT YOU ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">About You</h2>
                <p className="text-xs text-slate-500">Basic personal information to establish your profile.</p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Name / Display Alias <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: You do not need to use your legal name. You may use your chosen name or alias.
              </p>
            </div>

            {/* DOB & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleChange("heightCm", parseInt(e.target.value) || 170)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
                  {allCountries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State / Province <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  disabled={!formData.nationality}
                  onChange={(e) => {
                    handleChange("state", e.target.value);
                    handleChange("city", "");
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">{formData.nationality ? "Select" : "Select Nationality First"}</option>
                  {formData.nationality &&
                    getStatesForCountry(formData.nationality).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.city}
                  disabled={!formData.state}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">{formData.state ? "Select" : "Select State First"}</option>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Religion / Beliefs
                </label>
                <select
                  value={formData.religion}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
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

            {/* Languages Spoken: Top 50 most spoken languages in alphabetical order */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Languages Spoken
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.languagesSpoken.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-1.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                {[
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
                ].map((lang) => {
                  const selected = formData.languagesSpoken.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleArrayItem("languagesSpoken", lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${selected
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
        )}

        {/* ── STEP 2: IDENTITY ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Identity & Pronouns</h2>
                <p className="text-xs text-slate-500">
                  Affirm your authentic gender identity, sexual orientation, and outness.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender Identity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sexual / Romantic Orientation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.orientation}
                  onChange={(e) => handleChange("orientation", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pronouns
                </label>
                <input
                  type="text"
                  placeholder="e.g. they/them, she/her, he/him"
                  value={formData.pronouns}
                  onChange={(e) => handleChange("pronouns", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Outness Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.outnessStatus}
                  onChange={(e) => handleChange("outnessStatus", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
                  <option value="DISCREET_NOT_OUT">Discreet / Not out</option>
                  <option value="OUT_TO_SELECT_FEW">Out to select few friends</option>
                  <option value="OUT_TO_ALL">Openly out</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: MARITAL STATUS ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Marital Status</h2>
                <p className="text-xs text-slate-500">Your current legal/marital background.</p>
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
                  className={`block p-4 rounded-xl border cursor-pointer transition-all ${formData.maritalStatus === status.id
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
                  <p className="text-xs text-slate-500 mt-1">{status.desc}</p>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: EDUCATION & WORK ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Education & Work</h2>
                <p className="text-xs text-slate-500">Your academic qualifications and career path.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highest Qualification
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Degree / Major
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Economics"
                  value={formData.degree}
                  onChange={(e) => handleChange("degree", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sector of Work
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleChange("sector", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Title / Profession
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Product Designer, Architect"
                  value={formData.profession}
                  onChange={(e) => handleChange("profession", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: UPLOAD PHOTOS ── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Upload Photos & Privacy</h2>
                <p className="text-xs text-slate-500">
                  Your photos are protected by EverPride's privacy blur shields.
                </p>
              </div>
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-3 gap-3">
              {formData.photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {formData.photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-brand-600 transition-all cursor-pointer bg-slate-50/50 hover:bg-brand-50/20 p-2 text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-brand-600" />
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-brand-600">
                    + Upload Photo
                  </span>
                  <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                </label>
              )}
            </div>

            {/* Photo Privacy Rule */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Photo Privacy Shield Setting
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
                    desc: "Photos remain blurred with a lock icon. Members must request access individually.",
                  },
                  {
                    id: "ALL_MEMBERS",
                    title: "Visible to All Members",
                    desc: "Photos are clear to any signed-in verified member.",
                  },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    onClick={() => handleChange("photoVisibility", tier.id)}
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${formData.photoVisibility === tier.id
                      ? "border-brand-500 bg-brand-50/50"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{tier.title}</span>
                      {formData.photoVisibility === tier.id && (
                        <Check className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{tier.desc}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: BIO ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Your Bio / About You</h2>
                <p className="text-xs text-slate-500">
                  Introduce yourself to prospective partners in your own words.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                About Yourself & Life Goals
              </label>
              <textarea
                rows={6}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Share your values, personality, passions, and what kind of life partner you hope to build a future with..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Profiles with thoughtful bios receive 3x more meaningful mutual matches.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 7: MORE ABOUT YOU (LIFESTYLE) ── */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">More About You (Lifestyle)</h2>
                <p className="text-xs text-slate-500">Your dietary preferences, hobbies, and interests.</p>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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

            {/* Drinking Habits (Separately) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Drinking
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

            {/* Smoking Habits (Separately) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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

            {/* Hobbies & Interests - Unified Broad Categories in One Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hobbies & Interests
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select your favorite activities, passions, and lifestyle interests.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {formData.hobbies.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
                {HOBBIES_LIST.map((hobby) => {
                  const selected = formData.hobbies.includes(hobby);
                  return (
                    <button
                      type="button"
                      key={hobby}
                      onClick={() => toggleArrayItem("hobbies", hobby)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        selected
                          ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:text-brand-600"
                      }`}
                    >
                      {hobby}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION CONTROLS */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleNext}
            className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700 shadow-md shadow-brand-500/25 flex items-center gap-2 cursor-pointer transition-all ml-auto"
          >
            {step === totalSteps ? (
              loading ? "Creating Profile..." : "Complete Profile & Discover Matches"
            ) : (
              <>
                Next Step <ArrowRight className="w-4 h-4" />
              </>
            )}
            {step === totalSteps && !loading && <UserCheck className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
