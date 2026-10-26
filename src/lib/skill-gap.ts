/**
 * @file src/lib/skill-gap.ts
 * @description Pure algorithmic utility for computing student skill gaps against target companies & roles.
 * Ranks missing and weak skills based on market demand frequency across target selections and assigns
 * recommended sequential learning tiers (Foundational -> Core Domain -> Differentiating).
 */

export interface TargetRequirement {
  companyName: string;
  roleTitle?: string;
  requiredSkills: {
    skillId: string;
    skillName: string;
    category: string;
    importance?: "MUST_HAVE" | "GOOD_TO_HAVE" | "PRIORITY";
  }[];
}

export interface StudentSkillRating {
  skillId: string;
  skillName: string;
  proficiency: "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG";
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  currentProficiency: "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG";
  status: "MISSING" | "DEVELOPING" | "SATISFIED";
  requiredByCount: number;
  requiredByCompanies: string[];
  mustHaveCount: number;
  priorityScore: number; // Higher means higher urgency to learn
  learningPhase: "1_FOUNDATION" | "2_CORE_REQUIREMENT" | "3_DIFFERENTIATOR";
}

export interface SkillGapAnalysisResult {
  totalTargetSkills: number;
  satisfiedSkillsCount: number;
  developingSkillsCount: number;
  missingSkillsCount: number;
  matchPercentage: number;
  gapItems: SkillGapItem[];
  recommendedLearningOrder: SkillGapItem[];
}

/**
 * Calculates student skill gaps against their target companies/roles.
 *
 * Scoring & Ranking Logic:
 * 1. Skills required by multiple target companies receive higher demand frequency.
 * 2. 'MUST_HAVE' / prioritized requirements receive extra weighting.
 * 3. Priority score = (requiredCount * 10) + (mustHaveCount * 5) + (proficiencyPenalty).
 *    Where penalty: NOT_STARTED = +15, LEARNING = +8, COMFORTABLE = 0, STRONG = -10.
 * 4. Learning phase is assigned:
 *    - Phase 1: High frequency aptitude, programming foundations, or essential core math.
 *    - Phase 2: Domain-core requirements demanded by >= 50% of targets.
 *    - Phase 3: Advanced tools, frameworks, and differentiator competencies.
 */
export function computeSkillGap(params: {
  targets: TargetRequirement[];
  studentSkills: StudentSkillRating[];
}): SkillGapAnalysisResult {
  const { targets, studentSkills } = params;

  if (targets.length === 0) {
    return {
      totalTargetSkills: 0,
      satisfiedSkillsCount: 0,
      developingSkillsCount: 0,
      missingSkillsCount: 0,
      matchPercentage: 100,
      gapItems: [],
      recommendedLearningOrder: [],
    };
  }

  // Create lookup for student's current proficiency
  const studentProficiencyMap = new Map<string, "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG">();
  for (const s of studentSkills) {
    studentProficiencyMap.set(s.skillName.toLowerCase(), s.proficiency);
    if (s.skillId) studentProficiencyMap.set(s.skillId, s.proficiency);
  }

  // Aggregate requirements across all selected target companies
  const skillDemandMap = new Map<
    string,
    {
      skillId: string;
      skillName: string;
      category: string;
      companies: Set<string>;
      mustHaveCount: number;
    }
  >();

  for (const target of targets) {
    for (const req of target.requiredSkills) {
      const key = req.skillName.toLowerCase();
      if (!skillDemandMap.has(key)) {
        skillDemandMap.set(key, {
          skillId: req.skillId,
          skillName: req.skillName,
          category: req.category,
          companies: new Set<string>([target.companyName]),
          mustHaveCount: req.importance === "MUST_HAVE" || req.importance === "PRIORITY" ? 1 : 0,
        });
      } else {
        const item = skillDemandMap.get(key)!;
        item.companies.add(target.companyName);
        if (req.importance === "MUST_HAVE" || req.importance === "PRIORITY") {
          item.mustHaveCount++;
        }
      }
    }
  }

  let satisfiedCount = 0;
  let developingCount = 0;
  let missingCount = 0;

  const gapItems: SkillGapItem[] = [];

  for (const [, item] of skillDemandMap) {
    const proficiency = studentProficiencyMap.get(item.skillName.toLowerCase()) || "NOT_STARTED";
    const requiredCount = item.companies.size;
    const mustHaveCount = item.mustHaveCount;

    let status: "MISSING" | "DEVELOPING" | "SATISFIED" = "MISSING";
    let proficiencyPenalty = 15;

    if (proficiency === "STRONG" || proficiency === "COMFORTABLE") {
      status = "SATISFIED";
      satisfiedCount++;
      proficiencyPenalty = proficiency === "STRONG" ? -10 : -2;
    } else if (proficiency === "LEARNING") {
      status = "DEVELOPING";
      developingCount++;
      proficiencyPenalty = 8;
    } else {
      status = "MISSING";
      missingCount++;
      proficiencyPenalty = 18;
    }

    const priorityScore = requiredCount * 12 + mustHaveCount * 6 + proficiencyPenalty;

    // Assign learning phase
    let learningPhase: "1_FOUNDATION" | "2_CORE_REQUIREMENT" | "3_DIFFERENTIATOR" = "2_CORE_REQUIREMENT";
    const cat = item.category.toLowerCase();
    if (cat.includes("aptitude") || cat.includes("programming") || cat.includes("dsa") || item.skillName.includes("C++") || item.skillName.includes("Python")) {
      learningPhase = "1_FOUNDATION";
    } else if (requiredCount >= Math.ceil(targets.length * 0.4)) {
      learningPhase = "2_CORE_REQUIREMENT";
    } else {
      learningPhase = "3_DIFFERENTIATOR";
    }

    gapItems.push({
      skillId: item.skillId,
      skillName: item.skillName,
      category: item.category,
      currentProficiency: proficiency,
      status,
      requiredByCount: requiredCount,
      requiredByCompanies: Array.from(item.companies),
      mustHaveCount,
      priorityScore,
      learningPhase,
    });
  }

  const totalTargetSkills = gapItems.length;
  // Match % weights satisfied at 100%, developing at 50%, missing at 0%
  const matchPercentage =
    totalTargetSkills > 0
      ? Math.round(((satisfiedCount * 1.0 + developingCount * 0.5) / totalTargetSkills) * 100)
      : 100;

  // Recommended learning order: filter for skills not yet satisfied, sorted by priorityScore desc
  const recommendedLearningOrder = gapItems
    .filter((item) => item.status !== "SATISFIED")
    .sort((a, b) => {
      // First sort by phase (Foundation -> Core -> Differentiator)
      if (a.learningPhase !== b.learningPhase) {
        return a.learningPhase.localeCompare(b.learningPhase);
      }
      // Then by priority score descending
      return b.priorityScore - a.priorityScore;
    });

  return {
    totalTargetSkills,
    satisfiedSkillsCount: satisfiedCount,
    developingSkillsCount: developingCount,
    missingSkillsCount: missingCount,
    matchPercentage,
    gapItems: gapItems.sort((a, b) => b.priorityScore - a.priorityScore),
    recommendedLearningOrder,
  };
}
