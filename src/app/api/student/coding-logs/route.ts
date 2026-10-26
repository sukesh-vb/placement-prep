/**
 * @file src/app/api/student/coding-logs/route.ts
 * @description Quick-log form endpoint for student coding problems (count, topic, difficulty, platform).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const CodingLogSchema = z.object({
  topic: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  platform: z.string().optional().default("LeetCode"),
  count: z.number().int().min(1).max(100).default(1),
  solvedOn: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.codingProblemLog.findMany({
      where: { studentId: student.id },
      orderBy: { solvedOn: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching coding logs:", error);
    return NextResponse.json({ error: "Failed to fetch coding logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CodingLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coding log", details: parsed.error.format() }, { status: 400 });
    }

    const { topic, difficulty, platform, count, solvedOn } = parsed.data;

    const log = await prisma.codingProblemLog.create({
      data: {
        studentId: student.id,
        topic,
        difficulty,
        platform,
        count,
        solvedOn: solvedOn ? new Date(solvedOn) : new Date(),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Error creating coding log:", error);
    return NextResponse.json({ error: "Failed to save coding log" }, { status: 500 });
  }
}
