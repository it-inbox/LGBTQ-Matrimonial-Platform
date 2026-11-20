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
  UploadCloud,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Lock,
  Eye,
  Users,
} from "lucide-react";
import {
  ALL_COUNTRIES,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  OUTNESS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  QUALIFICATION_OPTIONS,
  DEGREE_OPTIONS,
  DEGREE_OPTIONS_BY_QUALIFICATION,
  getDegreesForQualification,
  SECTOR_OPTIONS,
  RELIGION_OPTIONS,
  LANGUAGE_OPTIONS,
  HOBBY_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  PHOTO_VISIBILITY_OPTIONS,
  ANNUAL_INCOME_OPTIONS,
  PET_OPTIONS,
  CHILDREN_OPTIONS,
} from "@everpride/shared";
import { SearchableSelect } from "../../components/common/SearchableSelect";
import { MultiSearchableSelect } from "../../components/common/MultiSearchableSelect";
import { AgeRangeSlider } from "../../components/common/AgeRangeSlider";
import { SelectableChip, ChoiceCard, AlertBanner } from "../../components/ui";
import { getStatesForCountry, getCitiesForState, getCitiesForCountry } from "../../data/locations";

export interface EducationEntry {
  qualification?: string;
  degree: string;
  degreeName?: string;
  major?: string;
  institution: string;
  year?: number;
}

export interface OnboardingFormData {
  displayName: string;
  dateOfBirth: string;
  heightCm: number;
  country: string;
  state: string;
  city: string;
  nationality: string;
  originCountry?: string;
  originCity?: string;
  religion: string;
  languagesSpoken: string[];
  gender: string;
  orientation: string;
  pronouns: string;
  outnessStatus: string;
  maritalStatus: string;
  education: string;
  degree: string;
  educations: EducationEntry[];
  sector: string;
  profession: string;
  annualIncome: string;
  photos: string[];
  photoVisibility: string;
  bio: string;
  diet: string;
  drinking: string;
  smoking: string;
  pets?: string;
  children?: string;
  hobbies: string[];
  ghostModeEnabled: boolean;
  preferredGenders: string[];
  preferredOrientations: string[];
  minAge: number;
  maxAge: number;
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, setProfile, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default Form State
  const initialFormData: OnboardingFormData = {
    // Step 1: About You
    displayName: "",
    dateOfBirth: "2000-01-01",
    heightCm: 170,
    nationality: "",
    originCountry: "",
    originCity: "",
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
    educations: [
      {
        degree: "Bachelor's Degree",
        major: "",
        institution: "",
      },
    ],
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
    pets: "",
    children: "",
    hobbies: [],

    // Privacy (retained from system)
    ghostModeEnabled: false,

    // Partner Preferences (Looking for)
    preferredGenders: ["MAN"],
    preferredOrientations: ["GAY"],
    minAge: 22,
    maxAge: 32,
  };

  const storageKey = user?.id ? `everpride_onboarding_draft_${user.id}` : "everpride_onboarding_draft";

  // Form State initialized from localStorage draft if present
  const [formData, setFormData] = useState<OnboardingFormData>(() => {
    try {
      const saved = localStorage.getItem(user?.id ? `everpride_onboarding_draft_${user.id}` : "everpride_onboarding_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean legacy cached strings with parenthetical examples
        if (parsed.educations && Array.isArray(parsed.educations)) {
          parsed.educations = parsed.educations.map((edu: any) => ({
            ...edu,
            degree: (edu.degree || "")
              .replace(/\s*\(MBA.*?\)/i, "")
              .replace(/\s*\(BTech.*?\)/i, "")
              .replace(/\s*\/\s*Associate Degree/i, "")
              .trim() || "Bachelor's Degree",
          }));
        }
        return { ...initialFormData, ...parsed };
      }
    } catch { }
    return initialFormData;
  });

  // Step initialized from localStorage if present.
  // If user came via "Let's Begin" (has saved hero preferences), skip Step 1 (Looking For) and start directly at Step 2!
  const [step, setStep] = useState<number>(() => {
    try {
      const key = user?.id ? `everpride_onboarding_step_${user.id}` : "everpride_onboarding_step";
      const savedStep = localStorage.getItem(key);
      if (savedStep) {
        const parsed = parseInt(savedStep, 10);
        if (parsed >= 1 && parsed <= 10) return parsed;
      }
      const heroPref = localStorage.getItem("everpride_hero_preferences");
      if (heroPref) {
        return 2; // Jump straight to About You
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

  // Track whether the user selected preferences on the landing page ("Let's Begin" flow)
  const hasLandingPreferences = Boolean(localStorage.getItem("everpride_hero_preferences"));
  const minStep = hasLandingPreferences ? 2 : 1;
  const totalSteps = 10;
  const effectiveTotalSteps = hasLandingPreferences ? 9 : 10;
  const effectiveCurrentStep = hasLandingPreferences ? step - 1 : step;
  const progressPercent = Math.round((effectiveCurrentStep / effectiveTotalSteps) * 100);

  const stepTitles = [
    "Looking For (Preferences)",
    "About You",
    "Identity",
    "Marital Status",
    "Education Details",
    "Career",
    "Picture Privacy Settings",
    "Your Pictures",
    "Bio",
    "Lifestyle & Interests",
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

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...(prev.educations || []),
        { degree: "Bachelor's Degree", major: "", institution: "" },
      ],
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationEntry, value: any) => {
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
        // Sync primary education/degree for cards & preview
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
        degree: updated[0]?.degreeName || updated[0]?.major || "",
      };
    });
  };

  // STEP VALIDATIONS
  const validateCurrentStep = (): boolean => {
    setError(null);

    // Step 1: Looking For (Partner Preferences)
    if (step === 1) {
      if (!formData.preferredGenders || formData.preferredGenders.length === 0) {
        setError("Please select at least one preferred gender.");
        return false;
      }
      if (!formData.preferredOrientations || formData.preferredOrientations.length === 0) {
        setError("Please select at least one preferred orientation.");
        return false;
      }
      if (formData.minAge > formData.maxAge) {
        setError("Minimum age cannot be greater than maximum age.");
        return false;
      }
    }

    // Step 2: About You
    if (step === 2) {
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
      if (!formData.country.trim()) {
        setError("Please select your Country of Residence.");
        return false;
      }
      if (!formData.state.trim() || !formData.city.trim()) {
        setError("Please select your State and City.");
        return false;
      }
    }

    // Step 3: Identity
    if (step === 3) {
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

    // Step 7: Photo Privacy Shield Setting (defaults to MUTUAL_MATCHES_ONLY)
    if (step === 7) {
      if (!formData.photoVisibility) {
        setError("Please select a Photo Privacy Shield setting.");
        return false;
      }
    }

    // Step 8: Upload Photos (optional to skip, but must be valid if uploaded)
    if (step === 8) {
      // Photo uploading can be optional or populated
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
    if (step > minStep) {
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
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        originCountry: formData.originCountry?.trim() || undefined,
        originCity: formData.originCity?.trim() || undefined,
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
        photos: formData.photos,
        bio: formData.bio.trim() || undefined,
        diet: formData.diet.trim() || undefined,
        drinking: formData.drinking || undefined,
        smoking: formData.smoking || undefined,
        pets: formData.pets ? formData.pets.trim() : undefined,
        children: formData.children ? formData.children.trim() : undefined,
        hobbies: formData.hobbies,
        photoVisibility: formData.photoVisibility,
        ghostModeEnabled: formData.ghostModeEnabled,
        partnerPreference: {
          preferredGenders: formData.preferredGenders,
          preferredOrientations: formData.preferredOrientations,
          minAge: Number(formData.minAge),
          maxAge: Number(formData.maxAge),
        },
      };

      const res = await api.post("/profiles", payload);
      setProfile(res.data);
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
              STEP {effectiveCurrentStep} OF {effectiveTotalSteps}
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
          <AlertBanner
            variant="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6 animate-shake"
          />
        )}

        {/* ── STEP 1: LOOKING FOR (PARTNER PREFERENCES) ── */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Looking For (Preferences)</h2>
            </div>

            {/* Preferred Genders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  PREFERRED GENDER(S) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.preferredGenders.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const selected = formData.preferredGenders.includes(g.value);
                  return (
                    <SelectableChip
                      key={g.value}
                      selected={selected}
                      shape="rect"
                      onClick={() => {
                        const current = formData.preferredGenders;
                        const next = current.includes(g.value)
                          ? current.filter((x) => x !== g.value)
                          : [...current, g.value];
                        handleChange("preferredGenders", next);
                      }}
                    >
                      {g.label}
                    </SelectableChip>
                  );
                })}
              </div>
            </div>

            {/* Preferred Orientations */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  PREFERRED ORIENTATION(S) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.preferredOrientations.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((o) => {
                  const selected = formData.preferredOrientations.includes(o.value);
                  return (
                    <SelectableChip
                      key={o.value}
                      selected={selected}
                      shape="rect"
                      onClick={() => {
                        const current = formData.preferredOrientations;
                        const next = current.includes(o.value)
                          ? current.filter((x) => x !== o.value)
                          : [...current, o.value];
                        handleChange("preferredOrientations", next);
                      }}
                    >
                      {o.label}
                    </SelectableChip>
                  );
                })}
              </div>
            </div>

            {/* Partner Age Range Slider */}
            <div className="pt-2 border-t border-slate-100">
              <AgeRangeSlider
                minAge={formData.minAge}
                maxAge={formData.maxAge}
                onChange={(min, max) => {
                  handleChange("minAge", min);
                  handleChange("maxAge", max);
                }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: ABOUT YOU ── */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">About You</h2>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                NAME <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Note: You do not need to use your legal name. You may use your chosen name or alias.
              </p>
            </div>

            {/* DOB */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                DATE OF BIRTH <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Height */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                HEIGHT (CM)
              </label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => handleChange("heightCm", parseInt(e.target.value) || 170)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Current Residence Section */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block mb-4">
                Current Residence
              </span>
              <div className="space-y-4">
                <SearchableSelect
                  label="COUNTRY"
                  required
                  value={formData.country}
                  options={ALL_COUNTRIES.map((c) => ({ label: c.name, value: c.name }))}
                  placeholder="Select country..."
                  onChange={(newCountry) => {
                    handleChange("country", newCountry);
                    handleChange("state", "");
                    handleChange("city", "");
                  }}
                />

                <SearchableSelect
                  label="STATE"
                  required
                  disabled={!formData.country}
                  disabledMessage="Select Country First"
                  value={formData.state}
                  options={
                    formData.country
                      ? getStatesForCountry(formData.country)
                      : []
                  }
                  placeholder="Select state..."
                  onChange={(newState) => {
                    handleChange("state", newState);
                    handleChange("city", "");
                  }}
                />

                <SearchableSelect
                  label="CITY"
                  required
                  disabled={!formData.state}
                  disabledMessage="Select State First"
                  value={formData.city}
                  options={
                    formData.country && formData.state
                      ? getCitiesForState(formData.country, formData.state)
                      : []
                  }
                  placeholder="Select city..."
                  onChange={(newCity) => handleChange("city", newCity)}
                />
              </div>
            </div>

            {/* Origin & Demographics Section */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block mb-4">
                Origin & Citizenship
              </span>
              <div className="space-y-4">
                <SearchableSelect
                  label="NATIONALITY / CITIZENSHIP"
                  value={formData.nationality}
                  options={ALL_COUNTRIES.map((c) => ({ label: c.name, value: c.name }))}
                  placeholder="Select nationality..."
                  onChange={(newNat) => handleChange("nationality", newNat)}
                />

                <SearchableSelect
                  label="COUNTRY OF ORIGIN"
                  value={formData.originCountry || ""}
                  options={ALL_COUNTRIES.map((c) => ({ label: c.name, value: c.name }))}
                  placeholder="Select origin country..."
                  onChange={(newOrig) => handleChange("originCountry", newOrig)}
                />

                <SearchableSelect
                  label="HOMETOWN"
                  value={formData.originCity || ""}
                  disabled={!formData.originCountry && !formData.nationality}
                  disabledMessage="Select Country of Origin or Nationality First"
                  options={
                    (formData.originCountry || formData.nationality)
                      ? getCitiesForCountry(formData.originCountry || formData.nationality)
                      : []
                  }
                  placeholder="Select hometown..."
                  onChange={(newCity) => handleChange("originCity", newCity)}
                />
              </div>
            </div>

            {/* Religion */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                RELIGION
              </label>
              <select
                value={formData.religion}
                onChange={(e) => handleChange("religion", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">Select</option>
                {RELIGION_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages */}
            <div className="pt-2 border-t border-slate-100">
              <MultiSearchableSelect
                label="LANGUAGES"
                values={formData.languagesSpoken}
                options={LANGUAGE_OPTIONS}
                placeholder="Search & select languages..."
                onChange={(newLangs) => handleChange("languagesSpoken", newLangs)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: IDENTITY ── */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Identity</h2>
            </div>

            {/* Gender Identity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                GENDER IDENTITY <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const selected = formData.gender === g.value;
                  return (
                    <SelectableChip
                      key={g.value}
                      selected={selected}
                      shape="rect"
                      onClick={() => handleChange("gender", g.value)}
                    >
                      {g.label}
                    </SelectableChip>
                  );
                })}
              </div>
            </div>

            {/* Sexual Orientation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SEXUAL ORIENTATION <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((o) => {
                  const selected = formData.orientation === o.value;
                  return (
                    <SelectableChip
                      key={o.value}
                      selected={selected}
                      shape="rect"
                      onClick={() => handleChange("orientation", o.value)}
                    >
                      {o.label}
                    </SelectableChip>
                  );
                })}
              </div>
            </div>

            {/* Pronouns */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PRONOUNS
              </label>
              <input
                type="text"
                placeholder="e.g. he/him, she/her, they/them"
                value={formData.pronouns}
                onChange={(e) => handleChange("pronouns", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Outness Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ARE YOU OUT OF THE CLOSET <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {OUTNESS_OPTIONS.map((out) => {
                  const selected = formData.outnessStatus === out.id;
                  return (
                    <button
                      type="button"
                      key={out.id}
                      onClick={() => handleChange("outnessStatus", out.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${selected
                        ? "bg-rose-50/70 border-rose-500 text-rose-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 font-medium"
                        }`}
                    >
                      <span className="text-xs">{out.label}</span>
                      {selected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: MARITAL STATUS ── */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Marital Status</h2>
            </div>

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
          </div>
        )}

        {/* ── STEP 5: EDUCATION ── */}
        {step === 5 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Education Details</h2>
            </div>

            {/* Qualifications & Degrees (Multiple) */}
            <div className="space-y-4">
              <div className="space-y-3">
                {(formData.educations || []).map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 relative group"
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

                    <div className="space-y-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {QUALIFICATION_OPTIONS.map((q) => {
                            const isSelected = edu.degree === q;
                            return (
                              <SelectableChip
                                key={q}
                                selected={isSelected}
                                shape="rect"
                                onClick={() => handleUpdateEducation(idx, "degree", q)}
                              >
                                {q}
                              </SelectableChip>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {edu.degree !== "High School" && (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                DEGREE <span className="text-rose-500">*</span>
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
                                FIELD OF STUDY
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
                              ? "SCHOOL"
                              : edu.degree === "Diploma" || edu.degree === "Other"
                                ? "INSTITUTION"
                                : "UNIVERSITY"}{" "}
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
          </div>
        )}

        {/* ── STEP 6: CAREER ── */}
        {step === 6 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Career</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SECTOR
                </label>
                <div className="flex flex-wrap gap-2">
                  {SECTOR_OPTIONS.map((sec) => {
                    const selected = formData.sector === sec;
                    return (
                      <SelectableChip
                        key={sec}
                        selected={selected}
                        shape="rect"
                        onClick={() => handleChange("sector", sec)}
                      >
                        {sec}
                      </SelectableChip>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  JOB TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Product Designer, Architect"
                  value={formData.profession}
                  onChange={(e) => handleChange("profession", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ANNUAL INCOME
                </label>
                <select
                  value={formData.annualIncome || ""}
                  onChange={(e) => handleChange("annualIncome", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium"
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
          </div>
        )}

        {/* ── STEP 7: PICTURE PRIVACY SETTINGS ── */}
        {step === 7 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Picture Privacy Settings</h2>
            </div>

            {/* Interactive Animated Simulation */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                {/* Visual Preview Card */}
                <div className="w-28 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden border border-white/20 bg-slate-800 relative shadow-md shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Privacy Demo"
                    className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${formData.photoVisibility === "ALL_MEMBERS"
                      ? "blur-0 scale-100"
                      : "blur-lg scale-110 brightness-75"
                      }`}
                  />

                  {formData.photoVisibility !== "ALL_MEMBERS" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-black/40 backdrop-blur-xs">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-1 shadow border border-white/30">
                        {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" ? (
                          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-300" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-white">
                        {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" ? "Shielded" : "Locked"}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Preview</span>
                  </div>
                </div>

                {/* Concise Summary */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-brand-300">
                    Active Protection
                  </span>

                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" && "Mutual Matches Only"}
                    {formData.photoVisibility === "REQUEST_REQUIRED" && "Require My Approval"}
                    {formData.photoVisibility === "ALL_MEMBERS" && "Visible to All Members"}
                  </h3>

                  <p className="text-xs text-slate-300 leading-snug">
                    {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" && (
                      <>Photos stay blurred until <strong>both of you like each other</strong>. Safe & mutual.</>
                    )}
                    {formData.photoVisibility === "REQUEST_REQUIRED" && (
                      <>Photos stay locked. Members must <strong>request access</strong> and get your direct approval.</>
                    )}
                    {formData.photoVisibility === "ALL_MEMBERS" && (
                      <>Photos are <strong>visible immediately</strong> to all verified, logged-in members.</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Concise Selection Cards */}
            <div className="space-y-2.5">
              {[
                {
                  id: "MUTUAL_MATCHES_ONLY",
                  title: "Mutual Matches Only",
                  badge: "Recommended",
                  badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
                  icon: Users,
                  desc: "Photos unblur automatically only when interest is mutual.",
                  example: "Stay blurred to strangers; unblurs once you both connect.",
                },
                {
                  id: "REQUEST_REQUIRED",
                  title: "Require My Approval",
                  badge: "Maximum Privacy",
                  badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
                  icon: Lock,
                  desc: "Photos remain locked until you accept individual requests.",
                  example: "You review and grant photo access one member at a time.",
                },
                {
                  id: "ALL_MEMBERS",
                  title: "Visible to All Members",
                  badge: "Open",
                  badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
                  icon: Eye,
                  desc: "Photos are clear to any verified member right away.",
                  example: "Best for active discovery and direct matchmaking.",
                },
              ].map((tier) => {
                const IconComponent = tier.icon;
                const isSelected = formData.photoVisibility === tier.id;
                return (
                  <ChoiceCard
                    key={tier.id}
                    selected={isSelected}
                    title={tier.title}
                    description={`${tier.desc} (${tier.example})`}
                    icon={<IconComponent className="w-4 h-4" />}
                    badge={
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    }
                    onClick={() => handleChange("photoVisibility", tier.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 8: YOUR PICTURES ── */}
        {step === 8 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Your Pictures</h2>
            </div>

            {/* Current Privacy Shield Status Indicator */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-50/70 border border-brand-200">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-brand-900 block">
                    Protected by:{" "}
                    {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" && "Mutual Matches Only"}
                    {formData.photoVisibility === "REQUEST_REQUIRED" && "Require My Approval"}
                    {formData.photoVisibility === "ALL_MEMBERS" && "Visible to All Members"}
                  </span>
                  <span className="text-[11px] text-brand-700">
                    Your photos will be blurred or locked in accordance with this setting.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Change
              </button>
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

            <p className="text-xs text-slate-400">
              Tip: You can upload up to 6 photos. The first photo will be your primary profile picture.
            </p>
          </div>
        )}

        {/* ── STEP 9: BIO ── */}
        {step === 9 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Bio</h2>
            </div>

            <div>
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

        {/* ── STEP 10: MORE ABOUT YOU (LIFESTYLE) ── */}
        {step === 10 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">Lifestyle & Interests</h2>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                DIETARY PREFERENCE
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Vegetarian", "Vegan", "Eggetarian", "Non-Vegetarian"].map((dietOption) => (
                  <SelectableChip
                    key={dietOption}
                    selected={formData.diet === dietOption}
                    shape="rect"
                    onClick={() => handleChange("diet", dietOption)}
                  >
                    {dietOption}
                  </SelectableChip>
                ))}
              </div>
            </div>

            {/* Drinking Habits (Separately) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                DRINKING
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Non-drinker", label: "Non-drinker" },
                  { id: "Socially", label: "Social drinker" },
                  { id: "Regularly", label: "Regularly" },
                ].map((drinkOption) => (
                  <SelectableChip
                    key={drinkOption.id}
                    selected={formData.drinking === drinkOption.id}
                    shape="rect"
                    onClick={() => handleChange("drinking", drinkOption.id)}
                  >
                    {drinkOption.label}
                  </SelectableChip>
                ))}
              </div>
            </div>

            {/* Smoking Habits (Separately) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SMOKING
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Non-smoker", label: "Non-smoker" },
                  { id: "Occasionally", label: "Occasionally" },
                  { id: "Regularly", label: "Regularly" },
                  { id: "Trying to quit", label: "Trying to quit" },
                ].map((smokeOption) => (
                  <SelectableChip
                    key={smokeOption.id}
                    selected={formData.smoking === smokeOption.id}
                    shape="rect"
                    onClick={() => handleChange("smoking", smokeOption.id)}
                  >
                    {smokeOption.label}
                  </SelectableChip>
                ))}
              </div>
            </div>

            {/* Pet Preferences */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                PET PREFERENCES
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                CHILDREN PREFERENCES
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

            {/* Hobbies & Interests - Unified Broad Categories in One Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    HOBBIES & INTERESTS
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select your favorite activities, passions, and lifestyle interests.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {formData.hobbies.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {HOBBY_OPTIONS.map((hobby) => {
                  const selected = formData.hobbies.includes(hobby);
                  return (
                    <SelectableChip
                      key={hobby}
                      selected={selected}
                      shape="pill"
                      onClick={() => toggleArrayItem("hobbies", hobby)}
                    >
                      {hobby}
                    </SelectableChip>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION CONTROLS (OUTSIDE CARD) */}
      <div className="flex items-center justify-between gap-3 mt-6">
        {step > minStep ? (
          <button
            type="button"
            onClick={handleBack}
            className="py-2.5 px-5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
  );
};
