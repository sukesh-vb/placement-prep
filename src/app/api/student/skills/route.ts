/**
 * @file src/app/api/student/skills/route.ts
 * @description Manages student self-rated skill proficiencies (NOT_STARTED, LEARNING, COMFORTABLE, STRONG).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const SkillRatingSchema = z.object({
  skillId: z.string(),
  proficiency: z.enum(["NOT_STARTED", "LEARNING", "COMFORTABLE", "STRONG"]),
});

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skills = await prisma.studentSkill.findMany({
      where: { studentId: student.id },
      include: { skill: true },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Error fetching student skills:", error);
    return NextResponse.json({ error: "Failed to fetch student skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SkillRatingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid skill rating data", details: parsed.error.format() }, { status: 400 });
    }

    const { skillId, proficiency } = parsed.data;

    const record = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId,
        },
      },
      update: { proficiency },
      create: {
        studentId: student.id,
        skillId,
        proficiency,
      },
      include: { skill: true },
    });

    return NextResponse.json({ success: true, studentSkill: record });
  } catch (error) {
    console.error("Error updating skill rating:", error);
    return NextResponse.json({ error: "Failed to update skill rating" }, { status: 500 });
  }
}
