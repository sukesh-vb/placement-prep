/**
 * @file seed/seed.ts
 * @description Master idempotent seeding pipeline for PlacementPrep database.
 * Run via: npm run seed
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { BRANCHES_SEED } from "./data/branches.seed";
import { SECTORS_SEED } from "./data/sectors.seed";
import { ROLES_SEED } from "./data/roles.seed";
import { SKILLS_SEED } from "./data/skills.seed";
import { COMPANIES_SEED } from "./data/companies.seed";
import { ROADMAPS_SEED } from "./data/roadmaps.seed";
import { PROJECTS_SEED } from "./data/projects.seed";
import { INTERVIEW_QUESTIONS_SEED } from "./data/interview-questions.seed";
import { normalizeCompanyName, deduplicateCompanies } from "./normalizer";

const prisma = new PrismaClient();

async function main() {
  console.log("================================================================================");
  console.log("🚀 Starting PlacementPrep Idempotent Database Seed Pipeline");
  console.log("================================================================================\n");

  const startTime = Date.now();
  const summary = {
    branches: 0,
    sectors: 0,
    roles: 0,
    skills: 0,
    companies: 0,
    companyBranches: 0,
    companySectors: 0,
    companyRoles: 0,
    companySkills: 0,
    roadmapTemplates: 0,
    milestones: 0,
    projectTemplates: 0,
    interviewQuestions: 0,
    demoStudents: 0,
    explicitTiers: 0,
    inferredTiers: 0,
    mergedDuplicates: [] as string[],
    ambiguousMerges: [] as string[],
  };

  // 1. Seed Branches
  console.log("📦 Seeding Branches...");
  const branchMap = new Map<string, string>(); // code -> id
  for (const b of BRANCHES_SEED) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description },
      create: { code: b.code, name: b.name, description: b.description },
    });
    branchMap.set(b.code, branch.id);
    summary.branches++;
  }
  console.log(`   ✓ ${summary.branches} branches synchronized.`);

  // 2. Seed Sectors
  console.log("📦 Seeding Sectors...");
  const sectorMap = new Map<string, string>(); // name -> id
  for (const s of SECTORS_SEED) {
    const sector = await prisma.sector.upsert({
      where: { name: s.name },
      update: { description: s.description },
      create: { name: s.name, description: s.description },
    });
    sectorMap.set(s.name, sector.id);
    summary.sectors++;
  }
  console.log(`   ✓ ${summary.sectors} sectors synchronized.`);

  // 3. Seed Roles
  console.log("📦 Seeding Roles...");
  const roleMap = new Map<string, string>(); // title -> id
  for (const r of ROLES_SEED) {
    const role = await prisma.role.upsert({
      where: { title: r.title },
      update: { description: r.description },
      create: { title: r.title, description: r.description },
    });
    roleMap.set(r.title, role.id);
    summary.roles++;
  }
  console.log(`   ✓ ${summary.roles} roles synchronized.`);

  // 4. Seed Skills
  console.log("📦 Seeding Skills...");
  const skillMap = new Map<string, string>(); // name -> id
  for (const sk of SKILLS_SEED) {
    const resourcesJson = sk.resources ? JSON.stringify(sk.resources) : null;
    const skill = await prisma.skill.upsert({
      where: { name: sk.name },
      update: {
        category: sk.category,
        description: sk.description,
        resources: resourcesJson,
      },
      create: {
        name: sk.name,
        category: sk.category,
        description: sk.description,
        resources: resourcesJson,
      },
    });
    skillMap.set(sk.name, skill.id);
    summary.skills++;
  }
  console.log(`   ✓ ${summary.skills} skills synchronized.`);

  // 5. Seed Companies & M2M Associations
  console.log("📦 Seeding Companies & Associations (cleaning, deduplication, tier checks)...");
  const { deduped: dedupedCompanies, report: dedupeReport } = deduplicateCompanies(COMPANIES_SEED);
  summary.mergedDuplicates.push(...dedupeReport.merged);

  for (const rawCompany of dedupedCompanies) {
    const normalized = normalizeCompanyName(rawCompany.name);
    if (normalized.isAmbiguousMerge && normalized.ambiguityNote) {
      summary.ambiguousMerges.push(normalized.ambiguityNote);
    }

    const company = await prisma.company.upsert({
      where: { name: normalized.name },
      update: {
        website: rawCompany.website,
        hqNotes: rawCompany.hqNotes,
        historicalHiringCount: rawCompany.historicalHiringCount ?? normalized.count ?? null,
      },
      create: {
        name: normalized.name,
        website: rawCompany.website,
        hqNotes: rawCompany.hqNotes,
        historicalHiringCount: rawCompany.historicalHiringCount ?? normalized.count ?? null,
      },
    });
    summary.companies++;

    // Company <-> Sectors
    for (const secName of rawCompany.sectors) {
      const sectorId = sectorMap.get(secName);
      if (sectorId) {
        await prisma.companySector.upsert({
          where: {
            companyId_sectorId: {
              companyId: company.id,
              sectorId,
            },
          },
          update: {},
          create: {
            companyId: company.id,
            sectorId,
          },
        });
        summary.companySectors++;
      }
    }

    // Company <-> Branch Profiles
    for (const bp of rawCompany.branchProfiles) {
      const branchId = branchMap.get(bp.branchCode);
      if (!branchId) continue;

      if (bp.tierSource === "EXPLICIT") summary.explicitTiers++;
      else summary.inferredTiers++;

      await prisma.companyBranch.upsert({
        where: {
          companyId_branchId: {
            companyId: company.id,
            branchId,
          },
        },
        update: {
          tier: bp.tier,
          tierSource: bp.tierSource,
          eligibilityNotes: bp.eligibilityNotes,
          minCgpa: bp.minCgpa,
          arrearsAllowed: bp.arrearsAllowed ?? 0,
        },
        create: {
          companyId: company.id,
          branchId,
          tier: bp.tier,
          tierSource: bp.tierSource,
          eligibilityNotes: bp.eligibilityNotes,
          minCgpa: bp.minCgpa,
          arrearsAllowed: bp.arrearsAllowed ?? 0,
        },
      });
      summary.companyBranches++;

      // Company <-> Roles for this branch
      if (bp.roles) {
        for (const roleTitle of bp.roles) {
          const roleId = roleMap.get(roleTitle);
          if (roleId) {
            await prisma.companyRole.upsert({
              where: {
                companyId_roleId_branchId: {
                  companyId: company.id,
                  roleId,
                  branchId,
                },
              },
              update: { selectionNotes: bp.eligibilityNotes },
              create: {
                companyId: company.id,
                roleId,
                branchId,
                selectionNotes: bp.eligibilityNotes,
              },
            });
            summary.companyRoles++;
          }
        }
      }

      // Company <-> Prioritized Skills for this branch
      if (bp.prioritizedSkills) {
        for (const skillName of bp.prioritizedSkills) {
          const skillId = skillMap.get(skillName);
          if (skillId) {
            await prisma.companySkill.upsert({
              where: {
                companyId_skillId_branchId: {
                  companyId: company.id,
                  skillId,
                  branchId,
                },
              },
              update: { priority: "HIGH" },
              create: {
                companyId: company.id,
                skillId,
                branchId,
                priority: "HIGH",
              },
            });
            summary.companySkills++;
          }
        }
      }
    }
  }
  console.log(`   ✓ ${summary.companies} companies and associations synchronized.`);

  // 6. Seed Roadmaps and Milestones
  console.log("📦 Seeding Roadmaps & Milestones...");
  for (const r of ROADMAPS_SEED) {
    const branchId = branchMap.get(r.branchCode);
    if (!branchId) continue;

    const roadmap = await prisma.roadmapTemplate.upsert({
      where: {
        branchId_year_semester: {
          branchId,
          year: r.year,
          semester: r.semester,
        },
      },
      update: {
        title: r.title,
        description: r.description,
      },
      create: {
        branchId,
        year: r.year,
        semester: r.semester,
        title: r.title,
        description: r.description,
      },
    });
    summary.roadmapTemplates++;

    for (const m of r.milestones) {
      const skillId = m.skillName ? skillMap.get(m.skillName) ?? null : null;
      // We identify milestone by roadmapTemplateId + title
      const existing = await prisma.milestone.findFirst({
        where: {
          roadmapTemplateId: roadmap.id,
          title: m.title,
        },
      });

      if (existing) {
        await prisma.milestone.update({
          where: { id: existing.id },
          data: {
            description: m.description,
            order: m.order,
            type: m.type,
            targetCount: m.targetCount ?? null,
            skillId,
          },
        });
      } else {
        await prisma.milestone.create({
          data: {
            roadmapTemplateId: roadmap.id,
            branchId,
            title: m.title,
            description: m.description,
            order: m.order,
            type: m.type,
            targetCount: m.targetCount ?? null,
            skillId,
          },
        });
      }
      summary.milestones++;
    }
  }
  console.log(`   ✓ ${summary.roadmapTemplates} roadmap semesters with ${summary.milestones} milestones synchronized.`);

  // 7. Seed Project Templates
  console.log("📦 Seeding High-Impact Project Templates...");
  for (const pt of PROJECTS_SEED) {
    const branchId = branchMap.get(pt.branchCode);
    if (!branchId) continue;

    const existing = await prisma.projectTemplate.findFirst({
      where: {
        branchId,
        title: pt.title,
      },
    });

    const stepsJson = JSON.stringify(pt.checklistSteps);

    if (existing) {
      await prisma.projectTemplate.update({
        where: { id: existing.id },
        data: {
          description: pt.description,
          techSkills: pt.techSkills,
          checklistSteps: stepsJson,
        },
      });
    } else {
      await prisma.projectTemplate.create({
        data: {
          branchId,
          title: pt.title,
          description: pt.description,
          techSkills: pt.techSkills,
          checklistSteps: stepsJson,
        },
      });
    }
    summary.projectTemplates++;
  }
  console.log(`   ✓ ${summary.projectTemplates} project templates synchronized.`);

  // 8. Seed Sample Interview Questions
  console.log("📦 Seeding Sample Interview Questions...");
  for (const iq of INTERVIEW_QUESTIONS_SEED) {
    const branchId = iq.branchCode ? branchMap.get(iq.branchCode) ?? null : null;
    const skillId = iq.skillName ? skillMap.get(iq.skillName) ?? null : null;

    const existing = await prisma.interviewQuestion.findFirst({
      where: {
        question: iq.question,
      },
    });

    if (existing) {
      await prisma.interviewQuestion.update({
        where: { id: existing.id },
        data: {
          topic: iq.topic,
          answerGuide: iq.answerGuide,
          branchId,
          skillId,
        },
      });
    } else {
      await prisma.interviewQuestion.create({
        data: {
          topic: iq.topic,
          question: iq.question,
          answerGuide: iq.answerGuide,
          branchId,
          skillId,
        },
      });
    }
    summary.interviewQuestions++;
  }
  console.log(`   ✓ ${summary.interviewQuestions} interview questions synchronized.`);

  // 9. Seed Demo Student
  console.log("📦 Seeding Demo Student Account (student@vit.ac.in)...");
  const cseBranchId = branchMap.get("CSE");
  if (cseBranchId) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const demoStudent = await prisma.student.upsert({
      where: { email: "student@vit.ac.in" },
      update: {
        name: "Arjun Sharma",
        branchId: cseBranchId,
        currentYear: 3,
        currentSemester: 6,
        cgpa: 8.42,
        standingArrears: 0,
        targetBucketPref: "BALANCED",
      },
      create: {
        email: "student@vit.ac.in",
        name: "Arjun Sharma",
        passwordHash: hashedPassword,
        branchId: cseBranchId,
        currentYear: 3,
        currentSemester: 6,
        cgpa: 8.42,
        standingArrears: 0,
        targetBucketPref: "BALANCED",
      },
    });
    summary.demoStudents++;

    // Seed student target companies
    const targetCompanies = ["Amazon", "Microsoft", "TCS", "Cognizant", "JPMorgan Chase"];
    for (const compName of targetCompanies) {
      const comp = await prisma.company.findUnique({ where: { name: compName } });
      if (comp) {
        await prisma.studentTargetCompany.upsert({
          where: {
            studentId_companyId: {
              studentId: demoStudent.id,
              companyId: comp.id,
            },
          },
          update: {},
          create: {
            studentId: demoStudent.id,
            companyId: comp.id,
            status: compName === "TCS" ? "APPLIED" : compName === "Amazon" ? "PREPARING" : "SAVED",
            notes: `Targeting placement drive with focus on technical assessments.`,
          },
        });
      }
    }

    // Seed student sample skills
    const sampleSkills = [
      { name: "C++ Programming", level: "STRONG" },
      { name: "Arrays & Strings", level: "COMFORTABLE" },
      { name: "SQL & Query Optimization", level: "LEARNING" },
      { name: "Dynamic Programming & Recursion", level: "NOT_STARTED" },
    ];
    for (const s of sampleSkills) {
      const sk = await prisma.skill.findUnique({ where: { name: s.name } });
      if (sk) {
        await prisma.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: demoStudent.id,
              skillId: sk.id,
            },
          },
          update: { proficiency: s.level },
          create: {
            studentId: demoStudent.id,
            skillId: sk.id,
            proficiency: s.level,
          },
        });
      }
    }

    // Seed a couple coding problem logs
    const logsCount = await prisma.codingProblemLog.count({ where: { studentId: demoStudent.id } });
    if (logsCount === 0) {
      await prisma.codingProblemLog.createMany({
        data: [
          { studentId: demoStudent.id, topic: "Arrays", difficulty: "EASY", platform: "LeetCode", count: 18 },
          { studentId: demoStudent.id, topic: "Strings", difficulty: "EASY", platform: "LeetCode", count: 14 },
          { studentId: demoStudent.id, topic: "Trees", difficulty: "MEDIUM", platform: "LeetCode", count: 8 },
          { studentId: demoStudent.id, topic: "SQL", difficulty: "MEDIUM", platform: "HackerRank", count: 12 },
        ],
      });
    }

    // Seed a project instance
    const projTemplate = await prisma.projectTemplate.findFirst({ where: { branchId: cseBranchId } });
    if (projTemplate) {
      await prisma.studentProject.upsert({
        where: { id: "demo-project-1" },
        update: {},
        create: {
          id: "demo-project-1",
          studentId: demoStudent.id,
          projectTemplateId: projTemplate.id,
          title: "PlacementPrep Web App",
          status: "IN_PROGRESS",
          repoLink: "https://github.com/vit-student/placement-prep",
          stepsCompleted: JSON.stringify([0, 1]),
        },
      });
    }
  }

  const durationMs = Date.now() - startTime;

  console.log("\n================================================================================");
  console.log("📊 PLACEMENTPREP DATABASE SEED SUMMARY REPORT");
  console.log("================================================================================");
  console.log(`Execution Time:          ${durationMs}ms`);
  console.log(`Branches:                ${summary.branches}`);
  console.log(`Sectors:                 ${summary.sectors}`);
  console.log(`Roles:                   ${summary.roles}`);
  console.log(`Skills:                  ${summary.skills}`);
  console.log(`Companies:               ${summary.companies}`);
  console.log(`Company-Branch Profiles: ${summary.companyBranches} (Explicit: ${summary.explicitTiers}, Inferred: ${summary.inferredTiers})`);
  console.log(`Company-Sector Mappings: ${summary.companySectors}`);
  console.log(`Company-Role Mappings:   ${summary.companyRoles}`);
  console.log(`Company-Skill Mappings:  ${summary.companySkills}`);
  console.log(`Roadmap Semesters:       ${summary.roadmapTemplates}`);
  console.log(`Milestones:              ${summary.milestones}`);
  console.log(`Project Templates:       ${summary.projectTemplates}`);
  console.log(`Interview Questions:     ${summary.interviewQuestions}`);
  console.log(`Demo Student Accounts:   ${summary.demoStudents} (login: student@vit.ac.in / password123)`);

  if (summary.mergedDuplicates.length > 0) {
    console.log("\n⚠️ Deduplicated / Merged Rows:");
    for (const msg of summary.mergedDuplicates) {
      console.log(`   - ${msg}`);
    }
  }

  if (summary.ambiguousMerges.length > 0) {
    console.log("\n🔍 Ambiguous Corporate Entities Checked & Preserved Distinct:");
    const uniqueAmbiguous = Array.from(new Set(summary.ambiguousMerges));
    for (const msg of uniqueAmbiguous) {
      console.log(`   - ${msg}`);
    }
  }

  console.log("================================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed pipeline failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
