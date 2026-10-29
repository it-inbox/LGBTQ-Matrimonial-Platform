import { Country, State, City } from "country-state-city";

// Same-sex marriage legal nations (Tier 1: 65% weighting)
export const TIER_1_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Belgium",
  "Portugal",
  "Ireland",
  "Switzerland",
  "Austria",
  "Iceland",
  "Finland",
  "Taiwan",
  "Thailand",
  "South Africa",
  "Brazil",
  "Argentina",
  "Mexico",
  "Colombia",
  "Chile",
  "Uruguay",
  "Costa Rica",
  "Nepal",
];

// High LGBTQ+ Community Hubs (Tier 2: 25% weighting)
export const TIER_2_COUNTRIES = [
  "India",
  "Japan",
  "Philippines",
  "Vietnam",
  "Singapore",
  "South Korea",
  "Italy",
  "Poland",
  "Czech Republic",
];

export interface LocationEntry {
  country: string;
  state: string;
  city: string;
}

// Pre-build a sampled pool of locations for high-speed seeder execution
export function buildLocationPool(): {
  tier1: LocationEntry[];
  tier2: LocationEntry[];
  tier3: LocationEntry[];
} {
  const allCountries = Country.getAllCountries();
  const tier1Map = new Set(TIER_1_COUNTRIES.map((c) => c.toLowerCase()));
  const tier2Map = new Set(TIER_2_COUNTRIES.map((c) => c.toLowerCase()));

  const tier1: LocationEntry[] = [];
  const tier2: LocationEntry[] = [];
  const tier3: LocationEntry[] = [];

  for (const c of allCountries) {
    const cLower = c.name.toLowerCase();
    const isTier1 = tier1Map.has(cLower);
    const isTier2 = tier2Map.has(cLower);
    const targetPool = isTier1 ? tier1 : isTier2 ? tier2 : tier3;

    const states = State.getStatesOfCountry(c.isoCode);
    if (!states || states.length === 0) {
      targetPool.push({ country: c.name, state: c.name, city: c.capital || c.name });
      continue;
    }

    // Sample up to 10 states per country
    const sampledStates = states.slice(0, 10);
    for (const s of sampledStates) {
      const cities = City.getCitiesOfState(c.isoCode, s.isoCode);
      if (!cities || cities.length === 0) {
        targetPool.push({ country: c.name, state: s.name, city: s.name });
        continue;
      }
      // Sample up to 8 cities per state
      const sampledCities = cities.slice(0, 8);
      for (const city of sampledCities) {
        targetPool.push({ country: c.name, state: s.name, city: city.name });
      }
    }
  }

  return { tier1, tier2, tier3 };
}
