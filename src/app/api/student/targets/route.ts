/**
 * @file src/app/api/student/targets/route.ts
 * @description Manages student target companies and recruitment pipeline status.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const TargetStatusSchema = z.object({
  companyId: z.string(),
  status: z.enum(["SAVED", "PREPARING", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]).default("SAVED"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targets = await prisma.studentTargetCompany.findMany({
      where: { studentId: student.id },
      include: {
        company: {
          include: {
            companyBranches: {
              where: { branchId: student.branchId },
            },
            companySectors: {
              include: { sector: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedTargets = targets.map((t) => ({
      id: t.id,
      companyId: t.companyId,
      companyName: t.company.name,
      historicalHiringCount: t.company.historicalHiringCount,
      tier: t.company.companyBranches[0]?.tier || "TARGET",
      sectors: t.company.companySectors.map((cs) => cs.sector.name),
      status: t.status,
      notes: t.notes,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({ targets: formattedTargets });
  } catch (error) {
    console.error("Error fetching student targets:", error);
    return NextResponse.json({ error: "Failed to fetch student targets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TargetStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid target data", details: parsed.error.format() }, { status: 400 });
    }

    const { companyId, status, notes } = parsed.data;

    const record = await prisma.studentTargetCompany.upsert({
      where: {
        studentId_companyId: {
          studentId: student.id,
          companyId,
        },
      },
      update: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      create: {
        studentId: student.id,
        companyId,
        status,
        notes: notes || "",
      },
      include: { company: true },
    });

    return NextResponse.json({ success: true, target: record });
  } catch (error) {
    console.error("Error saving student target:", error);
    return NextResponse.json({ error: "Failed to save student target" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    if (!companyId) {
      return NextResponse.json({ error: "companyId parameter required" }, { status: 400 });
    }

    await prisma.studentTargetCompany.deleteMany({
      where: {
        studentId: student.id,
        companyId,
      },
    });

    return NextResponse.json({ success: true, message: "Target removed" });
  } catch (error) {
    console.error("Error deleting target:", error);
    return NextResponse.json({ error: "Failed to delete target" }, { status: 500 });
  }
}
