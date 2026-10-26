/**
 * @file src/app/api/companies/route.ts
 * @description Advanced searchable, filterable company catalog with branch-scoped tiers,
 * sector categorization, top skills, and student target status.
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
    const tier = url.searchParams.get("tier"); // "REACH" | "TARGET" | "SAFETY" | "ALL"
    const sectorParam = url.searchParams.get("sectors"); // Comma-separated or multiple
    const search = (url.searchParams.get("search") || "").trim();
    const minHiring = parseInt(url.searchParams.get("minHiring") || "0", 10);
    const sortBy = url.searchParams.get("sort") || "hiring"; // "name" | "hiring" | "tier"
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "18", 10)));

    const branch = await prisma.branch.findUnique({
      where: { code: branchCode.toUpperCase() },
    });

    if (!branch) {
      return NextResponse.json({ error: `Branch ${branchCode} not found` }, { status: 400 });
    }

    // Build Prisma where filter
    const whereClause: any = {
      companyBranches: {
        some: {
          branchId: branch.id,
          ...(tier && tier !== "ALL" ? { tier: tier.toUpperCase() } : {}),
        },
      },
    };

    if (search) {
      whereClause.name = {
        contains: search,
      };
    }

    if (minHiring > 0) {
      whereClause.historicalHiringCount = {
        gte: minHiring,
      };
    }

    if (sectorParam) {
      const selectedSectors = sectorParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (selectedSectors.length > 0) {
        whereClause.companySectors = {
          some: {
            sector: {
              name: {
                in: selectedSectors,
              },
            },
          },
        };
      }
    }

    // Determine sorting
    let orderBy: any = [{ historicalHiringCount: "desc" }, { name: "asc" }];
    if (sortBy === "name") {
      orderBy = [{ name: "asc" }];
    } else if (sortBy === "hiring") {
      orderBy = [{ historicalHiringCount: "desc" }, { name: "asc" }];
    }

    const totalCount = await prisma.company.count({ where: whereClause });

    const rawCompanies = await prisma.company.findMany({
      where: whereClause,
      include: {
        companyBranches: {
          where: { branchId: branch.id },
        },
        companySectors: {
          include: { sector: true },
        },
        companyRoles: {
          where: { branchId: branch.id },
          include: { role: true },
        },
        companySkills: {
          where: { branchId: branch.id },
          include: { skill: true },
          orderBy: { priority: "desc" },
          take: 5,
        },
        targetStudents: student
          ? {
              where: { studentId: student.id },
            }
          : false,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // If sorting by tier, sort in-memory: REACH -> TARGET -> SAFETY
    let formattedCompanies = rawCompanies.map((c) => {
      const branchProfile = c.companyBranches[0] || null;
      const targetRecord = c.targetStudents?.[0] || null;

      // Extract top 3 skills
      const topSkills = c.companySkills.map((cs) => ({
        id: cs.skill.id,
        name: cs.skill.name,
        category: cs.skill.category,
      }));

      return {
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        website: c.website,
        hqNotes: c.hqNotes,
        historicalHiringCount: c.historicalHiringCount,
        branchTier: branchProfile?.tier || "TARGET",
        tierSource: branchProfile?.tierSource || "INFERRED",
        minCgpa: branchProfile?.minCgpa ?? null,
        arrearsAllowed: branchProfile?.arrearsAllowed ?? 0,
        eligibilityNotes: branchProfile?.eligibilityNotes || null,
        sectors: c.companySectors.map((cs) => cs.sector.name),
        roles: c.companyRoles.map((cr) => cr.role.title),
        topSkills: topSkills.slice(0, 3),
        allSkillsCount: c.companySkills.length,
        studentTarget: targetRecord
          ? {
              status: targetRecord.status,
              notes: targetRecord.notes,
            }
          : null,
      };
    });

    if (sortBy === "tier") {
      const tierRank: Record<string, number> = { REACH: 1, TARGET: 2, SAFETY: 3 };
      formattedCompanies.sort((a, b) => (tierRank[a.branchTier] || 4) - (tierRank[b.branchTier] || 4));
    }

    // Get sector list for filter pill chips
    const allSectors = await prisma.sector.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      companies: formattedCompanies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      currentBranch: {
        id: branch.id,
        code: branch.code,
        name: branch.name,
      },
      availableSectors: allSectors.map((s) => s.name),
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
