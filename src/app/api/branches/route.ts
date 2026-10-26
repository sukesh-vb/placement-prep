/**
 * @file src/app/api/branches/route.ts
 * @description Provides the data-driven branch list with company and student counts.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: {
            companyBranches: true,
            students: true,
            roadmapTemplates: true,
            projectTemplates: true,
          },
        },
      },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
