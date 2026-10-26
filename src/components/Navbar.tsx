/**
 * @file src/components/Navbar.tsx
 * @description Top navigation bar with branch switcher, view tabs, profile summary,
 * dark mode toggle, and mobile menu.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  Compass,
  Building2,
  Network,
  CheckCircle2,
  Moon,
  Sun,
  User,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface BranchOption {
  code: string;
  name: string;
}

export function Navbar() {
  const {
    currentBranch,
    setCurrentBranch,
    student,
    setStudent,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    setProfileModalOpen,
  } = useAppStore();

  const [branches, setBranches] = useState<BranchOption[]>([
    { code: "CSE", name: "Computer Science & Eng" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "BIOTECH", name: "Biotechnology" },
    { code: "CHEM", name: "Chemical Engineering" },
    { code: "ECE", name: "Electronics & Communication" },
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch student session and available branches on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [meRes, branchRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/branches"),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          if (data.student) {
            setStudent(data.student);
          }
        }

        if (branchRes.ok) {
          const bData = await branchRes.json();
          if (bData.branches?.length > 0) {
            setBranches(
              bData.branches.map((b: any) => ({
                code: b.code,
                name: b.name,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load initial navigation data:", err);
      }
    }
    loadInitialData();
  }, [setStudent]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    { id: "companies", label: "Company Directory", icon: Building2 },
    { id: "skills", label: "Skill Mapping", icon: Network },
    { id: "progress", label: "Progress Tracker", icon: CheckCircle2 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-primary text-white shadow-md shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">PlacementPrep</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                VIT
              </span>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">Campus Placement Engine</p>
          </div>
        </div>

        {/* Branch Switcher (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-muted/60 p-1 border border-border">
          <span className="pl-2 text-xs font-medium text-muted-foreground">Branch:</span>
          <select
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value)}
            className="rounded-lg bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controls: Profile, Theme, Mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Profile Summary Badge */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            title="Edit profile & preferences"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-semibold leading-tight">{student?.name || "Demo Student"}</p>
              <p className="text-[11px] text-muted-foreground">
                {currentBranch} • Sem {student?.currentSemester || 5} • {student?.cgpa ? `${student.cgpa} CGPA` : "No CGPA"}
              </p>
            </div>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card px-4 pt-2 pb-4 md:hidden">
          {/* Mobile Branch Selector */}
          <div className="mb-3 flex items-center justify-between rounded-lg bg-muted p-2">
            <span className="text-xs font-medium text-muted-foreground">Select Branch:</span>
            <select
              value={currentBranch}
              onChange={(e) => {
                setCurrentBranch(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="rounded-md bg-card px-2 py-1 text-xs font-semibold text-foreground border border-border"
            >
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} ({b.name.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
