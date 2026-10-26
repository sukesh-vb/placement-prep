/**
 * @file seed/data/interview-questions.seed.ts
 * @description Representative technical round interview questions from campus preparation guides
 */

export interface InterviewQuestionSeed {
  topic: string;
  question: string;
  answerGuide: string;
  branchCode?: string;
  companyName?: string;
  skillName?: string;
}

export const INTERVIEW_QUESTIONS_SEED: InterviewQuestionSeed[] = [
  // Programming & Coding (CSE, ECE)
  {
    topic: "Programming & coding",
    question: "Reverse a string without using a built-in reverse function.",
    answerGuide: "Use two-pointer swap approach from index 0 and length-1 until pointers cross. O(n) time, O(1) extra space.",
    branchCode: "CSE",
    skillName: "Arrays & Strings",
  },
  {
    topic: "Programming & coding",
    question: "Find two numbers in an array that add up to a target sum.",
    answerGuide: "Use a hash map to store complements: check if target - num exists in map. O(n) time, O(n) space.",
    branchCode: "CSE",
    skillName: "Stacks, Queues & Hashing",
  },
  {
    topic: "Programming & coding",
    question: "Use a stack to check whether brackets are balanced.",
    answerGuide: "Push opening brackets '({['. For closing brackets, check if stack is non-empty and matches top opening bracket, then pop.",
    branchCode: "CSE",
    skillName: "Stacks, Queues & Hashing",
  },
  {
    topic: "Programming & coding",
    question: "Find the maximum subarray sum (Kadane's Algorithm).",
    answerGuide: "Maintain currentSum = max(num, currentSum + num) and maxSum = max(maxSum, currentSum). O(n) time, O(1) space.",
    branchCode: "CSE",
    skillName: "Arrays & Strings",
  },

  // DSA
  {
    topic: "Data structures & algorithms",
    question: "Compare arrays and linked lists. When would you use each?",
    answerGuide: "Arrays provide O(1) random access by index with contiguous memory; Linked lists offer O(1) insertions/deletions at known positions without reallocating, but require O(n) traversal and extra pointer memory.",
    branchCode: "CSE",
    skillName: "Arrays & Strings",
  },
  {
    topic: "Data structures & algorithms",
    question: "Explain hash maps and how collisions can be handled.",
    answerGuide: "Hash maps map keys to array buckets via hash functions. Collisions are handled via Chaining (linked lists or balanced trees per bucket) or Open Addressing (linear/quadratic probing, double hashing).",
    branchCode: "CSE",
    skillName: "Stacks, Queues & Hashing",
  },
  {
    topic: "Data structures & algorithms",
    question: "When can dynamic programming improve a recursive solution?",
    answerGuide: "When the problem exhibits both Overlapping Subproblems (same subproblems computed repeatedly) and Optimal Substructure (optimal solution formed from optimal solutions to subproblems).",
    branchCode: "CSE",
    skillName: "Dynamic Programming & Recursion",
  },

  // OOP
  {
    topic: "OOP & language fundamentals",
    question: "Explain encapsulation, abstraction, inheritance, and polymorphism with real examples.",
    answerGuide: "Encapsulation: bundling data and methods with private access. Abstraction: exposing only essential features via interfaces. Inheritance: child classes reusing parent logic. Polymorphism: method overriding (runtime) and overloading (compile-time).",
    branchCode: "CSE",
    skillName: "Object-Oriented Programming (OOP)",
  },
  {
    topic: "OOP & language fundamentals",
    question: "Differentiate method overloading and method overriding.",
    answerGuide: "Overloading: same method name, different parameter types/counts within the same class (compile-time polymorphism). Overriding: child class provides specific implementation of parent method with identical signature (runtime polymorphism).",
    branchCode: "CSE",
    skillName: "Object-Oriented Programming (OOP)",
  },

  // DBMS & SQL
  {
    topic: "DBMS & SQL",
    question: "Write a SQL query to find the second-highest salary in an Employee table.",
    answerGuide: "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); Or: SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;",
    branchCode: "CSE",
    skillName: "SQL & Query Optimization",
  },
  {
    topic: "DBMS & SQL",
    question: "Explain ACID properties in database transactions.",
    answerGuide: "Atomicity: all operations succeed or all fail. Consistency: database transitions from one valid state to another. Isolation: concurrent transactions execute without interfering. Durability: committed changes survive crashes.",
    branchCode: "CSE",
    skillName: "Database Management Systems (DBMS)",
  },
  {
    topic: "DBMS & SQL",
    question: "What is a database index and what are its trade-offs?",
    answerGuide: "An index is a B-Tree or Hash data structure that speeds up SELECT search queries from O(n) to O(log n). Trade-off: slows down INSERT/UPDATE/DELETE operations due to index maintenance and consumes additional storage.",
    branchCode: "CSE",
    skillName: "SQL & Query Optimization",
  },

  // OS & Networks
  {
    topic: "Operating systems & networks",
    question: "Differentiate a process and a thread.",
    answerGuide: "A process is an executing program instance with independent virtual memory space. A thread is a lightweight execution unit within a process sharing the same address space, code, and heap.",
    branchCode: "CSE",
    skillName: "Operating Systems (OS)",
  },
  {
    topic: "Operating systems & networks",
    question: "What is deadlock and what are the 4 necessary Coffman conditions?",
    answerGuide: "Deadlock is a state where processes wait indefinitely for resources held by each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
    branchCode: "CSE",
    skillName: "Operating Systems (OS)",
  },
  {
    topic: "Operating systems & networks",
    question: "Compare TCP and UDP protocols.",
    answerGuide: "TCP is connection-oriented, reliable (3-way handshake, retransmission, ordering, flow/congestion control). UDP is connectionless, fast, lightweight without reliability guarantees (ideal for streaming, gaming, VoIP).",
    branchCode: "CSE",
    skillName: "Computer Networks (CN)",
  },

  // ECE Interview Questions
  {
    topic: "Digital & VLSI Design",
    question: "What are setup time and hold time violations, and how do you fix them?",
    answerGuide: "Setup time is the minimum duration data must be stable before the active clock edge; fix by reducing combinational path delay or lowering clock frequency. Hold time is the minimum duration data must remain stable after clock edge; fix by inserting delay buffers on data path.",
    branchCode: "ECE",
    skillName: "Digital Logic Design (FSM & Timing)",
  },
  {
    topic: "Analog & Circuit Electronics",
    question: "Explain the operating regions of an N-channel MOSFET.",
    answerGuide: "Cutoff (Vgs < Vth): negligible drain current. Linear/Triode (Vgs > Vth, Vds < Vgs - Vth): behaves as voltage-controlled resistor. Saturation (Vgs > Vth, Vds >= Vgs - Vth): current independent of Vds, used for amplification.",
    branchCode: "ECE",
    skillName: "Analog Electronics & CMOS",
  },
  {
    topic: "Embedded Protocols",
    question: "How does CAN bus arbitration work without losing data?",
    answerGuide: "CAN bus uses CSMA/CD with non-destructive bitwise arbitration. Dominant bit '0' overwrites recessive bit '1'. Nodes transmitting '1' while sensing '0' drop out silently, leaving the highest-priority identifier in control.",
    branchCode: "ECE",
    skillName: "Embedded Protocols (CAN, UART, SPI, I2C)",
  },

  // Mechanical Questions
  {
    topic: "Machine Design & Manufacturing",
    question: "What is GD&T and why is it preferred over conventional plus-minus tolerancing?",
    answerGuide: "Geometric Dimensioning & Tolerancing (GD&T) defines exact feature geometry, orientation, and location relative to datums. It provides cylindrical tolerance zones which increase acceptable manufacturing allowance by 57% while ensuring mating part assembly.",
    branchCode: "MECH",
    skillName: "GD&T (Geometric Dimensioning & Tolerancing)",
  },
  {
    topic: "Thermal & Fluid Mechanics",
    question: "Explain the difference between laminar and turbulent fluid flow in a pipe.",
    answerGuide: "Laminar flow (Reynolds number Re < 2300) moves in smooth parallel layers with low fluid mixing. Turbulent flow (Re > 4000) exhibits chaotic eddies, high convective heat transfer, and increased pressure drop friction.",
    branchCode: "MECH",
    skillName: "Thermodynamics & Heat Transfer",
  },

  // Biotech & Chemical Questions
  {
    topic: "Chemical & Process Engineering",
    question: "What is the significance of the reflux ratio in distillation column design?",
    answerGuide: "Reflux ratio (L/D) is the ratio of liquid returned to the top tray versus distillate product. Higher reflux reduces required theoretical stages (stages approach minimum stages Nmin) but increases reboiler heat duty and column diameter.",
    branchCode: "CHEM",
    skillName: "Aspen Plus / HYSYS Simulation",
  },
  {
    topic: "Biotechnology & Bioprocessing",
    question: "What is kLa in bioreactors and why is it critical for aerobic cell cultures?",
    answerGuide: "kLa is the volumetric oxygen transfer coefficient measuring the rate at which dissolved oxygen transfers from gas bubbles into liquid fermentation broth. Maintaining adequate kLa prevents cell hypoxia during high-density cell growth.",
    branchCode: "BIOTECH",
    skillName: "Bioprocessing & Cell Culture",
  },
];
