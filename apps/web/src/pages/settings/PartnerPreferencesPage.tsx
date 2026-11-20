import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Heart } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import {
  Button,
  SelectableChip,
  AlertBanner,
  SectionCard,
} from "../../components/ui";
import { AgeRangeSlider } from "../../components/common/AgeRangeSlider";

export const PartnerPreferencesPage: React.FC = () => {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferredGenders, setPreferredGenders] = useState<string[]>(
    profile?.partnerPreference?.preferredGenders || ["MAN"]
  );
  const [preferredOrientations, setPreferredOrientations] = useState<string[]>(
    profile?.partnerPreference?.preferredOrientations || ["GAY"]
  );
  const [minAge, setMinAge] = useState(
    profile?.partnerPreference?.minAge ?? 21
  );
  const [maxAge, setMaxAge] = useState(
    profile?.partnerPreference?.maxAge ?? 35
  );

  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minAge > maxAge) {
      setError("Minimum age cannot be greater than maximum age.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const partnerPreference = {
        preferredGenders,
        preferredOrientations,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
      };

      const res = await api.patch("/profiles/me", { partnerPreference });
      if (res.data) {
        setProfile(res.data);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update partner preferences."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Looking For (Preferences)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Select partner preferences to match with the right members
          </p>
        </div>
      </div>

      {success && (
        <AlertBanner
          variant="success"
          message="Partner preferences updated successfully!"
          onClose={() => setSuccess(false)}
          className="mb-5"
        />
      )}

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <SectionCard
          title="Looking For (Preferences)"
          subtitle="Select partner preferences to match with the right members"
          icon={<Heart className="w-4 h-4" />}
          iconVariant="rose"
        >
          <div className="space-y-7">
            {/* Preferred Gender(s) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Gender(s) *
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
                ].map((item) => (
                  <SelectableChip
                    key={item.id}
                    selected={preferredGenders.includes(item.id)}
                    shape="rect"
                    onClick={() =>
                      toggleArrayItem(
                        preferredGenders,
                        setPreferredGenders,
                        item.id
                      )
                    }
                  >
                    {item.label}
                  </SelectableChip>
                ))}
              </div>
            </div>

            {/* Preferred Orientation(s) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Orientation(s) *
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
                ].map((item) => (
                  <SelectableChip
                    key={item.id}
                    selected={preferredOrientations.includes(item.id)}
                    shape="rect"
                    onClick={() =>
                      toggleArrayItem(
                        preferredOrientations,
                        setPreferredOrientations,
                        item.id
                      )
                    }
                  >
                    {item.label}
                  </SelectableChip>
                ))}
              </div>
            </div>

            {/* Partner Age Range Slider */}
            <AgeRangeSlider
              minAge={minAge}
              maxAge={maxAge}
              onChange={(min, max) => {
                setMinAge(min);
                setMaxAge(max);
              }}
            />
          </div>
        </SectionCard>

        {/* Sticky Submit Button */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Matches are filtered instantly using your partner criteria.
          </span>
          <Button
            type="submit"
            isLoading={loading}
            variant="gradient"
            icon={<Save className="w-4 h-4" />}
            size="md"
            className="w-full sm:w-auto px-7 ml-auto shadow-md shadow-brand-500/20"
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

