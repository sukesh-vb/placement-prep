/**
 * @file seed/data/projects.seed.ts
 * @description High-impact portfolio project templates with actionable sub-steps
 */

export interface ProjectTemplateSeed {
  branchCode: string;
  title: string;
  description: string;
  techSkills: string;
  checklistSteps: string[];
}

export const PROJECTS_SEED: ProjectTemplateSeed[] = [
  // CSE
  {
    branchCode: "CSE",
    title: "Full-Stack Web Application with Auth & Relational DB",
    description: "Build and deploy a responsive web app (study planner, tracking platform, or marketplace) with authentication, database models, and REST APIs.",
    techSkills: "Next.js/React, TypeScript, Node.js, PostgreSQL/SQLite, Tailwind CSS",
    checklistSteps: [
      "Design relational database schema with foreign keys and migrations",
      "Implement secure password hashing, JWT/session authentication, and route guards",
      "Develop RESTful/Server Action CRUD endpoints with Zod input validation",
      "Create mobile-first responsive UI with optimistic updates and loading states",
      "Deploy to cloud (Vercel/Render) and document setup with architecture diagrams in README",
    ],
  },
  {
    branchCode: "CSE",
    title: "Scalable Backend Service & System Design",
    description: "Create a high-throughput backend service such as a URL shortener, distributed rate limiter, or real-time event pipeline.",
    techSkills: "Go or Java/Node.js, Redis, PostgreSQL, Docker, Git",
    checklistSteps: [
      "Define API specifications with OpenAPI/Swagger and error handling rules",
      "Implement caching layer with Redis to achieve sub-10ms response latency",
      "Design sliding-window counter or token bucket algorithm for rate limiting",
      "Benchmark throughput with load testing tool (k6 or Apache Bench)",
      "Write technical architecture document detailing scale-up trade-offs and bottleneck mitigations",
    ],
  },
  {
    branchCode: "CSE",
    title: "Applied Machine Learning & Predictive Analytics Pipeline",
    description: "Solve a real-world predictive challenge (demand forecasting, churn prediction, or NLP classification) using a public real-world dataset.",
    techSkills: "Python, Pandas, NumPy, scikit-learn, Streamlit/FastAPI",
    checklistSteps: [
      "Perform exploratory data analysis (EDA) and robust missing-value handling",
      "Engineer domain features and encode categorical variables cleanly",
      "Train and compare multiple models (Logistic, Random Forest, XGBoost) using cross-validation",
      "Evaluate precision, recall, ROC-AUC, and document failure modes",
      "Deploy an interactive web inference UI on Streamlit or Hugging Face Spaces",
    ],
  },

  // MECHANICAL
  {
    branchCode: "MECH",
    title: "CAD & GD&T Portfolio: Mechanical Assembly Modeling",
    description: "Model a complete mechanical assembly (2-stage reduction gearbox or centrifugal pump) with production-ready 2D drafting sheets and ASME Y14.5 tolerances.",
    techSkills: "SolidWorks or CATIA, AutoCAD, GD&T, Engineering Mechanics",
    checklistSteps: [
      "Model all individual gears, shafts, bearings, and casing in 3D CAD",
      "Perform assembly with proper kinematic motion constraints and clearance verification",
      "Create detailed 2D drafting sheets with datum references and GD&T feature control frames",
      "Calculate shaft stresses and fatigue safety factors based on maximum torque",
      "Compile a clean PDF design portfolio showcasing exploded views and Bill of Materials",
    ],
  },
  {
    branchCode: "MECH",
    title: "FEA Structural & Thermal Simulation in ANSYS",
    description: "Perform static structural and thermal finite element analysis on a vehicle component (ventilated brake disc or suspension control arm).",
    techSkills: "ANSYS Workbench, HyperMesh, Thermodynamics, Mechanics of Materials",
    checklistSteps: [
      "Import clean CAD geometry and apply tetrahedral/hexahedral meshing",
      "Perform mesh independence/convergence study documenting element size vs peak stress",
      "Apply realistic boundary conditions and cyclic thermal/structural loads",
      "Identify stress concentration hotspots and recommend geometry filleting remedies",
      "Generate engineering analysis report with safety factor contours and von Mises plots",
    ],
  },
  {
    branchCode: "MECH",
    title: "EV Battery Pack Thermal Management Simulation",
    description: "Model the thermal behavior and heat generation of a Lithium-ion battery module under 2C/3C rapid charge and discharge cycles.",
    techSkills: "ANSYS Fluent or MATLAB/Simulink, Heat Transfer, EV Powertrain",
    checklistSteps: [
      "Calculate heat generation rates using Joule heating and entropic reversible heat",
      "Simulate liquid cooling channel flow rate vs maximum cell temperature rise",
      "Evaluate temperature uniformity across all cylindrical/prismatic cells in the module",
      "Propose passive phase-change material (PCM) or active cooling channel optimizations",
      "Document transient thermal dissipation graphs for automotive engineering reviews",
    ],
  },

  // BIOTECHNOLOGY
  {
    branchCode: "BIOTECH",
    title: "Bioprocessing Yield Optimization & Downstream Purification",
    description: "Model microbial fermentation kinetics and downstream column chromatography for therapeutic protein yield optimization.",
    techSkills: "Bioreactor Modeling, HPLC, Downstream Chromatography, GMP Standards",
    checklistSteps: [
      "Formulate Monod growth kinetics and oxygen transfer rate (kLa) balance equations",
      "Evaluate dissolved oxygen control profiles during fed-batch fermentation",
      "Design multi-step purification protocol (centrifugation, ultrafiltration, ion-exchange HPLC)",
      "Calculate step recovery percentage and total protein purity ratio",
      "Write standard operating procedure (SOP) compliant with GMP documentation standards",
    ],
  },
  {
    branchCode: "BIOTECH",
    title: "Reproducible Omics & Bioinformatics Pipeline on GitHub",
    description: "Analyze public transcriptomic or genomic disease datasets (NCBI GEO/TCGA) using R/Python for differential expression and pathway enrichment.",
    techSkills: "R/Python, Bioconductor, DESeq2, StringDB, Git & GitHub",
    checklistSteps: [
      "Download raw RNA-seq count matrices from NCBI GEO public accession",
      "Perform quality control, normalization, and PCA dimensionality reduction",
      "Identify statistically significant differentially expressed genes (log2FC > 1.5, p-adj < 0.05)",
      "Run Gene Ontology (GO) and Reactome pathway enrichment analyses",
      "Package analysis into an open-source GitHub repository with Jupyter/RMarkdown reports",
    ],
  },

  // CHEMICAL
  {
    branchCode: "CHEM",
    title: "Aspen Plus / HYSYS Distillation Column Optimization",
    description: "Simulate and optimize a continuous multicomponent distillation column or heat exchanger train with thermodynamic property packages.",
    techSkills: "Aspen Plus / HYSYS, McCabe-Thiele, Process Economics, Thermodynamics",
    checklistSteps: [
      "Select appropriate thermodynamic fluid package (NRTL, Peng-Robinson, or UNIQUAC)",
      "Perform feed stream mass and energy balance calculations",
      "Determine minimum reflux ratio (Rmin) and optimal feed tray location",
      "Simulate heat integration with reboiler and condenser utility optimization",
      "Calculate capital and operating expenditure (CAPEX/OPEX) and potential energy savings",
    ],
  },
  {
    branchCode: "CHEM",
    title: "Plant Process Safety & HAZOP Study",
    description: "Conduct a systematic Hazard and Operability (HAZOP) study on a critical petrochemical or chemical reactor unit.",
    techSkills: "HAZOP Methodology, P&ID Drafting, Safety Interlocks, Risk Matrices",
    checklistSteps: [
      "Draft detailed P&ID flowsheet showing control loops, relief valves, and sensors",
      "Divide process into analysis nodes (Feed Tank, Reaction Vessel, Distillation)",
      "Apply guidewords (MORE, LESS, NONE, REVERSE) to process parameters (Flow, Temp, Pressure)",
      "Identify catastrophic causes (runaway exothermic reaction, cooling failure, valve jam)",
      "Specify SIL ratings, emergency trip interlocks, rupture discs, and mitigation matrices",
    ],
  },

  // ECE
  {
    branchCode: "ECE",
    title: "Synthesizable Verilog RTL Core & Self-Checking Testbench",
    description: "Design and verify a digital block (pipelined RISC-V ALU, UART transceiver, or synchronous FIFO) with timing analysis.",
    techSkills: "Verilog / SystemVerilog, ModelSim / QuestaSim, Static Timing Analysis",
    checklistSteps: [
      "Draft finite state machine (FSM) bubble diagram and state transition truth table",
      "Write synthesizable Verilog RTL following clean non-blocking assignment standards",
      "Construct directed and randomized testbenches generating stimulus vectors",
      "Simulate waveform waveforms in QuestaSim/ModelSim verifying zero timing violations",
      "Synthesize design on FPGA synthesis tool (Vivado/Quartus) and report LUT/FF utilization",
    ],
  },
  {
    branchCode: "ECE",
    title: "FreeRTOS Embedded Multi-Sensor Controller over CAN/I2C",
    description: "Develop a real-time embedded monitoring system reading I2C/SPI environmental sensors and broadcasting CAN bus frames on an ARM Cortex-M board.",
    techSkills: "Embedded C, FreeRTOS, STM32 / ARM, CAN Bus, Logic Analyzer",
    checklistSteps: [
      "Configure GPIO, I2C, SPI, and CAN peripheral registers using bare-metal/HAL drivers",
      "Spawn dedicated FreeRTOS tasks for sensor polling, telemetry computation, and transmission",
      "Implement mutexes and binary semaphores preventing shared bus arbitration deadlocks",
      "Verify CAN bus frame timing and error frames using a logic analyzer/oscilloscope",
      "Document firmware architecture, interrupt latency, and power consumption profile",
    ],
  },
];
