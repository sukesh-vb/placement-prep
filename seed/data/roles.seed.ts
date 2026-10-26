/**
 * @file seed/data/roles.seed.ts
 * @description Standardized entry-level engineering roles across campus placement drives
 */

export interface RoleSeed {
  title: string;
  description: string;
}

export const ROLES_SEED: RoleSeed[] = [
  // CS / Software
  {
    title: "Software Development Engineer (SDE)",
    description: "Builds production backend, full-stack, or frontend software systems with algorithmic rigor.",
  },
  {
    title: "Systems Engineer / Associate Developer",
    description: "Standard entry-level software development, enterprise application maintenance, and testing.",
  },
  {
    title: "Technology Analyst / Consultant",
    description: "Delivers technology solutions, business analytics, risk assessments, and software implementations.",
  },
  {
    title: "Data Analyst / BI Developer",
    description: "Extracts business insights, constructs SQL pipelines, and designs executive reporting dashboards.",
  },
  {
    title: "Machine Learning / Data Scientist",
    description: "Builds predictive statistical models, machine learning algorithms, and data processing pipelines.",
  },
  {
    title: "Security Analyst / SOC Analyst",
    description: "Monitors security events, conducts vulnerability scans, and enforces cyber defense standards.",
  },
  // ECE / Semiconductors / Embedded
  {
    title: "RTL Design & Verification Engineer",
    description: "Develops synthesizable Verilog/SystemVerilog and creates UVM testbenches for ASIC/SoC timing closure.",
  },
  {
    title: "Embedded Software & Firmware Engineer",
    description: "Writes low-level C/C++ firmware, RTOS device drivers, and microcontroller communication protocols.",
  },
  {
    title: "Hardware / CAD Solution Engineer",
    description: "Validates electronic boards, schematic design, RF/mixed-signal hardware, and EDA tool flows.",
  },
  {
    title: "Network & Solutions Engineer",
    description: "Implements telecom protocols, 5G wireless interfaces, routing, and cloud-native network stacks.",
  },
  // Mechanical / Automotive / Heavy Eng
  {
    title: "GET - Mechanical Design & CAE",
    description: "Designs mechanical components in 3D CAD, performs finite element analysis (FEA), and applies GD&T.",
  },
  {
    title: "GET - Manufacturing, Production & Quality",
    description: "Manages assembly line operations, machining processes, Lean Kaizen, and quality control systems.",
  },
  {
    title: "GET - Automotive / EV Systems",
    description: "Develops vehicle dynamics, battery thermal management, powertrain components, and chassis geometry.",
  },
  {
    title: "Operations & Maintenance Engineer",
    description: "Maintains rotating machinery (turbines, pumps, compressors) and oversees plant safety in heavy energy facilities.",
  },
  // Biotech & Chemical
  {
    title: "GET - Chemical Process Engineering",
    description: "Models unit operations in Aspen Plus/HYSYS, verifies mass & energy balances, and conducts P&ID drafting.",
  },
  {
    title: "Process Design & Piping Engineer",
    description: "Prepares PFDs/P&IDs, sizes industrial equipment, and evaluates plant capital/operating economics.",
  },
  {
    title: "Process Executive / Biotech QA-QC",
    description: "Oversees upstream/downstream bioprocessing, fermenters, chromatography, cell culture, and GMP compliance.",
  },
  {
    title: "Bioinformatics Analyst / Health Tech",
    description: "Analyzes public genomic/proteomic datasets, builds omics data pipelines in Python/R, and molecular docking.",
  },
  {
    title: "Automation & Digital Plant Engineer",
    description: "Configures PLC ladder logic, DCS systems, sensor communication loops, and industrial automation controls.",
  },
  {
    title: "Operations Manager / Supply Chain Trainee",
    description: "Directs fulfillment center operations, warehouse logistics, capacity planning, and throughput optimization.",
  },
];
