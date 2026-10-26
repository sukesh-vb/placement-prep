/**
 * @file src/components/companies/CompanyDirectoryView.tsx
 * @description Searchable, paginated, filterable grid of companies with URL-synced query params.
 * Allows filtering by branch, tier (Reach/Target/Safety), sectors, min hiring count, and sorting.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Building2,
  Users,
  Target,
  Shield,
  Rocket,
  Bookmark,
  Check,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface CompanyCardData {
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
  roles: string[];
  topSkills: { id: string; name: string; category: string }[];
  allSkillsCount: number;
  studentTarget?: {
    status: string;
    notes?: string;
  } | null;
}

export function CompanyDirectoryView() {
  const { currentBranch, setCurrentBranch, setSelectedCompanyId } = useAppStore();

  const [companies, setCompanies] = useState<CompanyCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [minHiring, setMinHiring] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("hiring");
  const [page, setPage] = useState(1);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  // Initialize filters from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bParam = params.get("branch");
      const tParam = params.get("tier");
      const sParam = params.get("sectors");
      const qParam = params.get("search");
      const sortParam = params.get("sort");
      const minParam = params.get("minHiring");

      if (bParam) setCurrentBranch(bParam);
      if (tParam) setSelectedTier(tParam);
      if (sParam) setSelectedSectors(sParam.split(",").filter(Boolean));
      if (qParam) setSearch(qParam);
      if (sortParam) setSortBy(sortParam);
      if (minParam) setMinHiring(parseInt(minParam, 10));
    }
  }, [setCurrentBranch]);

  // Sync state to URL
  const updateURL = useCallback(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (currentBranch) params.set("branch", currentBranch);
    if (selectedTier && selectedTier !== "ALL") params.set("tier", selectedTier);
    if (selectedSectors.length > 0) params.set("sectors", selectedSectors.join(","));
    if (search) params.set("search", search);
    if (sortBy !== "hiring") params.set("sort", sortBy);
    if (minHiring > 0) params.set("minHiring", minHiring.toString());
    if (page > 1) params.set("page", page.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [currentBranch, selectedTier, selectedSectors, search, sortBy, minHiring, page]);

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        branch: currentBranch,
        tier: selectedTier,
        sectors: selectedSectors.join(","),
        search: search.trim(),
        minHiring: minHiring.toString(),
        sort: sortBy,
        page: page.toString(),
        limit: "15",
      });

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.companies || []);
        setTotalCount(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
        if (json.availableSectors) {
          setAvailableSectors(json.availableSectors);
        }
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranch, selectedTier, selectedSectors, search, minHiring, sortBy, page]);

  useEffect(() => {
    fetchCompanies();
    updateURL();
  }, [fetchCompanies, updateURL]);

  function handleResetFilters() {
    setSearch("");
    setSelectedTier("ALL");
    setSelectedSectors([]);
    setMinHiring(0);
    setSortBy("hiring");
    setPage(1);
  }

  async function handleTargetStatusChange(companyId: string, newStatus: string) {
    try {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                studentTarget: { status: newStatus },
              }
            : c
        )
      );

      await fetch("/api/student/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to update target status:", err);
    }
  }

  function toggleSector(sec: string) {
    setSelectedSectors((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
    setPage(1);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Directory</h1>
          <p className="text-sm text-muted-foreground">
            Explore and filter employers visiting VIT Vellore for{" "}
            <span className="font-semibold text-primary">{currentBranch}</span> graduates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20">
            {totalCount} Companies Available
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        {/* Search & Main Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company name (e.g. Amazon, TCS, Bosch, Biocon)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="hiring">Alumni Hiring Volume</option>
              <option value="name">Company Name (A-Z)</option>
              <option value="tier">Application Tier (Reach first)</option>
            </select>
          </div>
        </div>

        {/* Tier Buttons & Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Tier Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Tier:</span>
            {[
              { id: "ALL", label: "All Tiers" },
              { id: "REACH", label: "Reach / Super Dream", icon: Rocket, color: "text-purple-600 dark:text-purple-400" },
              { id: "TARGET", label: "Target (Core)", icon: Target, color: "text-sky-600 dark:text-sky-400" },
              { id: "SAFETY", label: "Safety (Volume)", icon: Shield, color: "text-emerald-600 dark:text-emerald-400" },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTier === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTier(t.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  }`}
                >
                  {Icon && <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : t.color}`} />}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sector Filter & Min Hiring Slider */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sector Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedSectors.length > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>
                  Sectors {selectedSectors.length > 0 ? `(${selectedSectors.length})` : ""}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isSectorDropdownOpen && (
                <div className="absolute right-0 z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl">
                  <div className="p-1.5 text-[11px] font-bold text-muted-foreground uppercase">
                    Select Sectors
                  </div>
                  {availableSectors.map((sec) => (
                    <label
                      key={sec}
                      className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs text-foreground hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSectors.includes(sec)}
                        onChange={() => toggleSector(sec)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="truncate">{sec}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Min Hiring Slider */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Min Alumni:</span>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={minHiring}
                onChange={(e) => {
                  setMinHiring(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="w-20 cursor-pointer accent-primary"
              />
              <span className="font-bold text-foreground w-8 text-right">
                {minHiring > 0 ? `${minHiring}+` : "Any"}
              </span>
            </div>

            {/* Clear All Filters */}
            {(selectedTier !== "ALL" || selectedSectors.length > 0 || search || minHiring > 0) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Sector Badges */}
        {selectedSectors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] text-muted-foreground">Active sector filters:</span>
            {selectedSectors.map((sec) => (
              <span
                key={sec}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary border border-primary/20"
              >
                <span>{sec}</span>
                <button onClick={() => toggleSector(sec)} className="hover:text-primary-foreground">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-card p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
              <div className="h-16 bg-muted/60 rounded-xl" />
              <div className="h-8 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No companies match your filters</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Try adjusting your search query, lowering the minimum hiring volume, or expanding tier filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => {
            const tierBadge = {
              REACH: {
                label: "Reach",
                bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                icon: Rocket,
              },
              TARGET: {
                label: "Target",
                bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
                icon: Target,
              },
              SAFETY: {
                label: "Safety",
                bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                icon: Shield,
              },
            }[company.branchTier];

            const TierIcon = tierBadge.icon;
            const targetStatus = company.studentTarget?.status || "NOT_TARGETED";

            return (
              <div
                key={company.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary font-bold text-lg border border-primary/20">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        {company.hqNotes && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{company.hqNotes}</p>
                        )}
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tierBadge.bg}`}
                      >
                        <TierIcon className="h-3 w-3" />
                        <span>{tierBadge.label}</span>
                      </span>
                      {company.tierSource === "INFERRED" && (
                        <span className="text-[9px] text-muted-foreground" title="Inferred based on hiring patterns">
                          Estimated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hiring Volume & Primary Sectors */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {company.historicalHiringCount ? (
                      <div className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{company.historicalHiringCount.toLocaleString()} alumni</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Selective recruitment</span>
                    )}

                    {company.sectors.slice(0, 2).map((sec, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/50"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>

                  {/* Top Required Skills */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Key Competencies:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {company.topSkills.map((sk) => (
                        <span
                          key={sk.id}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border"
                        >
                          {sk.name}
                        </span>
                      ))}
                      {company.allSkillsCount > company.topSkills.length && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{company.allSkillsCount - company.topSkills.length} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-border">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={targetStatus}
                      onChange={(e) => handleTargetStatusChange(company.id, e.target.value)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                        targetStatus === "OFFER"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : targetStatus !== "NOT_TARGETED"
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <option value="NOT_TARGETED">Target Status</option>
                      <option value="SAVED">Saved</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEWING">Interviewing</option>
                      <option value="OFFER">Offer 🎉</option>
                      <option value="REJECTED">Archived</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setSelectedCompanyId(company.id)}
                    className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <span>View Roles & Skills</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground px-2">
            Page <span className="font-bold text-foreground">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
