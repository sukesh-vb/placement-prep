/**
 * @file src/components/skills/SkillMappingView.tsx
 * @description Comprehensive relational skill mapping matrix (Skills <-> Roles <-> Companies)
 * and interactive "My Skill Gap" engine with sequential learning roadmap.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  Network,
  Briefcase,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  studentProficiency: "NOT_STARTED" | "LEARNING" | "COMFORTABLE" | "STRONG";
  companiesCount: number;
  companies: { id: string; name: string; hiringCount?: number; priority: string }[];
  rolesCount: number;
  roles: { id: string; title: string; importance: string }[];
}

interface RoleItem {
  id: string;
  title: string;
  description?: string;
  companiesCount: number;
  companies: { id: string; name: string }[];
  skills: {
    id: string;
    name: string;
    category: string;
    importance: string;
    studentProficiency: string;
  }[];
}

interface CompanySkillItem {
  id: string;
  name: string;
  tier: string;
  skills: {
    id: string;
    name: string;
    category: string;
    priority: string;
    studentProficiency: string;
  }[];
}

export function SkillMappingView() {
  const { currentBranch, setSelectedCompanyId } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<"gap" | "skills" | "roles" | "companies">("gap");
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [companies, setCompanies] = useState<CompanySkillItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Skill Gap Analysis State
  const [selectedTargetCompanyIds, setSelectedTargetCompanyIds] = useState<string[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [gapLoading, setGapLoading] = useState(false);

  // Load skill mapping data
  const loadSkillData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills?branch=${currentBranch}`);
      if (res.ok) {
        const json = await res.json();
        setSkills(json.skills || []);
        setRoles(json.roles || []);
        setCompanies(json.companies || []);
        setCategories(json.categories || []);

        // Pick initial top 3 companies for gap analysis
        if (json.companies?.length > 0 && selectedTargetCompanyIds.length === 0) {
          const topIds = json.companies.slice(0, 3).map((c: any) => c.id);
          setSelectedTargetCompanyIds(topIds);
        }
      }
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranch]);

  useEffect(() => {
    loadSkillData();
  }, [loadSkillData]);

  // Run skill gap computation
  const runSkillGapAnalysis = useCallback(async () => {
    setGapLoading(true);
    try {
      const res = await fetch("/api/skills/gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchCode: currentBranch,
          targetCompanyIds: selectedTargetCompanyIds,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setGapAnalysis(json.analysis);
      }
    } catch (err) {
      console.error("Failed to run skill gap analysis:", err);
    } finally {
      setGapLoading(false);
    }
  }, [currentBranch, selectedTargetCompanyIds]);

  useEffect(() => {
    if (activeSubTab === "gap") {
      runSkillGapAnalysis();
    }
  }, [activeSubTab, runSkillGapAnalysis]);

  // Handle student rating update
  async function handleProficiencyChange(skillId: string, newProficiency: string) {
    try {
      // Optimistic update in skills list
      setSkills((prev) =>
        prev.map((s) =>
          s.id === skillId ? { ...s, studentProficiency: newProficiency as any } : s
        )
      );

      // Re-trigger gap analysis
      setTimeout(() => {
        runSkillGapAnalysis();
      }, 50);

      await fetch("/api/student/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          proficiency: newProficiency,
        }),
      });
    } catch (err) {
      console.error("Failed to update proficiency:", err);
    }
  }

  function toggleTargetCompany(companyId: string) {
    setSelectedTargetCompanyIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  }

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Skill Mapping & Gap Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Explore industry competencies for <span className="font-semibold text-primary">{currentBranch}</span>, evaluate your skill gap, and get a sequential learning roadmap.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/70 p-1 border border-border">
          <button
            onClick={() => setActiveSubTab("gap")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "gap"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>My Skill Gap</span>
          </button>
          <button
            onClick={() => setActiveSubTab("skills")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "skills"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Network className="h-3.5 w-3.5 text-indigo-500" />
            <span>Skills Directory</span>
          </button>
          <button
            onClick={() => setActiveSubTab("roles")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "roles"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-sky-500" />
            <span>Role Requirements</span>
          </button>
          <button
            onClick={() => setActiveSubTab("companies")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === "companies"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Company Priorities</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: MY SKILL GAP ENGINE
      ======================================================================= */}
      {activeSubTab === "gap" && (
        <div className="space-y-6">
          {/* Target Selection Bar */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Select Target Companies to Analyze</h3>
                <p className="text-xs text-muted-foreground">
                  The skill gap engine aggregates requirements across your chosen employers and prioritizes shared competencies.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary">
                {selectedTargetCompanyIds.length} Companies Selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {companies.slice(0, 16).map((c) => {
                const isSelected = selectedTargetCompanyIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleTargetCompany(c.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gap Results Overview */}
          {gapLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : gapAnalysis ? (
            <div className="space-y-6">
              {/* Readiness Score Ring & Metrics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Match Percentage Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-muted stroke-current"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary stroke-current transition-all duration-1000"
                        strokeDasharray={`${gapAnalysis.matchPercentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-foreground">
                      {gapAnalysis.matchPercentage}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Target Match
                    </h4>
                    <p className="text-sm font-semibold text-foreground">
                      {gapAnalysis.matchPercentage >= 70
                        ? "Strong Alignment 🎉"
                        : gapAnalysis.matchPercentage >= 40
                        ? "Moderate Coverage"
                        : "Significant Skill Gap"}
                    </p>
                  </div>
                </div>

                {/* Satisfied Skills */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Satisfied Skills
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {gapAnalysis.satisfiedSkillsCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Strong or Comfortable self-rating</p>
                </div>

                {/* In Progress Skills */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Developing
                    </span>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {gapAnalysis.developingSkillsCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Currently marked as Learning</p>
                </div>

                {/* Missing Skills */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Missing Skills
                    </span>
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {gapAnalysis.missingSkillsCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Not yet started or unrated</p>
                </div>
              </div>

              {/* Recommended Sequential Learning Roadmap */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Recommended Sequential Learning Order
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Algorithmic roadmap ranked by target company demand and foundational dependencies
                      </p>
                    </div>
                  </div>
                  <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {gapAnalysis.recommendedLearningOrder.length} Skills to Focus On
                  </span>
                </div>

                {gapAnalysis.recommendedLearningOrder.length === 0 ? (
                  <div className="p-8 text-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    Outstanding! You have satisfied all required competencies for your selected targets!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gapAnalysis.recommendedLearningOrder.map((item: any, idx: number) => {
                      const phaseLabel = {
                        "1_FOUNDATION": "Phase 1: Universal Foundation",
                        "2_CORE_REQUIREMENT": "Phase 2: Core Domain Focus",
                        "3_DIFFERENTIATOR": "Phase 3: Differentiator Tools",
                      }[item.learningPhase as string] || "Core Skill";

                      return (
                        <div
                          key={item.skillId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-foreground text-sm">{item.skillName}</span>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                                  {item.category}
                                </span>
                                <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                  {phaseLabel}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Required by{" "}
                                <span className="font-semibold text-foreground">
                                  {item.requiredByCount} target{" "}
                                  {item.requiredByCount === 1 ? "company" : "companies"}
                                </span>{" "}
                                ({item.requiredByCompanies.join(", ")})
                              </p>
                            </div>
                          </div>

                          {/* Self-Rating Stepper */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <select
                              value={item.currentProficiency}
                              onChange={(e) => handleProficiencyChange(item.skillId, e.target.value)}
                              className="rounded-lg bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border focus:ring-2 focus:ring-primary shadow-sm"
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="LEARNING">Learning</option>
                              <option value="COMFORTABLE">Comfortable</option>
                              <option value="STRONG">Strong</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* =======================================================================
          TAB 2: FULL SKILLS DIRECTORY
      ======================================================================= */}
      {activeSubTab === "skills" && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills (e.g. DSA, SQL, CAD, Aspen Plus, Verilog)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((s) => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {s.category}
                    </span>
                    <span className="text-[11px] font-semibold text-primary">
                      {s.companiesCount} {s.companiesCount === 1 ? "Company" : "Companies"}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-foreground">{s.name}</h4>
                  {s.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  )}

                  {/* Sample companies */}
                  {s.companies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.companies.slice(0, 3).map((comp) => (
                        <span
                          key={comp.id}
                          className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-foreground border border-border/50"
                        >
                          {comp.name}
                        </span>
                      ))}
                      {s.companies.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{s.companies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Self-Rating Stepper */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-medium">My Level:</span>
                  <select
                    value={s.studentProficiency}
                    onChange={(e) => handleProficiencyChange(s.id, e.target.value)}
                    className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-foreground border border-border focus:ring-1 focus:ring-primary"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="LEARNING">Learning</option>
                    <option value="COMFORTABLE">Comfortable</option>
                    <option value="STRONG">Strong</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: ROLE REQUIREMENTS
      ======================================================================= */}
      {activeSubTab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {roles.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{r.title}</h3>
                    {r.description && <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>}
                  </div>
                  <span className="rounded-xl bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary shrink-0">
                    {r.companiesCount} Recruiters
                  </span>
                </div>

                {/* Skills required */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Required Competencies
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {r.skills.map((sk) => (
                      <div
                        key={sk.id}
                        className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              sk.importance === "MUST_HAVE" ? "bg-rose-500" : "bg-sky-500"
                            }`}
                          />
                          <span className="font-medium text-foreground">{sk.name}</span>
                          <span className="text-[10px] text-muted-foreground">({sk.category})</span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            sk.importance === "MUST_HAVE"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          }`}
                        >
                          {sk.importance === "MUST_HAVE" ? "Must-Have" : "Good-to-Have"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employers offering this role */}
                {r.companies.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-medium">Recruiting Employers:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.companies.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCompanyId(c.id)}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: COMPANY PRIORITIES
      ======================================================================= */}
      {activeSubTab === "companies" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((comp) => (
            <div key={comp.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-base">{comp.name}</h4>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {comp.tier}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Prioritized Technical Focus
                </span>
                <div className="mt-2 space-y-1.5">
                  {comp.skills.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-xs"
                    >
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.priority} Priority</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedCompanyId(comp.id)}
                className="mt-2 w-full rounded-xl bg-muted py-2 text-center text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Inspect Company & Practice Questions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
