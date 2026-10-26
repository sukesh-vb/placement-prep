/**
 * @file src/app/api/student/progress/route.ts
 * @description Master progress aggregation endpoint. Calculates placement readiness %,
 * semester roadmaps, coding statistics, projects, and target pipeline metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";
import { calculatePlacementReadiness } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = student.branchId;

    // 1. Fetch roadmap templates & milestones for student's branch
    const roadmaps = await prisma.roadmapTemplate.findMany({
      where: { branchId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          include: {
            skill: { select: { id: true, name: true, category: true } },
          },
        },
      },
      orderBy: [{ year: "asc" }, { semester: "asc" }],
    });

    // 2. Fetch student's milestone progress records
    const studentMilestoneProgress = await prisma.studentMilestoneProgress.findMany({
      where: { studentId: student.id },
    });

    const milestoneProgressMap = new Map<string, { status: string; currentCount: number; completedAt: Date | null }>();
    for (const p of studentMilestoneProgress) {
      milestoneProgressMap.set(p.milestoneId, {
        status: p.status,
        currentCount: p.currentCount,
        completedAt: p.completedAt,
      });
    }

    // 3. Format roadmaps with student progress
    const formattedRoadmaps = roadmaps.map((r) => {
      const milestonesWithProgress = r.milestones.map((m) => {
        const prog = milestoneProgressMap.get(m.id);
        return {
          id: m.id,
          title: m.title,
          description: m.description,
          type: m.type,
          order: m.order,
          targetCount: m.targetCount,
          skill: m.skill,
          status: prog?.status || "TODO",
          currentCount: prog?.currentCount || 0,
          completedAt: prog?.completedAt || null,
        };
      });

      const total = milestonesWithProgress.length;
      const completed = milestonesWithProgress.filter((m) => m.status === "DONE").length;

      return {
        id: r.id,
        year: r.year,
        semester: r.semester,
        title: r.title,
        description: r.description,
        totalMilestones: total,
        completedMilestones: completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        milestones: milestonesWithProgress,
      };
    });

    // 4. Fetch coding logs
    const codingLogs = await prisma.codingProblemLog.findMany({
      where: { studentId: student.id },
      orderBy: { solvedOn: "desc" },
    });

    // Compute streak (consecutive days with at least 1 problem logged up to today)
    const uniqueDays = new Set(
      codingLogs.map((l) => new Date(l.solvedOn).toISOString().split("T")[0])
    );
    let streakDays = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDays.has(dateStr)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today hasn't been logged yet, check yesterday before breaking
        if (streakDays === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split("T")[0];
          if (uniqueDays.has(yesterdayStr)) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    // 5. Fetch project templates & student projects
    const projectTemplates = await prisma.projectTemplate.findMany({
      where: { branchId },
      orderBy: { title: "asc" },
    });

    const studentProjects = await prisma.studentProject.findMany({
      where: { studentId: student.id },
      include: { projectTemplate: true },
    });

    // 6. Fetch student skills
    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId: student.id },
      include: { skill: true },
    });

    // 7. Flatten all milestones for pure calculation utility
    const allMilestoneInputs: any[] = [];
    for (const r of formattedRoadmaps) {
      for (const m of r.milestones) {
        allMilestoneInputs.push({
          id: m.id,
          type: m.type,
          status: m.status,
          targetCount: m.targetCount,
          currentCount: m.currentCount,
          semester: r.semester,
        });
      }
    }

    // Flatten projects for calculation
    const projectInputs = studentProjects.map((p) => {
      let totalSteps = 3;
      let completedCount = 0;
      if (p.projectTemplate?.checklistSteps) {
        try {
          const steps = JSON.parse(p.projectTemplate.checklistSteps);
          totalSteps = steps.length;
        } catch {}
      }
      try {
        const completed = JSON.parse(p.stepsCompleted);
        completedCount = completed.length;
      } catch {}

      return {
        status: p.status,
        totalSteps,
        completedStepsCount: completedCount,
      };
    });

    // Calculate deterministic readiness metrics
    const readiness = calculatePlacementReadiness({
      milestones: allMilestoneInputs,
      skills: studentSkills.map((s) => ({ proficiency: s.proficiency })),
      projects: projectInputs.length > 0 ? projectInputs : projectTemplates.map(() => ({ status: "NOT_STARTED" })),
      codingLogs: codingLogs.map((l) => ({ count: l.count, difficulty: l.difficulty, topic: l.topic })),
    });

    // 8. Fetch target companies summary for dashboard
    const targetCompanies = await prisma.studentTargetCompany.findMany({
      where: { studentId: student.id },
      include: {
        company: {
          select: { id: true, name: true, historicalHiringCount: true },
        },
      },
    });

    return NextResponse.json({
      readiness,
      streakDays,
      roadmaps: formattedRoadmaps,
      codingLogs: codingLogs.slice(0, 15),
      projectTemplates: projectTemplates.map((pt) => ({
        id: pt.id,
        title: pt.title,
        description: pt.description,
        techSkills: pt.techSkills,
        checklistSteps: JSON.parse(pt.checklistSteps),
      })),
      studentProjects: studentProjects.map((sp) => ({
        id: sp.id,
        projectTemplateId: sp.projectTemplateId,
        title: sp.title,
        status: sp.status,
        repoLink: sp.repoLink,
        demoLink: sp.demoLink,
        stepsCompleted: JSON.parse(sp.stepsCompleted),
        template: sp.projectTemplate
          ? {
              title: sp.projectTemplate.title,
              steps: JSON.parse(sp.projectTemplate.checklistSteps),
            }
          : null,
      })),
      targetSummary: {
        total: targetCompanies.length,
        byStatus: {
          SAVED: targetCompanies.filter((t) => t.status === "SAVED").length,
          PREPARING: targetCompanies.filter((t) => t.status === "PREPARING").length,
          APPLIED: targetCompanies.filter((t) => t.status === "APPLIED").length,
          INTERVIEWING: targetCompanies.filter((t) => t.status === "INTERVIEWING").length,
          OFFER: targetCompanies.filter((t) => t.status === "OFFER").length,
          REJECTED: targetCompanies.filter((t) => t.status === "REJECTED").length,
        },
        targets: targetCompanies.map((t) => ({
          companyId: t.companyId,
          companyName: t.company.name,
          status: t.status,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch student progress" }, { status: 500 });
  }
}
