import { describe, it, expect } from "vitest";
import prisma from "../src/lib/db";
import { POST } from "../src/app/api/student/milestones/route";
import { NextRequest } from "next/server";
import { createSessionToken, AUTH_COOKIE_NAME } from "../src/lib/auth";

describe("Milestone Check-Off API Integration", () => {
  it("authenticates and marks a milestone as DONE, setting completedAt timestamp", async () => {
    // 1. Ensure test student exists
    const student = await prisma.student.findFirst({
      where: { email: "student@vit.ac.in" },
    });
    expect(student).toBeDefined();

    // 2. Fetch a milestone from DB
    const milestone = await prisma.milestone.findFirst({
      where: { branchId: student!.branchId },
    });
    expect(milestone).toBeDefined();

    // 3. Create auth session token
    const token = createSessionToken(student!.id, student!.email);

    // 4. Construct request to mark as DONE
    const req = new NextRequest("http://localhost:3000/api/student/milestones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
      body: JSON.stringify({
        milestoneId: milestone!.id,
        status: "DONE",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.progress.milestoneId).toBe(milestone!.id);
    expect(data.progress.status).toBe("DONE");
    expect(data.progress.completedAt).toBeDefined();

    // 5. Verify database persistence
    const saved = await prisma.studentMilestoneProgress.findUnique({
      where: {
        studentId_milestoneId: {
          studentId: student!.id,
          milestoneId: milestone!.id,
        },
      },
    });
    expect(saved).toBeDefined();
    expect(saved?.status).toBe("DONE");
    expect(saved?.completedAt).not.toBeNull();
  });

  it("handles countable milestones and auto-marks DONE when targetCount is reached", async () => {
    const student = await prisma.student.findFirst({
      where: { email: "student@vit.ac.in" },
    });

    // Create a temporary countable milestone
    const countableMilestone = await prisma.milestone.create({
      data: {
        branchId: student!.branchId,
        title: "Test Countable Goal",
        type: "CODING_TARGET",
        targetCount: 50,
      },
    });

    const token = createSessionToken(student!.id, student!.email);

    // Update with count = 25 (under target)
    const req1 = new NextRequest("http://localhost:3000/api/student/milestones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
      body: JSON.stringify({
        milestoneId: countableMilestone.id,
        currentCount: 25,
      }),
    });

    const res1 = await POST(req1);
    const data1 = await res1.json();
    expect(data1.progress.status).toBe("TODO");
    expect(data1.progress.currentCount).toBe(25);

    // Update with count = 50 (hits targetCount)
    const req2 = new NextRequest("http://localhost:3000/api/student/milestones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
      body: JSON.stringify({
        milestoneId: countableMilestone.id,
        currentCount: 50,
      }),
    });

    const res2 = await POST(req2);
    const data2 = await res2.json();
    expect(data2.progress.status).toBe("DONE");
    expect(data2.progress.currentCount).toBe(50);
    expect(data2.progress.completedAt).not.toBeNull();

    // Clean up test milestone
    await prisma.milestone.delete({ where: { id: countableMilestone.id } });
  });
});
