/**
 * @file src/app/api/skills/gap/route.ts
 * @description Skill-gap evaluation endpoint. Computes missing and weak skills
 * ranked by demand frequency against student's target companies and roles.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";
import { computeSkillGap, TargetRequirement, StudentSkillRating } from "@/lib/skill-gap";

const GapRequestSchema = z.object({
  targetCompanyIds: z.array(z.string()).optional(),
  targetRoleIds: z.array(z.string()).optional(),
  branchCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    const body = await req.json().catch(() => ({}));
    const parsed = GapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.format() }, { status: 400 });
    }

    const branchCode = parsed.data.branchCode || student?.branch.code || "CSE";
    const branch = await prisma.branch.findUnique({
      where: { code: branchCode.toUpperCase() },
    });

    if (!branch) {
      return NextResponse.json({ error: `Branch ${branchCode} not found` }, { status: 400 });
    }

    // Determine target companies
    let companyIds = parsed.data.targetCompanyIds || [];

    // If no explicit companyIds provided, default to student's saved/target companies from DB
    if (companyIds.length === 0 && student) {
      const studentTargets = await prisma.studentTargetCompany.findMany({
        where: { studentId: student.id },
        select: { companyId: true },
      });
      companyIds = studentTargets.map((t) => t.companyId);
    }

    // If still empty, pick top 3 companies for the branch so student has an immediate useful view
    if (companyIds.length === 0) {
      const defaultCompanies = await prisma.company.findMany({
        where: {
          companyBranches: {
            some: { branchId: branch.id },
          },
        },
        orderBy: [{ historicalHiringCount: "desc" }, { name: "asc" }],
        take: 3,
        select: { id: true },
      });
      companyIds = defaultCompanies.map((c) => c.id);
    }

    // Fetch company skills
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      include: {
        companySkills: {
          where: { branchId: branch.id },
          include: { skill: true },
        },
      },
    });

    // Build target requirements structure
    const targetRequirements: TargetRequirement[] = companies.map((c) => ({
      companyName: c.name,
      requiredSkills: c.companySkills.map((cs) => ({
        skillId: cs.skill.id,
        skillName: cs.skill.name,
        category: cs.skill.category,
        importance: cs.priority === "HIGH" ? "MUST_HAVE" : "GOOD_TO_HAVE",
      })),
    }));

    // If specific roles were also requested
    if (parsed.data.targetRoleIds && parsed.data.targetRoleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: parsed.data.targetRoleIds } },
        include: {
          roleSkills: {
            include: { skill: true },
          },
        },
      });

      for (const r of roles) {
        targetRequirements.push({
          companyName: `Role: ${r.title}`,
          roleTitle: r.title,
          requiredSkills: r.roleSkills.map((rs) => ({
            skillId: rs.skill.id,
            skillName: rs.skill.name,
            category: rs.skill.category,
            importance: rs.importance === "MUST_HAVE" ? "MUST_HAVE" : "GOOD_TO_HAVE",
          })),
        });
      }
    }

    // Fetch student's current skill ratings
    const studentSkillRatings: StudentSkillRating[] = [];
    if (student) {
      const studentSkills = await prisma.studentSkill.findMany({
        where: { studentId: student.id },
        include: { skill: true },
      });

      for (const ss of studentSkills) {
        studentSkillRatings.push({
          skillId: ss.skillId,
          skillName: ss.skill.name,
          proficiency: ss.proficiency as any,
        });
      }
    }

    const analysis = computeSkillGap({
      targets: targetRequirements,
      studentSkills: studentSkillRatings,
    });

    return NextResponse.json({
      targetCompanies: companies.map((c) => ({ id: c.id, name: c.name })),
      analysis,
    });
  } catch (error) {
    console.error("Error computing skill gap:", error);
    return NextResponse.json({ error: "Failed to compute skill gap" }, { status: 500 });
  }
}
