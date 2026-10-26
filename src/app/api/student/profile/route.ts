/**
 * @file src/app/api/student/profile/route.ts
 * @description Updates student profile attributes (branch, year, semester, cgpa, arrears, target bucket preference).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAuthStudent } from "@/lib/auth";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  branchCode: z.string().optional(),
  currentYear: z.number().int().min(1).max(4).optional(),
  currentSemester: z.number().int().min(1).max(8).optional(),
  cgpa: z.number().min(0).max(10).nullable().optional(),
  standingArrears: z.number().int().min(0).nullable().optional(),
  targetBucketPref: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data", details: parsed.error.format() }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (parsed.data.name !== undefined) dataToUpdate.name = parsed.data.name;
    if (parsed.data.currentYear !== undefined) dataToUpdate.currentYear = parsed.data.currentYear;
    if (parsed.data.currentSemester !== undefined) dataToUpdate.currentSemester = parsed.data.currentSemester;
    if (parsed.data.cgpa !== undefined) dataToUpdate.cgpa = parsed.data.cgpa;
    if (parsed.data.standingArrears !== undefined) dataToUpdate.standingArrears = parsed.data.standingArrears;
    if (parsed.data.targetBucketPref !== undefined) dataToUpdate.targetBucketPref = parsed.data.targetBucketPref;

    if (parsed.data.branchCode) {
      const branch = await prisma.branch.findUnique({
        where: { code: parsed.data.branchCode.toUpperCase() },
      });
      if (branch) {
        dataToUpdate.branchId = branch.id;
      }
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: dataToUpdate,
      include: { branch: true },
    });

    return NextResponse.json({
      success: true,
      student: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        branchId: updated.branchId,
        branchCode: updated.branch.code,
        branchName: updated.branch.name,
        currentYear: updated.currentYear,
        currentSemester: updated.currentSemester,
        cgpa: updated.cgpa,
        standingArrears: updated.standingArrears,
        targetBucketPref: updated.targetBucketPref,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
