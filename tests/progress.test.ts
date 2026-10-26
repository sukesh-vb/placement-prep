import { describe, it, expect } from "vitest";
import { calculatePlacementReadiness } from "../src/lib/progress";

describe("Placement Readiness Calculator", () => {
  it("calculates 0% readiness when no tasks have been started", () => {
    const res = calculatePlacementReadiness({
      milestones: [
        { id: "m1", type: "CHECKLIST_ITEM", status: "TODO", semester: 1 },
        { id: "m2", type: "CHECKLIST_ITEM", status: "TODO", semester: 1 },
      ],
      skills: [{ proficiency: "NOT_STARTED" }, { proficiency: "NOT_STARTED" }],
      projects: [{ status: "NOT_STARTED" }],
      codingLogs: [],
    });

    expect(res.overallPercentage).toBe(0);
    expect(res.breakdown.milestonesPercentage).toBe(0);
    expect(res.breakdown.codingPercentage).toBe(0);
    expect(res.breakdown.skillsPercentage).toBe(0);
    expect(res.breakdown.projectsPercentage).toBe(0);
    expect(res.semesterProgress[1]?.percentage).toBe(0);
  });

  it("calculates weighted overall readiness correctly with partial completions", () => {
    const res = calculatePlacementReadiness({
      milestones: [
        { id: "m1", type: "CHECKLIST_ITEM", status: "DONE", semester: 1 },
        { id: "m2", type: "CHECKLIST_ITEM", status: "TODO", semester: 1 },
        { id: "m3", type: "CHECKLIST_ITEM", status: "DONE", semester: 2 },
        { id: "m4", type: "CHECKLIST_ITEM", status: "TODO", semester: 2 },
      ], // 50%
      skills: [
        { proficiency: "STRONG" },      // 1.0
        { proficiency: "COMFORTABLE" }, // 0.75
        { proficiency: "NOT_STARTED" }, // 0
        { proficiency: "NOT_STARTED" }, // 0
      ], // (1.75 / 4) = 44%
      projects: [
        { status: "COMPLETED" },
        { status: "NOT_STARTED" },
      ], // 50%
      codingLogs: [
        { count: 75, difficulty: "EASY", topic: "Arrays" },
        { count: 75, difficulty: "MEDIUM", topic: "Trees" },
      ], // 150 / 300 = 50%
      customCodingTarget: 300,
    });

    expect(res.breakdown.milestonesPercentage).toBe(50);
    expect(res.breakdown.codingPercentage).toBe(50);
    expect(res.breakdown.skillsPercentage).toBe(44);
    expect(res.breakdown.projectsPercentage).toBe(50);

    // Weighted: 50*0.35 (17.5) + 50*0.25 (12.5) + 44*0.25 (11.0) + 50*0.15 (7.5) = 48.5 -> 49%
    expect(res.overallPercentage).toBe(49);
    expect(res.semesterProgress[1]?.percentage).toBe(50);
    expect(res.semesterProgress[2]?.percentage).toBe(50);
    expect(res.codingTotals.totalSolved).toBe(150);
    expect(res.codingTotals.byDifficulty.easy).toBe(75);
    expect(res.codingTotals.byDifficulty.medium).toBe(75);
  });
});
