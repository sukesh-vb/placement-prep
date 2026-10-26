/**
 * @file src/components/ProfileModal.tsx
 * @description Modal dialog for updating student profile settings, academic metrics, and target bucket.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { X, Check, GraduationCap, AlertCircle, Sparkles } from "lucide-react";

export function ProfileModal() {
  const { isProfileModalOpen, setProfileModalOpen, student, setStudent, currentBranch, setCurrentBranch } =
    useAppStore();

  const [name, setName] = useState(student?.name || "");
  const [branchCode, setBranchCode] = useState(student?.branchCode || currentBranch);
  const [currentYear, setCurrentYear] = useState(student?.currentYear || 3);
  const [currentSemester, setCurrentSemester] = useState(student?.currentSemester || 5);
  const [cgpa, setCgpa] = useState<string>(student?.cgpa !== null && student?.cgpa !== undefined ? student.cgpa.toString() : "8.5");
  const [standingArrears, setStandingArrears] = useState<string>(
    student?.standingArrears !== null && student?.standingArrears !== undefined ? student.standingArrears.toString() : "0"
  );
  const [targetBucketPref, setTargetBucketPref] = useState(student?.targetBucketPref || "BALANCED");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setBranchCode(student.branchCode);
      setCurrentYear(student.currentYear);
      setCurrentSemester(student.currentSemester);
      setCgpa(student.cgpa !== null && student.cgpa !== undefined ? student.cgpa.toString() : "");
      setStandingArrears(student.standingArrears !== null && student.standingArrears !== undefined ? student.standingArrears.toString() : "0");
      setTargetBucketPref(student.targetBucketPref || "BALANCED");
    }
  }, [student]);

  if (!isProfileModalOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const parsedCgpa = cgpa ? parseFloat(cgpa) : null;
      const parsedArrears = standingArrears ? parseInt(standingArrears, 10) : 0;

      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          branchCode,
          currentYear,
          currentSemester,
          cgpa: parsedCgpa,
          standingArrears: parsedArrears,
          targetBucketPref,
        }),
      });

      const data = await res.json();
      if (res.ok && data.student) {
        setStudent(data.student);
        setCurrentBranch(data.student.branchCode);
        setMessage("Profile updated successfully!");
        setTimeout(() => {
          setProfileModalOpen(false);
          setMessage(null);
        }, 800);
      } else {
        setMessage(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setMessage("Network error saving profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Student Profile & Preferences</h2>
              <p className="text-xs text-muted-foreground">Tailor your placement targets and roadmaps</p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {message && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                message.includes("success")
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Sukesh Kumar"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Degree Branch</label>
              <select
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="CSE">CSE (Computer Science)</option>
                <option value="MECH">MECH (Mechanical)</option>
                <option value="BIOTECH">BIOTECH (Biotechnology)</option>
                <option value="CHEM">CHEM (Chemical)</option>
                <option value="ECE">ECE (Electronics & Comm)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Current Semester</label>
              <select
                value={currentSemester}
                onChange={(e) => {
                  const sem = parseInt(e.target.value, 10);
                  setCurrentSemester(sem);
                  setCurrentYear(Math.ceil(sem / 2));
                }}
                className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} (Year {Math.ceil(s / 2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Current CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 8.75"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Standing Arrears</label>
              <input
                type="number"
                min="0"
                value={standingArrears}
                onChange={(e) => setStandingArrears(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Application Strategy Focus</label>
            <select
              value={targetBucketPref}
              onChange={(e) => setTargetBucketPref(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="BALANCED">Balanced Portfolio (Safety offer first, then Target & Reach)</option>
              <option value="TARGET_FOCUSED">Target-Centric (Core product & domain leaders)</option>
              <option value="REACH_HEAVY">Reach / Super Dream (Off-campus, Big Tech & high CTC)</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
