/**
 * @file src/components/companies/CompanyDetailDrawer.tsx
 * @description Slide-over inspection drawer for company details, branch roles,
 * required skills with student gap assessment, sample interview questions, and eligibility.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  X,
  ExternalLink,
  Users,
  Target,
  Shield,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Code2,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface CompanyDetailData {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  hqNotes?: string;
  historicalHiringCount?: number;
  branchTier: "REACH" | "TARGET" | "SAFETY";
  tierSource: "EXPLICIT" | "INFERRED";
  minCgpa?: number;
  arrearsAllowed?: number;
  eligibilityNotes?: string;
  sectors: string[];
  roles: {
    id: string;
    title: string;
    description?: string;
    selectionNotes?: string;
    requiredSkills: { id: string; name: string; importance: string }[];
  }[];
  skills: {
    id: string;
    name: string;
    category: string;
    description?: string;
    priority: string;
    studentProficiency: "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG";
    gapStatus: "SATISFIED" | "DEVELOPING" | "GAP";
  }[];
  interviewQuestions: {
    id: string;
    topic: string;
    question: string;
    answerGuide?: string;
  }[];
  studentTarget?: {
    status: string;
    notes?: string;
  } | null;
  eligibility: {
    verdict: "LIKELY_ELIGIBLE" | "CHECK_CRITERIA" | "NOT_ELIGIBLE";
    reasons: string[];
  };
}

export function CompanyDetailDrawer() {
  const { selectedCompanyId, setSelectedCompanyId, currentBranch } = useAppStore();
  const [data, setData] = useState<CompanyDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("SAVED");
  const [targetNotes, setTargetNotes] = useState<string>("");
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    if (!selectedCompanyId) {
      setData(null);
      return;
    }

    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/${selectedCompanyId}?branch=${currentBranch}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.company);
          setTargetStatus(json.company.studentTarget?.status || "SAVED");
          setTargetNotes(json.company.studentTarget?.notes || "");
        }
      } catch (err) {
        console.error("Failed to fetch company details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [selectedCompanyId, currentBranch]);

  if (!selectedCompanyId) return null;

  async function handleTargetUpdate(newStatus: string) {
    if (!data) return;
    setSavingTarget(true);
    setTargetStatus(newStatus);

    try {
      await fetch("/api/student/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: data.id,
          status: newStatus,
          notes: targetNotes,
        }),
      });
    } catch (err) {
      console.error("Failed to update target status:", err);
    } finally {
      setSavingTarget(false);
    }
  }

  async function handleSkillRatingChange(skillId: string, newProficiency: string) {
    if (!data) return;
    try {
      // Optimistic update in local drawer
      setData({
        ...data,
        skills: data.skills.map((s) =>
          s.id === skillId
            ? {
                ...s,
                studentProficiency: newProficiency as any,
                gapStatus:
                  newProficiency === "STRONG" || newProficiency === "COMFORTABLE"
                    ? "SATISFIED"
                    : newProficiency === "LEARNING"
                    ? "DEVELOPING"
                    : "GAP",
              }
            : s
        ),
      });

      await fetch("/api/student/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          proficiency: newProficiency,
        }),
      });
    } catch (err) {
      console.error("Failed to update skill rating:", err);
    }
  }

  const tierBadgeConfig = {
    REACH: {
      label: "Reach / Super Dream",
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: Rocket,
    },
    TARGET: {
      label: "Target Company",
      bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      icon: Target,
    },
    SAFETY: {
      label: "Safety / High-Volume",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Shield,
    },
  }[data?.branchTier || "TARGET"];

  const TierIcon = tierBadgeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-primary text-white font-bold text-lg shadow-sm">
              {data?.name?.charAt(0) || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{data?.name}</h2>
                {data && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tierBadgeConfig.bg}`}
                  >
                    <TierIcon className="h-3 w-3" />
                    <span>{tierBadgeConfig.label}</span>
                  </span>
                )}
                {data?.tierSource === "INFERRED" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground border border-border" title="Inferred based on hiring track">
                    Estimated
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Branch Scope: <span className="font-semibold text-foreground">{currentBranch}</span>
                {data?.hqNotes ? ` • ${data.hqNotes}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCompanyId(null)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-muted-foreground">Company details not available.</div>
        ) : (
          <div className="flex-1 space-y-6 p-6">
            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 p-4 border border-border">
              <div className="flex items-center gap-4">
                {data.historicalHiringCount ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{data.historicalHiringCount.toLocaleString()} alumni recorded</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Selective hiring volume</span>
                )}
                {data.website && (
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Careers Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Recruitment Pipeline Status Changer */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">My Status:</span>
                <select
                  value={targetStatus}
                  onChange={(e) => handleTargetUpdate(e.target.value)}
                  disabled={savingTarget}
                  className="rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-foreground border border-border focus:ring-2 focus:ring-primary shadow-sm"
                >
                  <option value="SAVED">Saved</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFER">Offer Received 🎉</option>
                  <option value="REJECTED">Archived</option>
                </select>
              </div>
            </div>

            {/* Eligibility Assessment Widget */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                data.eligibility.verdict === "LIKELY_ELIGIBLE"
                  ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  : data.eligibility.verdict === "NOT_ELIGIBLE"
                  ? "bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  : "bg-amber-500/5 border-amber-500/30 text-amber-950 dark:text-amber-100"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {data.eligibility.verdict === "LIKELY_ELIGIBLE" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Likely Eligible</span>
                  </>
                ) : data.eligibility.verdict === "NOT_ELIGIBLE" ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">Check Cutoff Criteria</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Check CDC Drive Criteria</span>
                  </>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {data.eligibility.reasons.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
                {data.minCgpa && <li>• Drive cutoff: Min CGPA {data.minCgpa}</li>}
                <li>• Standing arrears allowed: {data.arrearsAllowed ?? 0}</li>
              </ul>
              {data.eligibilityNotes && (
                <p className="mt-2 text-xs italic text-muted-foreground border-t border-border/50 pt-2">
                  Selection Notes: {data.eligibilityNotes}
                </p>
              )}
            </div>

            {/* Sectors Chips */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry Sectors</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.sectors.map((sec, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>

            {/* Roles Offered */}
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Roles for {currentBranch}</h3>
              </div>
              <div className="mt-3 space-y-2.5">
                {data.roles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No specific role mapping defined for this branch.</p>
                ) : (
                  data.roles.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <h4 className="text-sm font-bold text-foreground">{r.title}</h4>
                      {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                      {r.selectionNotes && (
                        <p className="mt-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground border border-border/50">
                          <span className="font-semibold text-foreground">Evaluation Notes:</span> {r.selectionNotes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Required Skills & Student Skill Gap */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Required Skills & My Gap</h3>
                </div>
                <span className="text-xs text-muted-foreground">Click chips to rate proficiency</span>
              </div>

              <div className="mt-3 space-y-2">
                {data.skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No specific skill priorities recorded.</p>
                ) : (
                  data.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{skill.name}</span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {skill.category}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{skill.description}</p>
                        )}
                      </div>

                      {/* Proficiency Selector & Gap Indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            skill.gapStatus === "SATISFIED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : skill.gapStatus === "DEVELOPING"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {skill.gapStatus}
                        </span>

                        <select
                          value={skill.studentProficiency}
                          onChange={(e) => handleSkillRatingChange(skill.id, e.target.value)}
                          className="rounded-lg bg-muted px-2 py-1 text-[11px] font-medium text-foreground border border-border focus:ring-1 focus:ring-primary"
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="LEARNING">Learning</option>
                          <option value="COMFORTABLE">Comfortable</option>
                          <option value="STRONG">Strong</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sample Interview Questions */}
            {data.interviewQuestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-foreground">Sample Technical Round Questions</h3>
                </div>
                <div className="mt-3 space-y-2.5">
                  {data.interviewQuestions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {q.topic}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-foreground">{q.question}</p>
                      {q.answerGuide && (
                        <p className="mt-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground border border-border/40">
                          💡 <span className="font-semibold text-foreground">Guide:</span> {q.answerGuide}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
