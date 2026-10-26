/**
 * @file seed/data/roadmaps.seed.ts
 * @description Semester-by-semester roadmaps, milestones, and preparation timelines across engineering branches
 */

export interface MilestoneSeed {
  type: "CHECKLIST_ITEM" | "PROJECT" | "CODING_TARGET" | "CERTIFICATION" | "EXAM_PREP";
  title: string;
  description: string;
  order: number;
  targetCount?: number;
  skillName?: string;
}

export interface RoadmapTemplateSeed {
  branchCode: string;
  year: number;
  semester: number;
  title: string;
  description: string;
  milestones: MilestoneSeed[];
}

export const ROADMAPS_SEED: RoadmapTemplateSeed[] = [
  // ---------------------------------------------------------------------------
  // CSE ROADMAP (YEARS 1 - 4)
  // ---------------------------------------------------------------------------
  {
    branchCode: "CSE",
    year: 1,
    semester: 1,
    title: "Programming Foundations & Problem-Solving Habits",
    description: "Build deep comfort in one primary language (C++ or Java) and start regular coding habits.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master primary language syntax & memory model",
        description: "Study pointers/references, functions, loops, and basic memory management.",
        order: 1,
        skillName: "C++ Programming",
      },
      {
        type: "CODING_TARGET",
        title: "Solve 50 beginner coding problems",
        description: "Solve basic loop, pattern, math, and conditional problems on a coding platform.",
        order: 2,
        targetCount: 50,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Maintain CGPA safely above 8.5 target",
        description: "Keep academics strong early to meet high-tier placement cutoffs.",
        order: 3,
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 1,
    semester: 2,
    title: "Linear Data Structures & Discrete Math",
    description: "Transition from basic syntax to standard linear structures and mathematical fundamentals.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Learn Arrays, Strings & Prefix Sums",
        description: "Master two-pointer techniques, sliding window patterns, and string parsing.",
        order: 1,
        skillName: "Arrays & Strings",
      },
      {
        type: "CODING_TARGET",
        title: "Solve 100 array and string problems",
        description: "Progress through easy-to-medium array manipulations.",
        order: 2,
        targetCount: 100,
      },
      {
        type: "PROJECT",
        title: "Build and deploy 1st small GitHub project",
        description: "Create a CLI tool or simple utility, push with clean Git commits and README.",
        order: 3,
        skillName: "Git & Version Control",
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 2,
    semester: 3,
    title: "Non-Linear Structures & Object-Oriented Design",
    description: "Trees, recursion, OOP principles, and hands-on relational database querying.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master OOP 4 Pillars and SOLID Principles",
        description: "Be able to model real-world domains cleanly with classes and inheritance.",
        order: 1,
        skillName: "Object-Oriented Programming (OOP)",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Master Binary Trees & BST Traversals",
        description: "Inorder, preorder, postorder, level order, LCA, and height-balanced checks.",
        order: 2,
        skillName: "Trees & Binary Search Trees",
      },
      {
        type: "CODING_TARGET",
        title: "Reach 150+ total solved DSA problems",
        description: "Consistent daily problem solving covering stacks, queues, hashing, and trees.",
        order: 3,
        targetCount: 150,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Learn SQL Queries, Joins & Normalization",
        description: "Write SELECT, JOIN, GROUP BY, aggregate, and subquery statements.",
        order: 4,
        skillName: "SQL & Query Optimization",
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 2,
    semester: 4,
    title: "Web Development, Full-Stack Architecture & Early Internships",
    description: "Deploy a production-quality full-stack web application with authentication and database.",
    milestones: [
      {
        type: "PROJECT",
        title: "Deploy a Full-Stack Web Application",
        description: "Full authentication, relational database, REST APIs, and responsive UI.",
        order: 1,
        skillName: "REST APIs & Web Development",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Apply to early mentorship programs (Google STEP / Microsoft Engage)",
        description: "Submit applications with updated resume and GitHub portfolio links.",
        order: 2,
      },
      {
        type: "CODING_TARGET",
        title: "Reach 225+ solved problems across platforms",
        description: "Introduce medium-difficulty graph and recursion problems.",
        order: 3,
        targetCount: 225,
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 3,
    semester: 5,
    title: "Advanced DSA, Operating Systems & Networks",
    description: "Deep dive into core CS fundamentals that form the backbone of technical rounds.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master Operating Systems fundamentals",
        description: "Processes vs threads, CPU scheduling, synchronization, deadlocks, paging.",
        order: 1,
        skillName: "Operating Systems (OS)",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Master Computer Networks protocols",
        description: "TCP vs UDP, DNS resolution, HTTP/HTTPS handshake, OSI layers.",
        order: 2,
        skillName: "Computer Networks (CN)",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Master Dynamic Programming patterns",
        description: "1D/2D memoization, knapsack variants, subset sum, string edits.",
        order: 3,
        skillName: "Dynamic Programming & Recursion",
      },
      {
        type: "CODING_TARGET",
        title: "Reach 300+ total solved DSA problems",
        description: "Solve competitive medium problems with strict time constraints.",
        order: 4,
        targetCount: 300,
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 3,
    semester: 6,
    title: "Summer Internship Conversion & Mock Technical Rounds",
    description: "Prepare intensely for on-campus summer internship drives aiming for PPO conversion.",
    milestones: [
      {
        type: "CERTIFICATION",
        title: "Earn recognized cloud or domain certification",
        description: "AWS Cloud Practitioner, Azure AZ-900, or NPTEL IIT course credential.",
        order: 1,
        skillName: "Cloud & Deployment Basics",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Craft 1-page ATS formatted resume",
        description: "Include measurable metrics (latency reduction, accuracy %, active users).",
        order: 2,
        skillName: "Communication & Technical Articulation",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Conduct 5 peer mock technical interviews",
        description: "Simulate live coding, thinking aloud, and project deep dives.",
        order: 3,
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 4,
    semester: 7,
    title: "Placement Season Execution & Offer Security",
    description: "Secure a baseline Safety offer early, then target high-tier Reach & Target drives.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Register on VIT CDC portal & verify eligibility",
        description: "Verify 10th/12th/CGPA data and maintain zero arrears compliance.",
        order: 1,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Prepare 5 STAR behavioural stories",
        description: "Prepare structured answers for leadership, conflict, failure, teamwork.",
        order: 2,
        skillName: "Communication & Technical Articulation",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Secure baseline Safety offer in early drives",
        description: "Clear TCS Digital, Cognizant, or Wipro to secure financial and mental peace.",
        order: 3,
      },
    ],
  },
  {
    branchCode: "CSE",
    year: 4,
    semester: 8,
    title: "Capstone & Transition to Industry",
    description: "Complete final year capstone project, conclude internship, and transition to full-time role.",
    milestones: [
      {
        type: "PROJECT",
        title: "Complete final-semester capstone project",
        description: "End-to-end scalable architecture with documentation and live demo.",
        order: 1,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Review employment bond, relocation, and onboarding terms",
        description: "Read offer letters carefully and confirm start dates.",
        order: 2,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MECHANICAL ROADMAP (YEARS 1 - 4)
  // ---------------------------------------------------------------------------
  {
    branchCode: "MECH",
    year: 1,
    semester: 1,
    title: "Engineering Mechanics & Academic Foundations",
    description: "Build strong grasp of statics, dynamics, and engineering drawing.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master free body diagrams & force resolution",
        description: "Equilibrium equations, friction, centroid, and moment of inertia.",
        order: 1,
        skillName: "Machine Design & Mechanics of Materials",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Practice daily quantitative and logical aptitude",
        description: "Aptitude decides 80% of corporate campus test shortlists.",
        order: 2,
        skillName: "Quantitative & Logical Aptitude",
      },
    ],
  },
  {
    branchCode: "MECH",
    year: 2,
    semester: 3,
    title: "3D CAD Modeling & Geometric Dimensioning (GD&T)",
    description: "Gain industry-ready CAD modeling and drafting proficiency.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Learn SolidWorks / CATIA 3D Parametric Modeling",
        description: "Part modeling, assembly constraints, bill of materials (BOM).",
        order: 1,
        skillName: "3D CAD Modeling (CATIA / SolidWorks / Creo)",
      },
      {
        type: "PROJECT",
        title: "Model a mechanical assembly with GD&T callouts",
        description: "2-stage gearbox or centrifugal pump with production drafting sheets.",
        order: 2,
        skillName: "GD&T (Geometric Dimensioning & Tolerancing)",
      },
    ],
  },
  {
    branchCode: "MECH",
    year: 3,
    semester: 5,
    title: "FEA/CFD Simulation & EV Powertrains",
    description: "Structural and thermal simulations in ANSYS and electric vehicle systems.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Learn ANSYS Static Structural & Thermal FEA",
        description: "Mesh convergence, boundary conditions, stress concentrations.",
        order: 1,
        skillName: "Finite Element Analysis (FEA - ANSYS)",
      },
      {
        type: "CERTIFICATION",
        title: "Earn Lean Six Sigma Yellow/Green Belt or CSWA",
        description: "Dassault Systèmes CSWA/CSWP or ASQ-accredited Six Sigma credential.",
        order: 2,
        skillName: "Lean Manufacturing & Six Sigma",
      },
      {
        type: "PROJECT",
        title: "EV Battery Pack Thermal Simulation Project",
        description: "Model Li-ion module thermal dissipation under rapid charging.",
        order: 3,
        skillName: "EV Powertrain & Battery Thermal Management",
      },
    ],
  },
  {
    branchCode: "MECH",
    year: 4,
    semester: 7,
    title: "Placement Drives & Core Automotive Interviews",
    description: "Interview for OEMs, Tier-1 suppliers, and engineering services.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Review shop-floor manufacturing & quality tools",
        description: "Kaizen, 5S, 7 QC tools, casting/welding defect remedies.",
        order: 1,
        skillName: "Manufacturing Processes & Quality",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Secure core or IT-services backup offer",
        description: "Interview with Tata Motors, Mahindra, L&T, or IT services.",
        order: 2,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // BIOTECH & CHEMICAL ROADMAP
  // ---------------------------------------------------------------------------
  {
    branchCode: "BIOTECH",
    year: 1,
    semester: 1,
    title: "Foundations & Academic Excellence",
    description: "Build strong CGPA (>8.5) and start Python programming for data tools.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Target CGPA above 8.5 in core sciences",
        description: "Academics open doors to top pharma and global research R&D.",
        order: 1,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Learn Python basics & NumPy/Pandas",
        description: "Computational tools bridge biology into high-paying analytics roles.",
        order: 2,
        skillName: "Python Programming",
      },
    ],
  },
  {
    branchCode: "BIOTECH",
    year: 2,
    semester: 3,
    title: "Bioprocessing & Wet-Lab Fundamentals",
    description: "Upstream cell culture, fermenters, downstream chromatography, and SQL.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master bioreactor kinetics & yield optimization",
        description: "Mass transfer coefficients, dissolved oxygen control, fermentation.",
        order: 1,
        skillName: "Bioprocessing & Cell Culture",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Learn SQL queries for health data analysis",
        description: "Joins, aggregations, and tabular patient data transformations.",
        order: 2,
        skillName: "SQL & Query Optimization",
      },
    ],
  },
  {
    branchCode: "BIOTECH",
    year: 3,
    semester: 5,
    title: "Bioinformatics Pipelines & Industry Strategy",
    description: "Analyze public omics datasets on GitHub and prepare for core pharma drives.",
    milestones: [
      {
        type: "PROJECT",
        title: "Build Omics & Bioinformatics Pipeline on GitHub",
        description: "Differential gene expression, variant calling, or molecular docking.",
        order: 1,
        skillName: "Omics & Bioinformatics Pipelines (Python/R)",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Study GMP/GLP regulations and cleanroom standards",
        description: "Pharma recruiters test strict protocol adherence and SOP documentation.",
        order: 2,
        skillName: "GMP, GLP & Regulatory Compliance",
      },
    ],
  },
  {
    branchCode: "BIOTECH",
    year: 4,
    semester: 7,
    title: "Placement Funnel Execution",
    description: "Dual-track strategy: core pharma/biotech interviews with IT/Analytics safety offer.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Secure baseline IT/analytics offer early",
        description: "Lock in TCS, Cognizant, or Deloitte offer before core season.",
        order: 1,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Interview for Biocon, Syngene, Serum Institute, Zifo",
        description: "Pitch specialized lab projects and computational pipelines.",
        order: 2,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // CHEMICAL ROADMAP
  // ---------------------------------------------------------------------------
  {
    branchCode: "CHEM",
    year: 2,
    semester: 3,
    title: "Unit Operations & Mass Transfer Fundamentals",
    description: "Distillation, heat exchangers, thermodynamics, and chemical safety.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master heat & mass transfer balance equations",
        description: "Raoult's law, McCabe-Thiele distillation methods, heat transfer coefficients.",
        order: 1,
        skillName: "Thermodynamics & Heat Transfer",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Learn P&ID and PFD drafting standards",
        description: "Instrument symbology, control loops, valve sizing, safety lines.",
        order: 2,
        skillName: "Piping & Instrumentation Diagram (P&ID)",
      },
    ],
  },
  {
    branchCode: "CHEM",
    year: 3,
    semester: 5,
    title: "Aspen Plus / HYSYS Simulation & HAZOP Studies",
    description: "Model industrial plant units and conduct formal safety audits.",
    milestones: [
      {
        type: "PROJECT",
        title: "Model a distillation column in Aspen Plus / HYSYS",
        description: "Include mass & energy balances, utility calculations, and capital cost estimate.",
        order: 1,
        skillName: "Aspen Plus / HYSYS Simulation",
      },
      {
        type: "PROJECT",
        title: "Conduct a structured plant HAZOP study",
        description: "Document safety interlocks, deviations, consequences, and mitigations.",
        order: 2,
        skillName: "Process Safety & HAZOP Study",
      },
    ],
  },
  {
    branchCode: "CHEM",
    year: 4,
    semester: 7,
    title: "Process Plant & Energy Recruitment",
    description: "Interview for Honeywell, Reliance, Shell, Ecolab, and EPC consultancies.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Secure baseline offer (TCS, Accenture) in early phase",
        description: "Provides peace of mind while waiting for selective core drives.",
        order: 1,
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Present Aspen simulation models in core technical rounds",
        description: "Defend design assumptions, thermodynamics packages, and energy savings.",
        order: 2,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // ECE ROADMAP
  // ---------------------------------------------------------------------------
  {
    branchCode: "ECE",
    year: 1,
    semester: 2,
    title: "Digital & Analog Foundations",
    description: "Boolean logic, circuit simulation, and structured C programming.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Master K-maps, FSMs, and Combinational Logic",
        description: "State diagrams, setup/hold timing margins, logic gates.",
        order: 1,
        skillName: "Digital Logic Design (FSM & Timing)",
      },
      {
        type: "CODING_TARGET",
        title: "Solve 100 C programming problems",
        description: "Pointers, bitwise operations, memory allocation, arrays.",
        order: 2,
        targetCount: 100,
        skillName: "C Programming",
      },
    ],
  },
  {
    branchCode: "ECE",
    year: 2,
    semester: 4,
    title: "Verilog RTL, Microcontrollers & Protocols",
    description: "Write synthesizable Verilog and interface sensors over SPI/I2C/CAN.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Write synthesizable Verilog RTL modules",
        description: "Always blocks, testbenches, ALU, FIFO, UART implementation.",
        order: 1,
        skillName: "Verilog / SystemVerilog RTL",
      },
      {
        type: "PROJECT",
        title: "Interface two sensors over I2C and SPI with ARM MCU",
        description: "Log sensor readings with logic analyzer verification.",
        order: 2,
        skillName: "Embedded Protocols (CAN, UART, SPI, I2C)",
      },
    ],
  },
  {
    branchCode: "ECE",
    year: 3,
    semester: 5,
    title: "VLSI Verification (UVM) & RTOS Fundamentals",
    description: "Constrained-random verification and real-time embedded multitasking.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Learn SystemVerilog UVM verification basics",
        description: "UVM testbenches, assertions, coverage metrics.",
        order: 1,
        skillName: "ASIC Verification & UVM",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Build multi-task application with FreeRTOS",
        description: "Task queues, semaphores, mutexes, priority inversion handling.",
        order: 2,
        skillName: "Real-Time Operating Systems (RTOS)",
      },
    ],
  },
  {
    branchCode: "ECE",
    year: 4,
    semester: 7,
    title: "Semiconductor & Telecom Placement Drives",
    description: "Crack technical tests for Qualcomm, Intel, TI, NVIDIA, Bosch, and TCS Digital.",
    milestones: [
      {
        type: "CHECKLIST_ITEM",
        title: "Review op-amps, MOSFET regions, and current mirrors",
        description: "Required for Texas Instruments, NXP, Cadence analog rounds.",
        order: 1,
        skillName: "Analog Electronics & CMOS",
      },
      {
        type: "CHECKLIST_ITEM",
        title: "Secure core VLSI/embedded or IT Services prime offer",
        description: "Attend Qualcomm, Samsung, Bosch, and TCS Prime campus drives.",
        order: 2,
      },
    ],
  },
];
