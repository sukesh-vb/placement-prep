/**
 * @file src/app/page.tsx
 * @description Main application entry point for PlacementPrep.
 * Coordinates views, drawers, modals, and global client-side navigation.
 */

"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { ProfileModal } from "@/components/ProfileModal";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { CompanyDirectoryView } from "@/components/companies/CompanyDirectoryView";
import { CompanyDetailDrawer } from "@/components/companies/CompanyDetailDrawer";
import { SkillMappingView } from "@/components/skills/SkillMappingView";
import { ProgressTrackerView } from "@/components/progress/ProgressTrackerView";

export default function PlacementPrepApp() {
  const { activeTab } = useAppStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "companies" && <CompanyDirectoryView />}
        {activeTab === "skills" && <SkillMappingView />}
        {activeTab === "progress" && <ProgressTrackerView />}
      </main>

      {/* Slide-over Inspection Drawer for Company Detail */}
      <CompanyDetailDrawer />

      {/* Student Profile Configuration Modal */}
      <ProfileModal />

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 PlacementPrep • Tailored for Engineering Campus Placements (VIT Vellore)</p>
          <div className="flex items-center gap-4">
            <span>Branch-Tailored Roadmaps</span>
            <span>•</span>
            <span>Relational Skill Mapping</span>
            <span>•</span>
            <span>Optimistic State Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
