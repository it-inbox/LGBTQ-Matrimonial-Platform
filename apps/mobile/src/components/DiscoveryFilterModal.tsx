import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  RotateCcw,
} from "lucide-react-native";
import {
  ALL_COUNTRIES,
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "@everpride/shared";
import { MobileAgeRangeSlider } from "./MobileAgeRangeSlider";

export interface DiscoveryFilters {
  nationalities: string[];
  religions: string[];
  maritalStatuses: string[];
  minAge: number;
  maxAge: number;
}

interface DiscoveryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  onApply: (filters: DiscoveryFilters) => void;
  totalMatchesCount?: number;
}

export const DiscoveryFilterModal: React.FC<DiscoveryFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  totalMatchesCount,
}) => {
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>(
    filters.nationalities || []
  );
  const [selectedReligions, setSelectedReligions] = useState<string[]>(
    filters.religions || []
  );
  const [selectedMaritalStatuses, setSelectedMaritalStatuses] = useState<string[]>(
    filters.maritalStatuses || []
  );
  const [ageRange, setAgeRange] = useState({
    min: filters.minAge ?? 18,
    max: filters.maxAge ?? 60,
  });

  const [nationalitySearch, setNationalitySearch] = useState("");
  const [showNationalitySearchModal, setShowNationalitySearchModal] = useState(false);

  const toggleItem = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((x) => x !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const handleReset = () => {
    setSelectedNationalities([]);
    setSelectedReligions([]);
    setSelectedMaritalStatuses([]);
    setAgeRange({ min: 18, max: 60 });
    onApply({
      nationalities: [],
      religions: [],
      maritalStatuses: [],
      minAge: 18,
      maxAge: 60,
    });
    onClose();
  };

  const handleApply = () => {
    onApply({
      nationalities: selectedNationalities,
      religions: selectedReligions,
      maritalStatuses: selectedMaritalStatuses,
      minAge: ageRange.min,
      maxAge: ageRange.max,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl border-t border-slate-200 max-h-[85%] flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center">
                <SlidersHorizontal size={16} color="#e11d48" />
              </View>
              <Text className="text-base font-bold text-slate-900">
                Filter Criteria
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Filters Body */}
          <ScrollView className="p-4 space-y-5" showsVerticalScrollIndicator={true}>
            {/* 1. Nationality Filter */}
            <View className="space-y-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nationality{" "}
                  {selectedNationalities.length > 0 && (
                    <Text className="text-rose-600">
                      ({selectedNationalities.length})
                    </Text>
                  )}
                </Text>
                {selectedNationalities.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedNationalities([])}>
                    <Text className="text-[11px] text-rose-600 font-semibold">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setShowNationalitySearchModal(true)}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-2"
              >
                <Search size={14} color="#94a3b8" />
                <Text className="text-xs text-slate-500 ml-2">
                  Add / Search Nationalities...
                </Text>
              </TouchableOpacity>

              {/* Selected Tags */}
              {selectedNationalities.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mb-2">
                  {selectedNationalities.map((nat) => (
                    <TouchableOpacity
                      key={nat}
                      onPress={() =>
                        toggleItem(
                          selectedNationalities,
                          setSelectedNationalities,
                          nat
                        )
                      }
                      className="flex-row items-center gap-1 bg-rose-600 px-2.5 py-1 rounded-lg"
                    >
                      <Text className="text-white text-xs font-semibold">
                        {nat}
                      </Text>
                      <X size={12} color="#ffffff" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 2. Religion Filter */}
            <View className="space-y-2 mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Community / Religion{" "}
                  {selectedReligions.length > 0 && (
                    <Text className="text-rose-600">
                      ({selectedReligions.length})
                    </Text>
                  )}
                </Text>
                {selectedReligions.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedReligions([])}>
                    <Text className="text-[11px] text-rose-600 font-semibold">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row flex-wrap gap-1.5">
                {RELIGION_OPTIONS.map((rel) => {
                  const sel = selectedReligions.includes(rel);
                  return (
                    <TouchableOpacity
                      key={rel}
                      onPress={() =>
                        toggleItem(selectedReligions, setSelectedReligions, rel)
                      }
                      className={`px-3 py-1.5 rounded-xl border ${
                        sel
                          ? "bg-rose-600 border-rose-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          sel ? "text-white font-bold" : "text-slate-700 font-medium"
                        }`}
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Marital Status Filter */}
            <View className="space-y-2 mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Marital Status{" "}
                  {selectedMaritalStatuses.length > 0 && (
                    <Text className="text-rose-600">
                      ({selectedMaritalStatuses.length})
                    </Text>
                  )}
                </Text>
                {selectedMaritalStatuses.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedMaritalStatuses([])}>
                    <Text className="text-[11px] text-rose-600 font-semibold">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row flex-wrap gap-1.5">
                {MARITAL_STATUS_OPTIONS.map((ms) => {
                  const sel = selectedMaritalStatuses.includes(ms.id);
                  return (
                    <TouchableOpacity
                      key={ms.id}
                      onPress={() =>
                        toggleItem(
                          selectedMaritalStatuses,
                          setSelectedMaritalStatuses,
                          ms.id
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl border ${
                        sel
                          ? "bg-rose-600 border-rose-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          sel ? "text-white font-bold" : "text-slate-700 font-medium"
                        }`}
                      >
                        {ms.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Age Range Slider */}
            <View className="space-y-2 mt-4 mb-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Age Range ({ageRange.min} - {ageRange.max === 60 ? "60+" : ageRange.max} yrs)
              </Text>
              <MobileAgeRangeSlider
                minAge={ageRange.min}
                maxAge={ageRange.max}
                minLimit={18}
                maxLimit={60}
                onChange={(min, max) => setAgeRange({ min, max })}
              />
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View className="flex-row items-center gap-3 p-4 border-t border-slate-200/90 bg-white">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 py-3 bg-slate-100 rounded-xl items-center justify-center border border-slate-200"
            >
              <Text className="text-xs font-bold text-slate-700">Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              className="flex-2 py-3 bg-rose-600 rounded-xl items-center justify-center"
            >
              <Text className="text-xs font-bold text-white">
                Apply Criteria {totalMatchesCount ? `(${totalMatchesCount})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Nested Nationality Search Modal */}
      <Modal visible={showNationalitySearchModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl border-t border-slate-200 max-h-[80%] p-4">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-base font-bold text-slate-900">
                Select Nationalities
              </Text>
              <TouchableOpacity onPress={() => setShowNationalitySearchModal(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 my-3">
              <Search size={15} color="#94a3b8" />
              <TextInput
                value={nationalitySearch}
                onChangeText={setNationalitySearch}
                placeholder="Search country / nationality..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-xs text-slate-800 ml-2 py-0"
              />
            </View>

            <ScrollView className="space-y-1">
              {ALL_COUNTRIES.filter((c) =>
                c.name.toLowerCase().includes(nationalitySearch.toLowerCase())
              ).map((c) => {
                const sel = selectedNationalities.includes(c.name);
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() =>
                      toggleItem(
                        selectedNationalities,
                        setSelectedNationalities,
                        c.name
                      )
                    }
                    className={`p-3 rounded-xl flex-row items-center justify-between ${
                      sel ? "bg-rose-50 border border-rose-200" : "active:bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        sel ? "text-rose-700 font-bold" : "text-slate-800 font-medium"
                      }`}
                    >
                      {c.name}
                    </Text>
                    {sel && <Check size={16} color="#e11d48" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};
