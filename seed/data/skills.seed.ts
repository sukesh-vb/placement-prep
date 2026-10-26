/**
 * @file seed/data/skills.seed.ts
 * @description Comprehensive skill catalog with categories and resources
 */

export interface SkillSeed {
  name: string;
  category: string;
  description: string;
  resources?: { title: string; url: string; type: string }[];
}

export const SKILLS_SEED: SkillSeed[] = [
  // Programming
  {
    name: "C++ Programming",
    category: "Programming",
    description: "Modern C++ (STL, pointers, references, memory management, templates).",
    resources: [{ title: "LearnCpp Comprehensive", url: "https://www.learncpp.com", type: "Docs" }],
  },
  {
    name: "Java Programming",
    category: "Programming",
    description: "Core Java (Collections, Streams, Multithreading, JVM memory model).",
    resources: [{ title: "Java Programming Mooc", url: "https://java-programming.mooc.fi", type: "Course" }],
  },
  {
    name: "Python Programming",
    category: "Programming",
    description: "Python 3 idiomatic syntax, data structures, scripting, and standard libraries.",
    resources: [{ title: "Official Python Tutorial", url: "https://docs.python.org/3/tutorial/", type: "Docs" }],
  },
  {
    name: "C Programming",
    category: "Programming",
    description: "Pointers, bit manipulation, structures, dynamic memory allocation, and hardware interfacing.",
  },
  {
    name: "JavaScript & TypeScript",
    category: "Programming",
    description: "Asynchronous programming, closures, ES6+, types, and modern web application logic.",
  },
  {
    name: "SQL & Query Optimization",
    category: "Database",
    description: "Complex joins, aggregations, window functions, indexing trade-offs, and subqueries.",
    resources: [{ title: "SQLBolt Interactive Lessons", url: "https://sqlbolt.com", type: "Interactive" }],
  },

  // DSA
  {
    name: "Arrays & Strings",
    category: "DSA",
    description: "Two pointers, sliding window, prefix sums, binary search on answers, string manipulation.",
  },
  {
    name: "Stacks, Queues & Hashing",
    category: "DSA",
    description: "Monotonic stack patterns, queue simulations, frequency maps, collision handling.",
  },
  {
    name: "Trees & Binary Search Trees",
    category: "DSA",
    description: "Tree traversals (inorder, preorder, postorder, level-order), BST properties, LCA.",
  },
  {
    name: "Graphs & Disjoint Sets",
    category: "DSA",
    description: "BFS/DFS, Dijkstra, topological sort, cycle detection, union-find algorithms.",
  },
  {
    name: "Dynamic Programming & Recursion",
    category: "DSA",
    description: "1D/2D memoization and tabulation, knapsack patterns, longest common subsequence.",
  },

  // Core CS
  {
    name: "Object-Oriented Programming (OOP)",
    category: "Core CS",
    description: "Encapsulation, inheritance, polymorphism, abstraction, SOLID design principles.",
  },
  {
    name: "Database Management Systems (DBMS)",
    category: "Core CS",
    description: "ACID properties, transactions, normal forms (1NF-3NF), B-Trees, primary & foreign keys.",
  },
  {
    name: "Operating Systems (OS)",
    category: "Core CS",
    description: "Processes vs threads, CPU scheduling algorithms, deadlocks, paging and virtual memory.",
  },
  {
    name: "Computer Networks (CN)",
    category: "Core CS",
    description: "OSI and TCP/IP models, TCP vs UDP, DNS, HTTP/HTTPS, IP addressing and subnetting.",
  },
  {
    name: "System Design Basics",
    category: "Core CS",
    description: "Low-level class design, APIs, caching, load balancing, relational vs NoSQL databases.",
  },

  // Web & Dev Tools
  {
    name: "Git & Version Control",
    category: "Web/Dev",
    description: "Branching workflows, rebasing, merge conflict resolution, pull request collaboration.",
  },
  {
    name: "REST APIs & Web Development",
    category: "Web/Dev",
    description: "HTTP status codes, API authentication, CRUD operations, backend service architecture.",
  },
  {
    name: "Linux Command Line & Scripting",
    category: "Web/Dev",
    description: "Shell commands, file system navigation, bash scripting, permissions, and process management.",
  },
  {
    name: "Cloud & Deployment Basics",
    category: "Web/Dev",
    description: "Basics of AWS/Azure/GCP, Docker containerization, CI/CD pipelines, and hosting.",
  },

  // Data & Analytics
  {
    name: "Statistics & Probability",
    category: "Analytics",
    description: "Hypothesis testing, distributions, Bayes theorem, expected values, regression metrics.",
  },
  {
    name: "Applied Machine Learning",
    category: "Analytics",
    description: "Supervised and unsupervised models, scikit-learn, cross-validation, feature engineering.",
  },
  {
    name: "Data Visualization (Power BI / Tableau)",
    category: "Analytics",
    description: "Building interactive dashboards, KPI metrics, DAX measures, executive reporting.",
  },

  // ECE / Semiconductors
  {
    name: "Digital Logic Design (FSM & Timing)",
    category: "Embedded & VLSI",
    description: "Boolean algebra, K-maps, finite state machines, setup & hold times, clock domain basics.",
  },
  {
    name: "Verilog / SystemVerilog RTL",
    category: "Embedded & VLSI",
    description: "Synthesizable RTL coding, always blocks, blocking vs non-blocking assignments, testbenches.",
  },
  {
    name: "ASIC Verification & UVM",
    category: "Embedded & VLSI",
    description: "Constrained-random testing, functional coverage, SystemVerilog assertions (SVA), UVM phases.",
  },
  {
    name: "Computer Architecture",
    category: "Embedded & VLSI",
    description: "Pipelining, hazard resolution, cache hierarchy, memory management, RISC principles.",
  },
  {
    name: "Analog Electronics & CMOS",
    category: "Embedded & VLSI",
    description: "Op-amps, MOSFET operation regions, current mirrors, RC circuits, small-signal models.",
  },
  {
    name: "Microcontrollers & Peripherals (ARM / STM32)",
    category: "Embedded & VLSI",
    description: "GPIO, ADC, timers, external interrupts, memory-mapped I/O, low-power modes.",
  },
  {
    name: "Real-Time Operating Systems (RTOS)",
    category: "Embedded & VLSI",
    description: "Task scheduling, semaphores, mutexes, message queues, priority inversion in FreeRTOS.",
  },
  {
    name: "Embedded Protocols (CAN, UART, SPI, I2C)",
    category: "Embedded & VLSI",
    description: "Serial communication timing, bus arbitration, frame structures, logic analyzer debugging.",
  },
  {
    name: "Wireless & 5G Fundamentals",
    category: "Embedded & VLSI",
    description: "OFDM, MIMO, cellular network architecture, modulation schemes, link budgets.",
  },

  // Mechanical
  {
    name: "Machine Design & Mechanics of Materials",
    category: "Domain-Core",
    description: "Stress-strain tensors, fatigue failure theories, shafts, bearings, gears, bolted joints.",
  },
  {
    name: "GD&T (Geometric Dimensioning & Tolerancing)",
    category: "Domain-Core",
    description: "ASME Y14.5 standards, datums, form, orientation, location, profile, runout tolerances.",
  },
  {
    name: "3D CAD Modeling (CATIA / SolidWorks / Creo)",
    category: "Simulation/CAD",
    description: "Parametric solid modeling, sheet metal, surface modeling, assembly constraints, 2D drafting.",
  },
  {
    name: "Finite Element Analysis (FEA - ANSYS)",
    category: "Simulation/CAD",
    description: "Static structural and thermal simulations, meshing quality, boundary conditions, convergence.",
  },
  {
    name: "Thermodynamics & Heat Transfer",
    category: "Domain-Core",
    description: "Power cycles (Rankine, Brayton), conduction/convection/radiation, heat exchangers, fluid flow.",
  },
  {
    name: "Manufacturing Processes & Quality",
    category: "Domain-Core",
    description: "Casting, welding, forming, CNC machining, metallurgy, heat treatment, tolerances.",
  },
  {
    name: "Lean Manufacturing & Six Sigma",
    category: "Quality & Safety",
    description: "5S, Kaizen, 7 QC tools, root cause analysis, FMEA (DFMEA/PFMEA), DMAIC methodology.",
  },
  {
    name: "EV Powertrain & Battery Thermal Management",
    category: "Domain-Core",
    description: "Battery cell chemistries, pack design, active/passive cooling, motor torque-speed curves.",
  },

  // Biotech & Chemical
  {
    name: "Bioprocessing & Cell Culture",
    category: "Domain-Core",
    description: "Upstream fermentation, bioreactor kinetics, dissolved oxygen control, mammalian cell culture.",
  },
  {
    name: "Downstream Processing & Chromatography",
    category: "Domain-Core",
    description: "Cell lysis, centrifugation, membrane filtration, HPLC, chromatography column purification.",
  },
  {
    name: "Aspen Plus / HYSYS Simulation",
    category: "Simulation/CAD",
    description: "Distillation columns, heat exchanger trains, property packages, mass and energy balance flowsheet modeling.",
  },
  {
    name: "Process Safety & HAZOP Study",
    category: "Quality & Safety",
    description: "Hazard & Operability studies, guidewords, safety interlocks, relief systems, risk matrices.",
  },
  {
    name: "Piping & Instrumentation Diagram (P&ID)",
    category: "Domain-Core",
    description: "Reading and drafting PFDs and P&IDs, instrument symbology, control loops, equipment sizing.",
  },
  {
    name: "Omics & Bioinformatics Pipelines (Python/R)",
    category: "Analytics",
    description: "RNA-seq differential expression, variant calling, Bioconductor, molecular docking with public datasets.",
  },
  {
    name: "GMP, GLP & Regulatory Compliance",
    category: "Quality & Safety",
    description: "Good Manufacturing Practices, standard operating procedures (SOPs), FDA/ICH quality validation.",
  },
  {
    name: "PLC & Industrial Automation (SCADA/DCS)",
    category: "Domain-Core",
    description: "Ladder logic programming, sensor interfacing, feedback control loops, fieldbus protocols.",
  },

  // Aptitude & Soft Skills
  {
    name: "Quantitative & Logical Aptitude",
    category: "Aptitude",
    description: "Number systems, percentages, permutations, speed-time, syllogisms, data interpretation.",
  },
  {
    name: "Communication & Technical Articulation",
    category: "Soft Skills",
    description: "Thinking aloud during problem solving, structured STAR interview storytelling, presentation.",
  },
];
