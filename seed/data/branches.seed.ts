/**
 * @file seed/data/branches.seed.ts
 * @description Data-driven branch catalog for VIT Vellore engineering programs
 */

export interface BranchSeed {
  code: string;
  name: string;
  description: string;
}

export const BRANCHES_SEED: BranchSeed[] = [
  {
    code: "CSE",
    name: "Computer Science & Engineering",
    description: "Core CSE and specializations (AI/ML, Data Science, Cyber Security, Cloud, IoT, Systems).",
  },
  {
    code: "MECH",
    name: "Mechanical Engineering",
    description: "Design, thermal & fluid sciences, manufacturing, automotive, aerospace, robotics, and ER&D.",
  },
  {
    code: "BIOTECH",
    name: "Biotechnology",
    description: "Bioprocessing, pharma, bioinformatics, computational genomics, and health analytics.",
  },
  {
    code: "CHEM",
    name: "Chemical Engineering",
    description: "Process engineering, Aspen Plus simulation, petrochemicals, plant automation, and EPC.",
  },
  {
    code: "ECE",
    name: "Electronics & Communication Engineering",
    description: "Semiconductors, VLSI/EDA, embedded systems, automotive electronics, telecom & 5G networking.",
  },
];
