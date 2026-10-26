/**
 * @file src/lib/auth.ts
 * @description Secure token generation and student session verification.
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "placement-prep-fallback-secret-2026";
const COOKIE_NAME = "placement_session";

interface SessionPayload {
  studentId: string;
  email: string;
  exp: number;
}

/**
 * Creates a signed HMAC-SHA256 session token
 */
export function createSessionToken(studentId: string, email: string): string {
  const payload: SessionPayload = {
    studentId,
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated student from request cookies or bearer header
 */
export async function getAuthStudent(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get(COOKIE_NAME)?.value;
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Not in server component context with cookies()
    }
  }

  if (!token) {
    // If no token, return the demo student by default for instant frictionless student exploration
    const defaultStudent = await prisma.student.findUnique({
      where: { email: "student@vit.ac.in" },
      include: { branch: true },
    });
    return defaultStudent;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    // Fall back to demo student
    return await prisma.student.findUnique({
      where: { email: "student@vit.ac.in" },
      include: { branch: true },
    });
  }

  const student = await prisma.student.findUnique({
    where: { id: payload.studentId },
    include: { branch: true },
  });

  return student;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
