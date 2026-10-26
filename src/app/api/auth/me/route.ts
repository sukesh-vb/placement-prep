/**
 * @file src/app/api/auth/me/route.ts
 * @description Returns current authenticated student profile.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const student = await getAuthStudent(req);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        branchId: student.branchId,
        branchCode: student.branch.code,
        branchName: student.branch.name,
        currentYear: student.currentYear,
        currentSemester: student.currentSemester,
        cgpa: student.cgpa,
        standingArrears: student.standingArrears,
        targetBucketPref: student.targetBucketPref,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
