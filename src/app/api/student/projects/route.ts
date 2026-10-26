/**
 * @file src/app/api/student/projects/route.ts
 * @description Manages student portfolio projects and sub-step checklists.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const ProjectSaveSchema = z.object({
  id: z.string().optional(),
  projectTemplateId: z.string().optional().nullable(),
  title: z.string().min(2),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).default("NOT_STARTED"),
  repoLink: z.string().url().optional().nullable().or(z.literal("")),
  demoLink: z.string().url().optional().nullable().or(z.literal("")),
  stepsCompleted: z.array(z.number().int()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.studentProject.findMany({
      where: { studentId: student.id },
      include: { projectTemplate: true },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProjectSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid project payload", details: parsed.error.format() }, { status: 400 });
    }

    const { id, projectTemplateId, title, status, repoLink, demoLink, stepsCompleted } = parsed.data;

    let project;
    if (id) {
      project = await prisma.studentProject.update({
        where: { id },
        data: {
          title,
          status,
          repoLink: repoLink || null,
          demoLink: demoLink || null,
          stepsCompleted: JSON.stringify(stepsCompleted),
        },
      });
    } else {
      project = await prisma.studentProject.create({
        data: {
          studentId: student.id,
          projectTemplateId: projectTemplateId || null,
          title,
          status,
          repoLink: repoLink || null,
          demoLink: demoLink || null,
          stepsCompleted: JSON.stringify(stepsCompleted),
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error saving project:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
