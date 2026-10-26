/**
 * @file src/app/api/skills/route.ts
 * @description Provides relational skill matrix data: Skills <-> Roles <-> Companies,
 * categorized with student proficiency ratings for interactive mapping.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    // 1. Fetch all skills
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        companySkills: {
          where: { branchId: branch.id },
          include: {
            company: {
              select: { id: true, name: true, historicalHiringCount: true },
            },
          },
        },
        roleSkills: {
          include: {
            role: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    // 2. Fetch roles for this branch
    const roles = await prisma.role.findMany({
      where: {
        companyRoles: {
          some: { branchId: branch.id },
        },
      },
      include: {
        roleSkills: {
          include: {
            skill: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        companyRoles: {
          where: { branchId: branch.id },
          include: {
            company: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    });

    // 3. Fetch companies with prioritized skills for this branch
    const companies = await prisma.company.findMany({
      where: {
        companyBranches: {
          some: { branchId: branch.id },
        },
      },
      include: {
        companyBranches: {
          where: { branchId: branch.id },
        },
        companySkills: {
          where: { branchId: branch.id },
          include: {
            skill: {
              select: { id: true, name: true, category: true },
            },
          },
          orderBy: { priority: "desc" },
        },
      },
      orderBy: [{ historicalHiringCount: "desc" }, { name: "asc" }],
    });

    // 4. Fetch student's current skill proficiencies
    const studentSkills = student
      ? await prisma.studentSkill.findMany({
          where: { studentId: student.id },
        })
      : [];

    const studentProficiencyMap: Record<string, string> = {};
    for (const ss of studentSkills) {
      studentProficiencyMap[ss.skillId] = ss.proficiency;
    }

    // Format skills with demand metrics
    const formattedSkills = skills.map((s) => {
      const companiesNeeding = s.companySkills.map((cs) => ({
        id: cs.company.id,
        name: cs.company.name,
        hiringCount: cs.company.historicalHiringCount,
        priority: cs.priority,
      }));

      const rolesNeeding = s.roleSkills.map((rs) => ({
        id: rs.role.id,
        title: rs.role.title,
        importance: rs.importance,
      }));

      return {
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description,
        resources: s.resources ? JSON.parse(s.resources) : [],
        studentProficiency: studentProficiencyMap[s.id] || "NOT_STARTED",
        companiesCount: companiesNeeding.length,
        companies: companiesNeeding,
        rolesCount: rolesNeeding.length,
        roles: rolesNeeding,
      };
    });

    // Format roles
    const formattedRoles = roles.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      companiesCount: r.companyRoles.length,
      companies: r.companyRoles.map((cr) => ({ id: cr.company.id, name: cr.company.name })),
      skills: r.roleSkills.map((rs) => ({
        id: rs.skill.id,
        name: rs.skill.name,
        category: rs.skill.category,
        importance: rs.importance,
        studentProficiency: studentProficiencyMap[rs.skill.id] || "NOT_STARTED",
      })),
    }));

    // Format companies
    const formattedCompanies = companies.map((c) => ({
      id: c.id,
      name: c.name,
      tier: c.companyBranches[0]?.tier || "TARGET",
      skills: c.companySkills.map((cs) => ({
        id: cs.skill.id,
        name: cs.skill.name,
        category: cs.skill.category,
        priority: cs.priority,
        studentProficiency: studentProficiencyMap[cs.skill.id] || "NOT_STARTED",
      })),
    }));

    // Categories list
    const categories = Array.from(new Set(skills.map((s) => s.category))).sort();

    return NextResponse.json({
      branch: {
        id: branch.id,
        code: branch.code,
        name: branch.name,
      },
      skills: formattedSkills,
      roles: formattedRoles,
      companies: formattedCompanies,
      categories,
      studentProficiencies: studentProficiencyMap,
    });
  } catch (error) {
    console.error("Error fetching skill mapping:", error);
    return NextResponse.json({ error: "Failed to fetch skill mapping" }, { status: 500 });
  }
}
