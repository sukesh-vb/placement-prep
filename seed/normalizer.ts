/**
 * @file seed/normalizer.ts
 * @description Robust text normalization, typo resolution, concatenated number extraction,
 * and ambiguous entity detection for placement guide data.
 */

export interface NormalizedCompany {
  rawName: string;
  name: string;
  count?: number;
  normalizedAlias?: string;
  isAmbiguousMerge?: boolean;
  ambiguityNote?: string;
}

// Known alias and typo mapping dictionary
export const KNOWN_ALIASES: Record<string, string> = {
  // Typos from source data
  "volvoi group": "Volvo Group",
  "neilseniq": "NielsenIQ",
  // Common brand spelling differences
  "ltm": "LTIMindtree",
  "ltimindtree": "LTIMindtree",
  "lti mindtree": "LTIMindtree",
  "j.p. morgan": "JPMorgan Chase",
  "jpmorgan": "JPMorgan Chase",
  "jpmorganchase": "JPMorgan Chase",
  "jpmorgan chase": "JPMorgan Chase",
  "pwc india": "PwC",
  "pwc (india + global)": "PwC",
  "kpmg india": "KPMG",
  "kpmg us": "KPMG",
  "ey-parthenon": "EY",
  "ey (ernst & young)": "EY",
  "bny(bank of new york mellon corporation)": "BNY",
  "bny": "BNY",
  "british petroleum(bp)": "BP",
  "bp": "BP",
  "reliance industries": "Reliance Industries",
  "ril": "Reliance Industries",
  "reliance": "Reliance Industries",
  "tata consultancy services": "TCS",
  "tata consultancy services (tcs)": "TCS",
  "tcs": "TCS",
  "l&t technology services (ltts)": "LTTS",
  "l&t technology services": "LTTS",
  "ltts": "LTTS",
  "larsen & toubro (l&t)": "L&T",
  "larsen & toubro": "L&T",
  "l&t": "L&T",
  "l&t hydrocarbon": "L&T Hydrocarbon",
  "l&t defence": "L&T Defence",
  "schneider electric": "Schneider Electric",
  "schneider": "Schneider Electric",
  "texas instruments": "Texas Instruments",
  "ti": "Texas Instruments",
  "samsung (sri-b)": "Samsung",
  "samsung": "Samsung",
  "bosch (bgsw, bosch ltd.)": "Bosch",
  "bosch": "Bosch",
  "dr. reddy's": "Dr. Reddy's",
  "dr reddy's": "Dr. Reddy's",
  "dr. reddy's laboratories": "Dr. Reddy's",
  "serum institute of india": "Serum Institute",
  "serum institute": "Serum Institute",
  "zifo rnd": "Zifo RnD Solutions",
  "zifo rnd solutions": "Zifo RnD Solutions",
  "zifo": "Zifo RnD Solutions",
  "cognizant technology solutions": "Cognizant",
  "cognizant": "Cognizant",
};

// Known corporate groups where distinct subsidiaries must NOT be silently merged
const DISTINCT_SUBSIDIARIES_PATTERNS = [
  "Tata Motors",
  "Tata Steel",
  "Tata Technologies",
  "Tata Chemicals",
  "Tata AutoComp",
  "Tata Elxsi",
  "Tata Advanced Systems",
  "L&T",
  "LTTS",
  "L&T Hydrocarbon",
  "L&T Defence",
];

/**
 * Parses and normalizes a raw company string:
 * 1. Handles trailing counts with no spaces (e.g. "Bloomberg9" -> "Bloomberg", count: 9)
 * 2. Removes trailing/enclosing parenthetical notes while preserving canonical names
 * 3. Resolves known typos and aliases
 * 4. Flags ambiguous merges (e.g., Tata Motors vs Tata Steel)
 *
 * @param rawInput The uncleaned company string from source documents
 * @returns Normalized company object with clean name and extracted count
 */
export function normalizeCompanyName(rawInput: string): NormalizedCompany {
  if (!rawInput || typeof rawInput !== "string") {
    return { rawName: "", name: "" };
  }

  let cleaned = rawInput.trim();
  let extractedCount: number | undefined;

  // 1. Check for trailing numbers directly concatenated without spaces (e.g. "Bloomberg9", "Airbus8", "NOV1")
  const trailingNumRegex = /^([a-zA-Z\s&.\-'\(\)]+?)(\d{1,4})$/;
  const numMatch = cleaned.match(trailingNumRegex);
  if (numMatch && !cleaned.toLowerCase().includes("3m") && !numMatch[1].endsWith(" ")) {
    cleaned = numMatch[1].trim();
    extractedCount = parseInt(numMatch[2], 10);
  }

  // 2. Strip excess whitespace and standardize common parentheticals
  const lookupKey = cleaned.toLowerCase().replace(/\s+/g, " ").trim();

  // Check alias dictionary
  if (KNOWN_ALIASES[lookupKey]) {
    const canonical = KNOWN_ALIASES[lookupKey];
    return {
      rawName: rawInput,
      name: canonical,
      count: extractedCount,
      normalizedAlias: canonical,
    };
  }

  // 3. Remove general parentheticals like "Company (India)" or "Company (Tech)"
  let strippedName = cleaned.replace(/\s*\([^)]*\)$/, "").trim();
  const strippedLookup = strippedName.toLowerCase();
  if (KNOWN_ALIASES[strippedLookup]) {
    strippedName = KNOWN_ALIASES[strippedLookup];
  }

  // 4. Ambiguity check: Check if this name shares a corporate brand prefix with distinct subsidiaries
  let isAmbiguous = false;
  let ambiguityNote: string | undefined;

  for (const sub of DISTINCT_SUBSIDIARIES_PATTERNS) {
    if (strippedName !== sub && strippedName.startsWith(sub.split(" ")[0])) {
      isAmbiguous = true;
      ambiguityNote = `Preserved distinct entity '${strippedName}' under corporate group '${sub.split(" ")[0]}' without merging into peers.`;
      break;
    }
  }

  return {
    rawName: rawInput,
    name: strippedName,
    count: extractedCount,
    isAmbiguousMerge: isAmbiguous,
    ambiguityNote,
  };
}

/**
 * Deduplicates a list of companies by normalized name, keeping maximum hiring count
 */
export function deduplicateCompanies<T extends { name: string; historicalHiringCount?: number | null }>(
  items: T[]
): { deduped: T[]; report: { merged: string[]; totalInitial: number; totalFinal: number } } {
  const map = new Map<string, T>();
  const merged: string[] = [];

  for (const item of items) {
    const norm = normalizeCompanyName(item.name).name;
    if (map.has(norm)) {
      const existing = map.get(norm)!;
      merged.push(`Merged duplicate '${item.name}' into canonical '${norm}'`);
      // Update count if current item has higher count
      if (item.historicalHiringCount && (!existing.historicalHiringCount || item.historicalHiringCount > existing.historicalHiringCount)) {
        existing.historicalHiringCount = item.historicalHiringCount;
      }
    } else {
      map.set(norm, { ...item, name: norm });
    }
  }

  const deduped = Array.from(map.values());
  return {
    deduped,
    report: {
      merged,
      totalInitial: items.length,
      totalFinal: deduped.length,
    },
  };
}
