/**
 * @file src/lib/progress.ts
 * @description Pure calculation utility for student placement readiness percentages.
 * Handles overall readiness, per-semester progress, category breakdowns, and coding totals.
 */

export interface MilestoneProgressInput {
  id: string;
  type: string;
  status: string; // "TODO" | "IN_PROGRESS" | "DONE"
  targetCount?: number | null;
  currentCount?: number;
  semester?: number;
}

export interface SkillProgressInput {
  proficiency: string; // "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG"
}

export interface ProjectProgressInput {
  status: string; // "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  totalSteps?: number;
  completedStepsCount?: number;
}

export interface CodingLogInput {
  count: number;
  difficulty: string; // "EASY" | "MEDIUM" | "HARD"
  topic: string;
}

export interface ReadinessScoreResult {
  overallPercentage: number;
  breakdown: {
    milestonesPercentage: number;
    codingPercentage: number;
    skillsPercentage: number;
    projectsPercentage: number;
  };
  codingTotals: {
    totalSolved: number;
    target: number;
    byDifficulty: { easy: number; medium: number; hard: number };
    byTopic: Record<string, number>;
  };
  semesterProgress: Record<number, { completed: number; total: number; percentage: number }>;
}

/**
 * Weights for overall placement readiness calculation
 */
const READINESS_WEIGHTS = {
  milestones: 0.35, // 35%
  coding: 0.25,     // 25%
  skills: 0.25,     // 25%
  projects: 0.15,   // 15%
};

const DEFAULT_CODING_TARGET = 300; // Standard VIT campus recruitment milestone target

/**
 * Computes deterministic placement readiness metrics from normalized student data
 */
export function calculatePlacementReadiness(params: {
  milestones: MilestoneProgressInput[];
  skills: SkillProgressInput[];
  projects: ProjectProgressInput[];
  codingLogs: CodingLogInput[];
  customCodingTarget?: number;
}): ReadinessScoreResult {
  const { milestones, skills, projects, codingLogs, customCodingTarget } = params;

  // 1. Milestones progress
  let milestonesPercentage = 0;
  const semesterProgress: Record<number, { completed: number; total: number; percentage: number }> = {};

  if (milestones.length > 0) {
    let completedCount = 0;
    for (const m of milestones) {
      const isDone = m.status === "DONE";
      if (isDone) completedCount++;

      if (m.semester) {
        if (!semesterProgress[m.semester]) {
          semesterProgress[m.semester] = { completed: 0, total: 0, percentage: 0 };
        }
        semesterProgress[m.semester].total++;
        if (isDone) semesterProgress[m.semester].completed++;
      }
    }

    milestonesPercentage = Math.round((completedCount / milestones.length) * 100);

    for (const sem in semesterProgress) {
      const sp = semesterProgress[sem];
      sp.percentage = sp.total > 0 ? Math.round((sp.completed / sp.total) * 100) : 0;
    }
  }

  // 2. Coding problems progress & breakdown
  let totalSolved = 0;
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byTopic: Record<string, number> = {};

  for (const log of codingLogs) {
    totalSolved += log.count;
    const diff = log.difficulty.toLowerCase();
    if (diff === "easy") byDifficulty.easy += log.count;
    else if (diff === "medium") byDifficulty.medium += log.count;
    else if (diff === "hard") byDifficulty.hard += log.count;

    byTopic[log.topic] = (byTopic[log.topic] || 0) + log.count;
  }

  const codingTarget = customCodingTarget || DEFAULT_CODING_TARGET;
  const codingPercentage = Math.min(100, Math.round((totalSolved / codingTarget) * 100));

  // 3. Skills proficiency percentage
  let skillsPercentage = 0;
  if (skills.length > 0) {
    // Scoring: STRONG = 1.0, COMFORTABLE = 0.75, LEARNING = 0.4, NOT_STARTED = 0
    let points = 0;
    for (const s of skills) {
      if (s.proficiency === "STRONG") points += 1.0;
      else if (s.proficiency === "COMFORTABLE") points += 0.75;
      else if (s.proficiency === "LEARNING") points += 0.4;
    }
    skillsPercentage = Math.round((points / skills.length) * 100);
  }

  // 4. Projects completion percentage
  let projectsPercentage = 0;
  if (projects.length > 0) {
    let projScore = 0;
    for (const p of projects) {
      if (p.status === "COMPLETED") projScore += 1.0;
      else if (p.status === "IN_PROGRESS") {
        if (p.totalSteps && p.totalSteps > 0 && p.completedStepsCount) {
          projScore += Math.min(0.9, p.completedStepsCount / p.totalSteps);
        } else {
          projScore += 0.5;
        }
      }
    }
    projectsPercentage = Math.round((projScore / projects.length) * 100);
  }

  // 5. Overall weighted readiness
  const overallPercentage = Math.round(
    milestonesPercentage * READINESS_WEIGHTS.milestones +
      codingPercentage * READINESS_WEIGHTS.coding +
      skillsPercentage * READINESS_WEIGHTS.skills +
      projectsPercentage * READINESS_WEIGHTS.projects
  );

  return {
    overallPercentage: Math.min(100, Math.max(0, overallPercentage)),
    breakdown: {
      milestonesPercentage,
      codingPercentage,
      skillsPercentage,
      projectsPercentage,
    },
    codingTotals: {
      totalSolved,
      target: codingTarget,
      byDifficulty,
      byTopic,
    },
    semesterProgress,
  };
}
