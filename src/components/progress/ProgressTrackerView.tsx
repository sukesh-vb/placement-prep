/**
 * @file src/components/progress/ProgressTrackerView.tsx
 * @description Master interactive progress tracker:
 * 1. Semester-by-semester roadmaps with optimistic checkboxes and countable steppers.
 * 2. Coding problem logger with difficulty & topic breakdowns.
 * 3. Portfolio project completion with sub-step checklists.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import {
  CheckCircle2,
  Code2,
  FolderGit2,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  Github,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  type: string;
  targetCount?: number | null;
  status: string; // "TODO" | "IN_PROGRESS" | "DONE"
  currentCount?: number;
  completedAt?: string | null;
}

interface RoadmapSemester {
  id: string;
  year: number;
  semester: number;
  title: string;
  percentage: number;
  totalMilestones: number;
  completedMilestones: number;
  milestones: Milestone[];
}

interface CodingLog {
  id: string;
  topic: string;
  difficulty: string;
  platform?: string;
  count: number;
  solvedOn: string;
}

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  techSkills?: string;
  checklistSteps: string[];
}

interface StudentProject {
  id: string;
  projectTemplateId?: string | null;
  title: string;
  status: string;
  repoLink?: string;
  demoLink?: string;
  stepsCompleted: number[];
  template?: {
    title: string;
    steps: string[];
  } | null;
}

export function ProgressTrackerView() {
  const { currentBranch } = useAppStore();

  const [activeTab, setActiveTab] = useState<"roadmap" | "coding" | "projects">("roadmap");
  const [roadmaps, setRoadmaps] = useState<RoadmapSemester[]>([]);
  const [codingLogs, setCodingLogs] = useState<CodingLog[]>([]);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [studentProjects, setStudentProjects] = useState<StudentProject[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  // Coding quick-log form
  const [codingCount, setCodingCount] = useState(1);
  const [codingTopic, setCodingTopic] = useState("Arrays & Strings");
  const [codingDifficulty, setCodingDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [codingPlatform, setCodingPlatform] = useState("LeetCode");
  const [isLoggingProblem, setIsLoggingProblem] = useState(false);

  // Expanded year accordion state
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Debounce timers for steppers
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        const res = await fetch("/api/student/progress");
        if (res.ok) {
          const json = await res.json();
          setRoadmaps(json.roadmaps || []);
          setCodingLogs(json.codingLogs || []);
          setProjectTemplates(json.projectTemplates || []);
          setStudentProjects(json.studentProjects || []);
          setReadiness(json.readiness);
          setStreakDays(json.streakDays || 1);
        }
      } catch (err) {
        console.error("Failed to load progress data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [currentBranch]);

  // 1. Optimistic Milestone Toggle
  async function handleToggleMilestone(milestoneId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    // Optimistically update
    setRoadmaps((prev) =>
      prev.map((r) => {
        const updatedMilestones = r.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: newStatus } : m
        );
        const completed = updatedMilestones.filter((m) => m.status === "DONE").length;
        const total = updatedMilestones.length;
        return {
          ...r,
          milestones: updatedMilestones,
          completedMilestones: completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    try {
      const res = await fetch("/api/student/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save milestone");
      }
    } catch (err) {
      console.error("Milestone sync failed:", err);
      // Rollback
      setRoadmaps((prev) =>
        prev.map((r) => ({
          ...r,
          milestones: r.milestones.map((m) =>
            m.id === milestoneId ? { ...m, status: currentStatus } : m
          ),
        }))
      );
    }
  }

  // 2. Countable Milestone Stepper with Debounce
  function handleCountChange(milestoneId: string, delta: number, targetCount?: number | null) {
    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        milestones: r.milestones.map((m) => {
          if (m.id === milestoneId) {
            const nextCount = Math.max(0, (m.currentCount || 0) + delta);
            const isCompleted = targetCount ? nextCount >= targetCount : false;
            return {
              ...m,
              currentCount: nextCount,
              status: isCompleted ? "DONE" : m.status,
            };
          }
          return m;
        }),
      }))
    );

    // Debounced write to API
    if (debounceTimers.current[milestoneId]) {
      clearTimeout(debounceTimers.current[milestoneId]);
    }

    debounceTimers.current[milestoneId] = setTimeout(async () => {
      // Find current count
      let currentVal = 0;
      for (const r of roadmaps) {
        const found = r.milestones.find((m) => m.id === milestoneId);
        if (found) {
          currentVal = (found.currentCount || 0) + delta;
          break;
        }
      }

      try {
        await fetch("/api/student/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestoneId,
            currentCount: Math.max(0, currentVal),
          }),
        });
      } catch (err) {
        console.error("Failed to sync milestone count:", err);
      }
    }, 400);
  }

  // 3. Quick-Log Coding Problems
  async function handleLogCodingProblem(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingProblem(true);
    try {
      const res = await fetch("/api/student/coding-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: codingTopic,
          difficulty: codingDifficulty,
          platform: codingPlatform,
          count: codingCount,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setCodingLogs((prev) => [json.log, ...prev]);

        // Refresh overall readiness score
        const progRes = await fetch("/api/student/progress");
        if (progRes.ok) {
          const pJson = await progRes.json();
          setReadiness(pJson.readiness);
        }
      }
    } catch (err) {
      console.error("Failed to log coding problem:", err);
    } finally {
      setIsLoggingProblem(false);
    }
  }

  // 4. Project Checklist Step Toggle
  async function handleToggleProjectStep(projectId: string, stepIndex: number, currentSteps: number[]) {
    const updatedSteps = currentSteps.includes(stepIndex)
      ? currentSteps.filter((s) => s !== stepIndex)
      : [...currentSteps, stepIndex];

    const isAllDone = updatedSteps.length >= 3;
    const newStatus = isAllDone ? "COMPLETED" : "IN_PROGRESS";

    setStudentProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stepsCompleted: updatedSteps,
              status: newStatus,
            }
          : p
      )
    );

    try {
      await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          title: studentProjects.find((p) => p.id === projectId)?.title || "Project",
          status: newStatus,
          stepsCompleted: updatedSteps,
        }),
      });
    } catch (err) {
      console.error("Failed to update project steps:", err);
    }
  }

  // Group roadmaps by year (Year 1: Sem 1 & 2, etc.)
  const roadmapsByYear: Record<number, RoadmapSemester[]> = {
    1: roadmaps.filter((r) => r.year === 1),
    2: roadmaps.filter((r) => r.year === 2),
    3: roadmaps.filter((r) => r.year === 3),
    4: roadmaps.filter((r) => r.year === 4),
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Placement Progress Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your semester milestones, coding problem counts, and technical resume projects for{" "}
            <span className="font-semibold text-primary">{currentBranch}</span>.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/70 p-1 border border-border">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "roadmap"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Semester Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab("coding")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "coding"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-500" />
            <span>Coding Counter</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "projects"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Resume Projects</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: SEMESTER-BY-SEMESTER ROADMAP
      ======================================================================= */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((year) => {
            const yearSemesters = roadmapsByYear[year] || [];
            if (yearSemesters.length === 0) return null;

            const isExpanded = expandedYears[year] ?? true;
            const yearCompleted = yearSemesters.reduce((acc, s) => acc + s.completedMilestones, 0);
            const yearTotal = yearSemesters.reduce((acc, s) => acc + s.totalMilestones, 0);
            const yearPercent = yearTotal > 0 ? Math.round((yearCompleted / yearTotal) * 100) : 0;

            return (
              <div
                key={year}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all"
              >
                {/* Year Header / Accordion Trigger */}
                <button
                  onClick={() =>
                    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }))
                  }
                  className="flex w-full items-center justify-between bg-muted/30 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">
                      Y{year}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Year {year}{" "}
                        {year === 1
                          ? "(Foundations & Academic Habits)"
                          : year === 2
                          ? "(Core Development & Data Tools)"
                          : year === 3
                          ? "(Interview Depth & Advanced Simulation)"
                          : "(Placement Drives & Offers)"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {yearCompleted} of {yearTotal} Milestones Completed ({yearPercent}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Mini Year Progress Bar */}
                    <div className="hidden sm:block w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${yearPercent}%` }}
                      />
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Semesters under this Year */}
                {isExpanded && (
                  <div className="p-6 space-y-6 border-t border-border">
                    {yearSemesters.map((sem) => (
                      <div key={sem.id} className="space-y-3">
                        {/* Semester Title & % Indicator */}
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                              Semester {sem.semester}
                            </span>
                            <span className="text-sm font-bold text-foreground">{sem.title}</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">
                            {sem.completedMilestones}/{sem.totalMilestones} ({sem.percentage}%)
                          </span>
                        </div>

                        {/* Semester Progress Bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${sem.percentage}%` }}
                          />
                        </div>

                        {/* Milestones Checklist & Steppers */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                          {sem.milestones.map((m) => {
                            const isDone = m.status === "DONE";

                            return (
                              <div
                                key={m.id}
                                className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                                  isDone
                                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                                    : "bg-muted/20 border-border text-foreground hover:border-primary/40"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => handleToggleMilestone(m.id, m.status)}
                                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                  />
                                  <div>
                                    <p
                                      className={`text-xs font-bold leading-tight ${
                                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                                      }`}
                                    >
                                      {m.title}
                                    </p>
                                    {m.description && (
                                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                                        {m.description}
                                      </p>
                                    )}
                                    <span className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                                      {m.type.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>

                                {/* Countable Stepper (e.g. 150 problems solved) */}
                                {m.targetCount && (
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-[10px] font-bold text-foreground">
                                      {m.currentCount || 0} / {m.targetCount}
                                    </span>
                                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-sm">
                                      <button
                                        onClick={() => handleCountChange(m.id, -5, m.targetCount)}
                                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        title="Decrease count"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="px-1 text-[11px] font-bold text-foreground">
                                        {m.currentCount || 0}
                                      </span>
                                      <button
                                        onClick={() => handleCountChange(m.id, 5, m.targetCount)}
                                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        title="Increase count"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =======================================================================
          TAB 2: CODING PROBLEM COUNTER
      ======================================================================= */}
      {activeTab === "coding" && (
        <div className="space-y-6">
          {/* Quick-Log Form & Streak Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Quick-Log Form */}
            <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-foreground">Log Practiced Coding Problems</h3>
                </div>
                <span className="rounded-xl bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Quick Logger
                </span>
              </div>

              <form onSubmit={handleLogCodingProblem} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Algorithmic Topic</label>
                    <select
                      value={codingTopic}
                      onChange={(e) => setCodingTopic(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="Arrays & Strings">Arrays & Strings (Two Pointers, Sliding Window)</option>
                      <option value="Stacks & Queues">Stacks, Queues & Monotonic Stack</option>
                      <option value="Linked Lists & Trees">Trees & Binary Search Trees</option>
                      <option value="Graphs & BFS/DFS">Graphs (Shortest Path, Union-Find)</option>
                      <option value="Dynamic Programming">Dynamic Programming (1D/2D, Knapsack)</option>
                      <option value="Recursion & Backtracking">Recursion & Backtracking</option>
                      <option value="SQL Queries">SQL (Joins, Subqueries, Normalization)</option>
                      <option value="Aptitude & Logic">Quantitative & Logical Aptitude</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Difficulty Level</label>
                    <select
                      value={codingDifficulty}
                      onChange={(e) => setCodingDifficulty(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="EASY">Easy (Campus OA warmup)</option>
                      <option value="MEDIUM">Medium (Product company standard)</option>
                      <option value="HARD">Hard (Big Tech / Reach drives)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Coding Platform</label>
                    <select
                      value={codingPlatform}
                      onChange={(e) => setCodingPlatform(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="LeetCode">LeetCode</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="GeeksforGeeks">GeeksforGeeks</option>
                      <option value="CodeChef">CodeChef / Codeforces</option>
                      <option value="InterviewBit">InterviewBit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Problems Solved</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={codingCount}
                      onChange={(e) => setCodingCount(parseInt(e.target.value, 10) || 1)}
                      className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingProblem}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isLoggingProblem ? "Saving..." : "Log Problems Solved"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Total Target Ring & Difficulty Split */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Overall Target (300 Problems)
                </h3>
                <Award className="h-4 w-4 text-amber-500" />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-foreground">
                  {readiness?.codingTotals.totalSolved || 0}
                  <span className="text-sm font-normal text-muted-foreground"> / 300</span>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((readiness?.codingTotals.totalSolved || 0) / 300) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty Split Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-center border border-emerald-500/20">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {readiness?.codingTotals.byDifficulty.easy || 0}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Easy</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-center border border-amber-500/20">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {readiness?.codingTotals.byDifficulty.medium || 0}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Medium</p>
                </div>
                <div className="rounded-xl bg-rose-500/10 p-2.5 text-center border border-rose-500/20">
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {readiness?.codingTotals.byDifficulty.hard || 0}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Hard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Distribution Progress Bars */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Topic Distribution</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(readiness?.codingTotals.byTopic || {}).map(([topic, count]) => (
                <div key={topic} className="rounded-2xl border border-border bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground truncate">{topic}</span>
                    <span className="font-bold text-primary">{count as number}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, ((count as number) / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Coding Log History Table */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Recent Activity Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Topic</th>
                    <th className="pb-2.5">Difficulty</th>
                    <th className="pb-2.5">Platform</th>
                    <th className="pb-2.5 text-right">Problems Solved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {codingLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">
                        No coding logs recorded yet. Start logging above!
                      </td>
                    </tr>
                  ) : (
                    codingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(log.solvedOn).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-semibold text-foreground">{log.topic}</td>
                        <td className="py-2.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              log.difficulty === "EASY"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : log.difficulty === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {log.difficulty}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{log.platform || "LeetCode"}</td>
                        <td className="py-2.5 text-right font-bold text-foreground">+{log.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: PORTFOLIO PROJECTS
      ======================================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground">High-Impact Portfolio Projects</h3>
            <p className="text-xs text-muted-foreground">
              Recruiters at VIT prioritize candidates who can defend 2-3 end-to-end deployed projects. Check off your implementation steps below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {projectTemplates.map((template) => {
              // Find if student has started this template
              const studentProj = studentProjects.find(
                (p) => p.projectTemplateId === template.id
              );
              const completedSteps = studentProj?.stepsCompleted || [];
              const status = studentProj?.status || "NOT_STARTED";

              return (
                <div
                  key={template.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-foreground">{template.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                      {template.techSkills && (
                        <p className="mt-2 text-[11px] font-semibold text-primary">
                          Recommended Stack: {template.techSkills}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                        status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Checklist Steps */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Execution Milestones:
                    </span>
                    {template.checklistSteps.map((step, idx) => {
                      const isChecked = completedSteps.includes(idx);
                      const targetProjId = studentProj?.id || `new-${template.id}`;

                      return (
                        <label
                          key={idx}
                          className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-muted/30 p-2.5 text-xs hover:bg-muted/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleToggleProjectStep(targetProjId, idx, completedSteps)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <span
                            className={isChecked ? "line-through text-muted-foreground" : "text-foreground"}
                          >
                            {step}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Links / Repo info */}
                  {studentProj?.repoLink && (
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={studentProj.repoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {studentProj.repoLink}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
