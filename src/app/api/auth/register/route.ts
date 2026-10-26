/**
 * @file src/app/api/auth/register/route.ts
 * @description Student account registration endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  branchCode: z.string().default("CSE"),
  currentYear: z.number().int().min(1).max(4).default(3),
  currentSemester: z.number().int().min(1).max(8).default(5),
  cgpa: z.number().min(0).max(10).optional(),
  standingArrears: z.number().int().min(0).optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid registration fields", details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, password, branchCode, currentYear, currentSemester, cgpa, standingArrears } = parsed.data;

    const existing = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const branch = await prisma.branch.findUnique({
      where: { code: branchCode.toUpperCase() },
    });

    if (!branch) {
      return NextResponse.json({ error: `Branch ${branchCode} not found` }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        branchId: branch.id,
        currentYear,
        currentSemester,
        cgpa,
        standingArrears,
      },
      include: { branch: true },
    });

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
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
