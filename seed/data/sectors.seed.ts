/**
 * @file seed/data/sectors.seed.ts
 * @description Industry sector definitions across engineering placement domains
 */

export interface SectorSeed {
  name: string;
  description: string;
}

export const SECTORS_SEED: SectorSeed[] = [
  {
    name: "Global Product & Big Tech",
    description: "Tier-1 technology firms hiring for large-scale distributed software, cloud, and core engineering.",
  },
  {
    name: "FinTech & Banking Tech",
    description: "Investment banks, payment networks, and transactional systems requiring high reliability and algorithmic rigor.",
  },
  {
    name: "Indian Product Cos. & Startups",
    description: "Fast-moving product companies and consumer-tech unicorns operating at Indian scale.",
  },
  {
    name: "Semiconductor, Hardware & Embedded",
    description: "Chip design, ASIC verification, VLSI, and firmware engineering for silicon and device leaders.",
  },
  {
    name: "IT Services & Mass Recruiters",
    description: "High-volume recruitment powerhouses providing global technology delivery and systems integration.",
  },
  {
    name: "Data, AI/ML & Analytics",
    description: "Specialist data science, applied machine learning, predictive modeling, and analytics firms.",
  },
  {
    name: "Cyber Security & Digital Forensics",
    description: "Security operations, network defense, threat hunting, and vulnerability research.",
  },
  {
    name: "Telecom & Networking",
    description: "5G infrastructure, wireless protocols, network routing, and communication software.",
  },
  {
    name: "Management Consulting & Analytics",
    description: "Technology and management consulting firms assessing business strategy, case solving, and data insights.",
  },
  {
    name: "Healthcare, Pharma & Life-Sciences Tech",
    description: "Medical devices, clinical analytics, bioinformatics, biopharma production, and health platforms.",
  },
  {
    name: "Energy, Oil & Gas",
    description: "Upstream and downstream energy majors, refineries, petrochemical plants, and renewable energy infrastructure.",
  },
  {
    name: "Automotive, EVs & Mobility",
    description: "Vehicle OEMs, chassis/powertrain design, electric vehicle startups, and automotive electronics tier-1 suppliers.",
  },
  {
    name: "Heavy Engineering, Industrial Machinery & EPC",
    description: "Turbines, boilers, pressure vessels, plant design, piping layouts, and infrastructure construction.",
  },
  {
    name: "Aerospace, Defense & Precision Engineering",
    description: "Aircraft structures, defense electronics, missile systems, satellites, and precision machining.",
  },
  {
    name: "Chemical & Process Tech",
    description: "Specialty chemicals, polymers, catalysts, fertilizers, and process unit operations.",
  },
  {
    name: "Digital Plant & Industrial Automation",
    description: "SCADA, PLC, DCS, industrial IoT, and digital transformation for manufacturing facilities.",
  },
  {
    name: "Supply Chain, Logistics & Operations",
    description: "Warehousing, network optimization, freight logistics, and operational excellence.",
  },
];
