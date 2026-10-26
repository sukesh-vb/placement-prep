/**
 * @file src/app/api/auth/login/route.ts
 * @description Student authentication endpoint (email & password). Sets session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format", details: parsed.error.format() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { branch: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, student.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken(student.id, student.email);

    const response = NextResponse.json({
      success: true,
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

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
