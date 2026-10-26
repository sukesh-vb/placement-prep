/**
 * @file src/lib/store.ts
 * @description Global client application state managed via Zustand.
 * Tracks active branch, student profile, theme, active view, and optimistic updates.
 */

import { create } from "zustand";

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  currentYear: number;
  currentSemester: number;
  cgpa: number | null;
  standingArrears: number | null;
  targetBucketPref?: string | null;
}

interface AppState {
  currentBranch: string;
  student: StudentProfile | null;
  theme: "light" | "dark";
  activeTab: "dashboard" | "companies" | "skills" | "progress";
  selectedCompanyId: string | null;
  isProfileModalOpen: boolean;

  // Actions
  setCurrentBranch: (branch: string) => void;
  setStudent: (student: StudentProfile | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setActiveTab: (tab: "dashboard" | "companies" | "skills" | "progress") => void;
  setSelectedCompanyId: (id: string | null) => void;
  setProfileModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentBranch: "CSE",
  student: null,
  theme: "light",
  activeTab: "dashboard",
  selectedCompanyId: null,
  isProfileModalOpen: false,

  setCurrentBranch: (currentBranch) => set({ currentBranch }),
  setStudent: (student) =>
    set({
      student,
      currentBranch: student?.branchCode || "CSE",
    }),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { theme: nextTheme };
    }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedCompanyId: (selectedCompanyId) => set({ selectedCompanyId }),
  setProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),
}));
