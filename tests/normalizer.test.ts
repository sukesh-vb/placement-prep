import { describe, it, expect } from "vitest";
import { normalizeCompanyName, deduplicateCompanies } from "../seed/normalizer";

describe("Company Data Normalizer", () => {
  it("extracts trailing concatenated numbers without spaces", () => {
    const res1 = normalizeCompanyName("Bloomberg9");
    expect(res1.name).toBe("Bloomberg");
    expect(res1.count).toBe(9);

    const res2 = normalizeCompanyName("Airbus8");
    expect(res2.name).toBe("Airbus");
    expect(res2.count).toBe(8);

    const res3 = normalizeCompanyName("NOV1");
    expect(res3.name).toBe("NOV");
    expect(res3.count).toBe(1);
  });

  it("fixes typos and inconsistent names from source documents", () => {
    expect(normalizeCompanyName("Volvoi Group").name).toBe("Volvo Group");
    expect(normalizeCompanyName("NeilsenIQ").name).toBe("NielsenIQ");
    expect(normalizeCompanyName("LTM").name).toBe("LTIMindtree");
    expect(normalizeCompanyName("J.P. Morgan").name).toBe("JPMorgan Chase");
    expect(normalizeCompanyName("JPMorganChase").name).toBe("JPMorgan Chase");
    expect(normalizeCompanyName("PwC (India + Global)").name).toBe("PwC");
    expect(normalizeCompanyName("PwC India").name).toBe("PwC");
    expect(normalizeCompanyName("KPMG India").name).toBe("KPMG");
  });

  it("cleans parenthetical annotations while preserving brand identity", () => {
    expect(normalizeCompanyName("BNY(Bank of New York Mellon Corporation)").name).toBe("BNY");
    expect(normalizeCompanyName("British Petroleum(bp)").name).toBe("BP");
    expect(normalizeCompanyName("Serum Institute of India").name).toBe("Serum Institute");
    expect(normalizeCompanyName("Zifo RnD Solutions").name).toBe("Zifo RnD Solutions");
  });

  it("preserves distinct corporate subsidiaries without silent conflation", () => {
    const tataMotors = normalizeCompanyName("Tata Motors");
    const tataSteel = normalizeCompanyName("Tata Steel");
    const tataTech = normalizeCompanyName("Tata Technologies");

    expect(tataMotors.name).toBe("Tata Motors");
    expect(tataSteel.name).toBe("Tata Steel");
    expect(tataTech.name).toBe("Tata Technologies");
    expect(tataMotors.isAmbiguousMerge).toBe(true);
  });

  it("deduplicates company lists and retains highest count", () => {
    const rawList = [
      { name: "PwC India", historicalHiringCount: 150 },
      { name: "PwC", historicalHiringCount: 216 },
      { name: "Amazon", historicalHiringCount: 601 },
      { name: "Amazon", historicalHiringCount: 580 },
    ];

    const { deduped, report } = deduplicateCompanies(rawList);
    expect(deduped.length).toBe(2);
    expect(deduped.find((c) => c.name === "PwC")?.historicalHiringCount).toBe(216);
    expect(deduped.find((c) => c.name === "Amazon")?.historicalHiringCount).toBe(601);
    expect(report.merged.length).toBe(2);
  });
});
