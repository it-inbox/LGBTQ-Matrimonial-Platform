import { Country, State, City } from "country-state-city";

// Cache country ISO lookup map: { "India": "IN", "United States": "US", ... }
const countryNameToIsoMap = new Map<string, string>();
Country.getAllCountries().forEach((c) => {
  countryNameToIsoMap.set(c.name.toLowerCase(), c.isoCode);
});

// Manual aliases for slight naming differences
countryNameToIsoMap.set("usa", "US");
countryNameToIsoMap.set("uk", "GB");
countryNameToIsoMap.set("russia", "RU");
countryNameToIsoMap.set("south korea", "KR");
countryNameToIsoMap.set("north korea", "KP");
countryNameToIsoMap.set("syria", "SY");
countryNameToIsoMap.set("vietnam", "VN");
countryNameToIsoMap.set("laos", "LA");
countryNameToIsoMap.set("iran", "IR");
countryNameToIsoMap.set("bolivia", "BO");
countryNameToIsoMap.set("venezuela", "VE");
countryNameToIsoMap.set("tanzania", "TZ");

export const getCountryIso = (countryName: string): string => {
  if (!countryName) return "";
  return countryNameToIsoMap.get(countryName.toLowerCase()) || "";
};

export const getStatesForCountry = (countryName: string): string[] => {
  if (!countryName) return [];
  const iso = getCountryIso(countryName);
  if (!iso) return ["Other"];

  const rawStates = State.getStatesOfCountry(iso);
  if (!rawStates || rawStates.length === 0) {
    return ["Other"];
  }

  const stateNames = rawStates
    .map((s) => s.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return [...stateNames, "Other"];
};

export const getCitiesForState = (countryName: string, stateName: string): string[] => {
  if (!countryName || !stateName) return [];
  if (stateName === "Other") return ["Other"];

  const countryIso = getCountryIso(countryName);
  if (!countryIso) return ["Other"];

  const states = State.getStatesOfCountry(countryIso);
  const matchedState = states.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase() || s.isoCode.toLowerCase() === stateName.toLowerCase()
  );

  let rawCities: string[] = [];
  if (matchedState) {
    const cityList = City.getCitiesOfState(countryIso, matchedState.isoCode);
    if (cityList && cityList.length > 0) {
      rawCities = cityList.map((c) => c.name).filter(Boolean);
    }
  }

  // Deduplicate and sort alphabetically
  const uniqueCities = Array.from(new Set(rawCities))
    .filter((c) => c !== "Other")
    .sort((a, b) => a.localeCompare(b));

  return uniqueCities.length > 0 ? [...uniqueCities, "Other"] : ["Major City", "Other"];
};
