/**
 * @file src/components/dashboard/DashboardView.tsx
 * @description Central dashboard home showing overall placement readiness score,
 * placement process timeline, next milestones, 4-week preparation plan, and target pipeline.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  Compass,
  CheckCircle2,
  Code2,
  Network,
  FolderGit2,
  Flame,
  ArrowRight,
  Target,
  Sparkles,
  Calendar,
  Clock,
  Building2,
  Award,
  ChevronRight,
} from "lucide-react";

interface ProgressData {
  readiness: {
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
  };
  streakDays: number;
  roadmaps: {
    id: string;
    year: number;
    semester: number;
    title: string;
    percentage: number;
    milestones: {
      id: string;
      title: string;
      type: string;
      status: string;
      currentCount?: number;
      targetCount?: number;
    }[];
  }[];
  targetSummary: {
    total: number;
    byStatus: Record<string, number>;
    targets: { companyId: string; companyName: string; status: string }[];
  };
}

export function DashboardView() {
  const { currentBranch, setActiveTab, setSelectedCompanyId, setProfileModalOpen, student } =
    useAppStore();

  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch progress metrics
  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      try {
        const res = await fetch("/api/student/progress");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [currentBranch]);

  // Handle optimistic toggle of next-up milestones directly from dashboard
  async function handleToggleMilestone(milestoneId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    // Optimistically update local data
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        roadmaps: prev.roadmaps.map((r) => ({
          ...r,
          milestones: r.milestones.map((m) =>
            m.id === milestoneId ? { ...m, status: newStatus } : m
          ),
        })),
      };
    });

    try {
      await fetch("/api/student/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  }

  // Get next 4 incomplete milestones
  const nextMilestones =
    data?.roadmaps
      .flatMap((r) => r.milestones.map((m) => ({ ...m, semester: r.semester })))
      .filter((m) => m.status !== "DONE")
      .slice(0, 4) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Motivational Greeting */}
      <div className="flex flex-col gap-2 rounded-3xl bg-gradient-to-r from-primary/15 via-indigo-500/10 to-transparent p-6 sm:p-8 border border-primary/20 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              VIT Placement Readiness Command Center
            </span>
          </div>

          {/* Activity Streak Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{data?.streakDays || 1} Day Streak</span>
          </div>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back, {student?.name?.split(" ")[0] || "Scholar"}!
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Tracking your technical preparation, campus eligibility cutoffs, and target pipelines for{" "}
          <span className="font-bold text-foreground">{currentBranch}</span>. Follow the 4-week daily routine and hit your coding problem goals early.
        </p>

        {/* Quick Branch & Target Profile pill */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground">My Profile:</span>
          <span className="rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-foreground border border-border shadow-sm">
            {currentBranch} • Sem {student?.currentSemester || 5}
          </span>
          <span className="rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-foreground border border-border shadow-sm">
            CGPA: {student?.cgpa || "8.5"} • Arrears: {student?.standingArrears || 0}
          </span>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline ml-1"
          >
            Edit Profile →
          </button>
        </div>
      </div>

      {/* =======================================================================
          READINESS SCORE RING & CATEGORY BREAKDOWN
      ======================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Overall Readiness Ring Card */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 shadow-sm text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Overall Placement Readiness
          </h3>

          <div className="relative my-4 flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary stroke-current transition-all duration-1000"
                strokeDasharray={`${data?.readiness.overallPercentage || 0}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground">
                {data?.readiness.overallPercentage || 0}%
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Readiness</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Weighted composite of milestones (35%), coding practice (25%), skill mastery (25%), and resume projects (15%).
          </p>
        </div>

        {/* Category Breakdown Bars */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Competency Pillar Breakdown</h3>
            <span className="text-xs font-semibold text-primary">Live Progress</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Roadmap Milestones & Checklists
                </span>
                <span className="font-bold text-foreground">
                  {data?.readiness.breakdown.milestonesPercentage || 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${data?.readiness.breakdown.milestonesPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Coding Problems */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Code2 className="h-4 w-4 text-indigo-500" />
                  Coding Practice ({data?.readiness.codingTotals.totalSolved || 0} /{" "}
                  {data?.readiness.codingTotals.target || 300} solved)
                </span>
                <span className="font-bold text-foreground">
                  {data?.readiness.breakdown.codingPercentage || 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${data?.readiness.breakdown.codingPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Network className="h-4 w-4 text-sky-500" />
                  Technical Skills Proficiency
                </span>
                <span className="font-bold text-foreground">
                  {data?.readiness.breakdown.skillsPercentage || 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${data?.readiness.breakdown.skillsPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <FolderGit2 className="h-4 w-4 text-purple-500" />
                  Portfolio Resume Projects
                </span>
                <span className="font-bold text-foreground">
                  {data?.readiness.breakdown.projectsPercentage || 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${data?.readiness.breakdown.projectsPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => setActiveTab("progress")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Open Detailed Progress Tracker</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          RECRUITMENT WORKFLOW TIMELINE AT VIT
      ======================================================================= */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">Typical Campus Recruitment Funnel at VIT</h3>
            <p className="text-xs text-muted-foreground">
              Understand the standard 5-stage recruitment funnel to prepare strategically for each elimination gate.
            </p>
          </div>
          <span className="rounded-xl bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground border border-border">
            CDC Vellore Model
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 pt-2">
          {[
            {
              step: "1",
              title: "Portal Registration",
              desc: "CGPA & 0-arrears check on CDC portal, drive opt-in.",
            },
            {
              step: "2",
              title: "Pre-Placement Talk",
              desc: "Mandatory company PPT covering roles, package & bond policy.",
            },
            {
              step: "3",
              title: "Online Assessment",
              desc: "Aptitude, coding problems & CS/core fundamental MCQs.",
            },
            {
              step: "4",
              title: "Technical & HR",
              desc: "1-3 rounds of DSA/domain depth, project defense & STAR stories.",
            },
            {
              step: "5",
              title: "Offer & CDC Conversion",
              desc: "Letter of intent, CDC conversion, and internship-to-PPO.",
            },
          ].map((stage, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-border bg-muted/30 p-4 hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {stage.step}
                  </span>
                  {idx < 4 && <ChevronRight className="hidden sm:block h-4 w-4 text-muted-foreground/40" />}
                </div>
                <h4 className="text-xs font-bold text-foreground">{stage.title}</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================================
          NEXT UP MILESTONES & 4-WEEK PREPARATION PLAN
      ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Next Up Priority Milestones */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Next Up Milestones</h3>
            </div>
            <button
              onClick={() => setActiveTab("progress")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Full Roadmap →
            </button>
          </div>

          {nextMilestones.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              All immediate milestones completed! Excellent work.
            </p>
          ) : (
            <div className="space-y-2.5">
              {nextMilestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-3.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={m.status === "DONE"}
                      onChange={() => handleToggleMilestone(m.id, m.status)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Semester {m.semester} • {m.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {m.targetCount && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                      {m.currentCount || 0} / {m.targetCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4-Week Strategic Preparation Plan */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-bold text-foreground">4-Week SPRINT Prep Plan</h3>
                <p className="text-[11px] text-muted-foreground">90 minutes daily routine for placement drives</p>
              </div>
            </div>
            <span className="rounded-xl bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Active Routine
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between font-bold text-foreground mb-1">
                <span>Week 1: Fundamentals & Basic Data Structures</span>
                <span className="text-[11px] text-primary">2-3 problems/day</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Arrays, strings, linear/binary search, complexity analysis.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between font-bold text-foreground mb-1">
                <span>Week 2: Advanced Data Structures & Logic</span>
                <span className="text-[11px] text-primary">2-3 problems/day</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Stacks, queues, linked lists, hash maps, trees, explain aloud.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between font-bold text-foreground mb-1">
                <span>Week 3: Core Academic & System Fundamentals</span>
                <span className="text-[11px] text-primary">5-10 SQL queries/wk</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                OOP principles, DBMS normalization, ACID, OS threads & memory.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between font-bold text-foreground mb-1">
                <span>Week 4: Mocks, Resume Pitch & Behavioral</span>
                <span className="text-[11px] text-primary">Timed mock test</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Timed mock OAs, STAR method stories, pitch project architecture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          TARGET COMPANIES PIPELINE SUMMARY
      ======================================================================= */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">My Recruitment Target Pipeline</h3>
          </div>
          <button
            onClick={() => setActiveTab("companies")}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage Targets in Directory →
          </button>
        </div>

        {data?.targetSummary.total === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No target companies saved yet. Visit the Company Directory to target employers!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 pt-2">
            {[
              { status: "SAVED", label: "Saved", count: data?.targetSummary.byStatus.SAVED || 0, color: "text-slate-600" },
              { status: "PREPARING", label: "Preparing", count: data?.targetSummary.byStatus.PREPARING || 0, color: "text-amber-500" },
              { status: "APPLIED", label: "Applied", count: data?.targetSummary.byStatus.APPLIED || 0, color: "text-sky-500" },
              { status: "INTERVIEWING", label: "Interviewing", count: data?.targetSummary.byStatus.INTERVIEWING || 0, color: "text-purple-500" },
              { status: "OFFER", label: "Offers 🎉", count: data?.targetSummary.byStatus.OFFER || 0, color: "text-emerald-500 font-bold" },
              { status: "REJECTED", label: "Archived", count: data?.targetSummary.byStatus.REJECTED || 0, color: "text-muted-foreground" },
            ].map((st) => (
              <div key={st.status} className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <p className={`text-2xl font-bold ${st.color}`}>{st.count}</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{st.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
