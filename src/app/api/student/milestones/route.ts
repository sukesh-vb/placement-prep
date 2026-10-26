/**
 * @file src/app/api/student/milestones/route.ts
 * @description Milestone check-off and progress tracking endpoint.
 * Handles optimistic checklist updates and countable milestone steppers.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const MilestoneUpdateSchema = z.object({
  milestoneId: z.string(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  currentCount: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = MilestoneUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid milestone update payload", details: parsed.error.format() }, { status: 400 });
    }

    const { milestoneId, status, currentCount } = parsed.data;

    // Verify milestone exists
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const existingProgress = await prisma.studentMilestoneProgress.findUnique({
      where: {
        studentId_milestoneId: {
          studentId: student.id,
          milestoneId,
        },
      },
    });

    let newStatus = status ?? existingProgress?.status ?? "TODO";
    let newCount = currentCount ?? existingProgress?.currentCount ?? 0;

    // Auto-mark as DONE if countable milestone reaches or exceeds targetCount
    if (milestone.targetCount && newCount >= milestone.targetCount && !status) {
      newStatus = "DONE";
    }

    const completedAt = newStatus === "DONE" ? (existingProgress?.completedAt ?? new Date()) : null;

    const record = await prisma.studentMilestoneProgress.upsert({
      where: {
        studentId_milestoneId: {
          studentId: student.id,
          milestoneId,
        },
      },
      update: {
        status: newStatus,
        currentCount: newCount,
        completedAt,
      },
      create: {
        studentId: student.id,
        milestoneId,
        status: newStatus,
        currentCount: newCount,
        completedAt,
      },
      include: {
        milestone: true,
      },
    });

    return NextResponse.json({
      success: true,
      progress: {
        id: record.id,
        milestoneId: record.milestoneId,
        status: record.status,
        currentCount: record.currentCount,
        targetCount: record.milestone.targetCount,
        completedAt: record.completedAt,
      },
    });
  } catch (error) {
    console.error("Error updating milestone progress:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
