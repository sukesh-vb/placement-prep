/**
 * @file src/app/api/companies/[id]/route.ts
 * @description Detailed company view with branch-specific roles, skills gap, interview questions,
 * and student eligibility verification.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const student = await getAuthStudent(req);
    const url = new URL(req.url);
    const branchCode = url.searchParams.get("branch") || student?.branch.code || "CSE";

    const branch = await prisma.branch.findUnique({
      where: { code: branchCode.toUpperCase() },
    });

    if (!branch) {
      return NextResponse.json({ error: `Branch ${branchCode} not found` }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        companyBranches: {
          where: { branchId: branch.id },
        },
        companySectors: {
          include: { sector: true },
        },
        companyRoles: {
          where: { branchId: branch.id },
          include: {
            role: {
              include: {
                roleSkills: {
                  include: { skill: true },
                },
              },
            },
          },
        },
        companySkills: {
          where: { branchId: branch.id },
          include: { skill: true },
          orderBy: { priority: "desc" },
        },
        interviewQuestions: {
          where: {
            OR: [{ branchId: branch.id }, { branchId: null }],
          },
          take: 10,
        },
        targetStudents: student
          ? {
              where: { studentId: student.id },
            }
          : false,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const branchProfile = company.companyBranches[0] || null;
    const targetRecord = company.targetStudents?.[0] || null;

    // Fetch student's skill proficiencies for comparison
    const studentSkills = student
      ? await prisma.studentSkill.findMany({
          where: { studentId: student.id },
          include: { skill: true },
        })
      : [];

    const studentSkillMap = new Map<string, string>();
    for (const ss of studentSkills) {
      studentSkillMap.set(ss.skillId, ss.proficiency);
      studentSkillMap.set(ss.skill.name.toLowerCase(), ss.proficiency);
    }

    // Map company skills with student proficiency & gap indicator
    const skillsWithStudentStatus = company.companySkills.map((cs) => {
      const proficiency =
        studentSkillMap.get(cs.skill.id) ||
        studentSkillMap.get(cs.skill.name.toLowerCase()) ||
        "NOT_STARTED";

      let gapStatus: "SATISFIED" | "DEVELOPING" | "GAP" = "GAP";
      if (proficiency === "STRONG" || proficiency === "COMFORTABLE") {
        gapStatus = "SATISFIED";
      } else if (proficiency === "LEARNING") {
        gapStatus = "DEVELOPING";
      }

      return {
        id: cs.skill.id,
        name: cs.skill.name,
        category: cs.skill.category,
        description: cs.skill.description,
        resources: cs.skill.resources ? JSON.parse(cs.skill.resources) : [],
        priority: cs.priority,
        studentProficiency: proficiency,
        gapStatus,
      };
    });

    // Check student eligibility
    let eligibilityVerdict: "LIKELY_ELIGIBLE" | "CHECK_CRITERIA" | "NOT_ELIGIBLE" = "CHECK_CRITERIA";
    let eligibilityReasons: string[] = [];

    if (student && branchProfile) {
      const minCgpa = branchProfile.minCgpa;
      const arrearsAllowed = branchProfile.arrearsAllowed ?? 0;
      const studentCgpa = student.cgpa;
      const studentArrears = student.standingArrears ?? 0;

      if (studentArrears > arrearsAllowed) {
        eligibilityVerdict = "NOT_ELIGIBLE";
        eligibilityReasons.push(`Company requires ≤ ${arrearsAllowed} standing arrears (You have: ${studentArrears})`);
      } else if (minCgpa && studentCgpa !== null && studentCgpa !== undefined) {
        if (studentCgpa >= minCgpa) {
          eligibilityVerdict = "LIKELY_ELIGIBLE";
          eligibilityReasons.push(`CGPA ${studentCgpa} meets or exceeds required cutoff ${minCgpa}`);
        } else {
          eligibilityVerdict = "NOT_ELIGIBLE";
          eligibilityReasons.push(`CGPA ${studentCgpa} is below recommended cutoff ${minCgpa}`);
        }
      } else {
        eligibilityVerdict = "CHECK_CRITERIA";
        eligibilityReasons.push("Please check specific CDC notification criteria for exact requirements.");
      }
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        website: company.website,
        hqNotes: company.hqNotes,
        historicalHiringCount: company.historicalHiringCount,
        branchTier: branchProfile?.tier || "TARGET",
        tierSource: branchProfile?.tierSource || "INFERRED",
        minCgpa: branchProfile?.minCgpa ?? null,
        arrearsAllowed: branchProfile?.arrearsAllowed ?? 0,
        eligibilityNotes: branchProfile?.eligibilityNotes || null,
        sectors: company.companySectors.map((cs) => cs.sector.name),
        roles: company.companyRoles.map((cr) => ({
          id: cr.role.id,
          title: cr.role.title,
          description: cr.role.description,
          selectionNotes: cr.selectionNotes,
          requiredSkills: cr.role.roleSkills.map((rs) => ({
            id: rs.skill.id,
            name: rs.skill.name,
            importance: rs.importance,
          })),
        })),
        skills: skillsWithStudentStatus,
        interviewQuestions: company.interviewQuestions.map((q) => ({
          id: q.id,
          topic: q.topic,
          question: q.question,
          answerGuide: q.answerGuide,
        })),
        studentTarget: targetRecord
          ? {
              status: targetRecord.status,
              notes: targetRecord.notes,
            }
          : null,
        eligibility: {
          verdict: eligibilityVerdict,
          reasons: eligibilityReasons,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}
