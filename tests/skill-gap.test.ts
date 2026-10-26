import { describe, it, expect } from "vitest";
import { computeSkillGap, TargetRequirement, StudentSkillRating } from "../src/lib/skill-gap";

describe("Skill Gap Analysis Algorithm", () => {
  it("returns 100% match when no target companies are selected", () => {
    const res = computeSkillGap({
      targets: [],
      studentSkills: [],
    });

    expect(res.matchPercentage).toBe(100);
    expect(res.totalTargetSkills).toBe(0);
    expect(res.gapItems).toEqual([]);
    expect(res.recommendedLearningOrder).toEqual([]);
  });

  it("accurately computes match percentage and identifies missing vs satisfied skills", () => {
    const targets: TargetRequirement[] = [
      {
        companyName: "Amazon",
        requiredSkills: [
          { skillId: "sk1", skillName: "Data Structures & Algorithms", category: "DSA", importance: "MUST_HAVE" },
          { skillId: "sk2", skillName: "Dynamic Programming", category: "DSA", importance: "MUST_HAVE" },
          { skillId: "sk3", skillName: "Object-Oriented Programming", category: "Core CS", importance: "MUST_HAVE" },
        ],
      },
      {
        companyName: "Microsoft",
        requiredSkills: [
          { skillId: "sk1", skillName: "Data Structures & Algorithms", category: "DSA", importance: "MUST_HAVE" },
          { skillId: "sk3", skillName: "Object-Oriented Programming", category: "Core CS", importance: "MUST_HAVE" },
          { skillId: "sk4", skillName: "System Design Basics", category: "Core CS", importance: "GOOD_TO_HAVE" },
        ],
      },
    ];

    const studentSkills: StudentSkillRating[] = [
      { skillId: "sk1", skillName: "Data Structures & Algorithms", proficiency: "STRONG" },
      { skillId: "sk3", skillName: "Object-Oriented Programming", proficiency: "LEARNING" },
      // sk2 (Dynamic Programming) is NOT_STARTED / omitted
      // sk4 (System Design Basics) is NOT_STARTED / omitted
    ];

    const result = computeSkillGap({ targets, studentSkills });

    expect(result.totalTargetSkills).toBe(4);
    expect(result.satisfiedSkillsCount).toBe(1); // DSA is STRONG
    expect(result.developingSkillsCount).toBe(1); // OOP is LEARNING
    expect(result.missingSkillsCount).toBe(2);    // DP and System Design are missing

    // (1 * 1.0 + 1 * 0.5) / 4 = 1.5 / 4 = 37.5% -> 38%
    expect(result.matchPercentage).toBe(38);

    // Recommended learning order should put missing/developing skills first
    expect(result.recommendedLearningOrder.length).toBe(3);
    const orderNames = result.recommendedLearningOrder.map((s) => s.skillName);
    expect(orderNames).toContain("Dynamic Programming");
    expect(orderNames).toContain("Object-Oriented Programming");
    expect(orderNames).toContain("System Design Basics");
    expect(orderNames).not.toContain("Data Structures & Algorithms"); // Already satisfied
  });

  it("prioritizes shared high-frequency skills across multiple companies", () => {
    const targets: TargetRequirement[] = [
      {
        companyName: "TCS",
        requiredSkills: [
          { skillId: "s1", skillName: "Quantitative Aptitude", category: "Aptitude", importance: "MUST_HAVE" },
          { skillId: "s2", skillName: "SQL Basics", category: "Database", importance: "MUST_HAVE" },
        ],
      },
      {
        companyName: "Cognizant",
        requiredSkills: [
          { skillId: "s1", skillName: "Quantitative Aptitude", category: "Aptitude", importance: "MUST_HAVE" },
          { skillId: "s3", skillName: "Java Basics", category: "Programming", importance: "GOOD_TO_HAVE" },
        ],
      },
      {
        companyName: "Wipro",
        requiredSkills: [
          { skillId: "s1", skillName: "Quantitative Aptitude", category: "Aptitude", importance: "MUST_HAVE" },
        ],
      },
    ];

    const result = computeSkillGap({ targets, studentSkills: [] });
    const aptitude = result.gapItems.find((g) => g.skillName === "Quantitative Aptitude");
    const sql = result.gapItems.find((g) => g.skillName === "SQL Basics");

    expect(aptitude).toBeDefined();
    expect(aptitude?.requiredByCount).toBe(3);
    expect(sql?.requiredByCount).toBe(1);
    expect(aptitude!.priorityScore).toBeGreaterThan(sql!.priorityScore);
  });
});
