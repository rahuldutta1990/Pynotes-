import { Product, SiteSettings, Review, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'book-python',
    title: 'Python Simplified: Visual Handwritten Notes',
    slug: 'python-simplified-handwritten-notes',
    category: 'Python',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 18,
    isBundle: false,
    bundledProductIds: [],
    pages: 196,
    shortDescription: 'From variables to decorators & OOPs, hand-illustrated with memory layout sketches and flowcharts.',
    description: 'Master Python effortlessly through visual mental models. Every concept from fundamental syntax, data structures (lists, tuples, dicts, sets), functions, lambda, decorators, generators, to object-oriented programming is explained through clean handwritten style diagrams and intuitive handwritten side notes. Printed on high-grade 100 GSM non-bleed paper with durable twin-loop wire binding.',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '196 spiral-bound pages on 100 GSM thick paper',
      'Python 3.12+ modern syntax and idioms',
      'Visual stack and heap memory diagrams',
      'Top 75 Python interview questions with handwritten solutions',
      'Fast reference cheat sheets for built-in methods'
    ],
    hsnCode: '4901',
    sku: 'PYN-PY-01',
    rating: 4.9,
    reviewCount: 412,
    badge: 'Bestseller',
    isFeatured: true
  },
  {
    id: 'book-java',
    title: 'Java Simplified: Handwritten Core & OOPs Guide',
    slug: 'java-simplified-handwritten-guide',
    category: 'Java',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 14,
    isBundle: false,
    bundledProductIds: [],
    pages: 212,
    shortDescription: 'JVM architecture, Polymorphism, Collections Framework & Multithreading decoded visually.',
    description: 'Cracking Java interviews has never been clearer. Learn JVM internals, Garbage Collection, ClassLoader, memory areas, deep OOP principles (Inheritance, Polymorphism, Abstraction, Encapsulation), Java 8 Stream API, and Collections with hand-drawn visual flow diagrams.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '212 pages of in-depth core Java diagrams',
      'Complete Collections Framework visual hierarchy',
      'Multithreading, concurrency locks & thread lifecycle',
      'Spring Boot foundational concepts primer',
      'Durable wire-bound printed book'
    ],
    hsnCode: '4901',
    sku: 'PYN-JV-02',
    rating: 4.8,
    reviewCount: 328,
    badge: 'Hot Deal',
    isFeatured: true
  },
  {
    id: 'book-c',
    title: 'C Programming Simplified: Pointers & Memory Edition',
    slug: 'c-programming-simplified-pointers-memory',
    category: 'C/C++',
    regularPrice: 699,
    salePrice: 399,
    stockQuantity: 22,
    isBundle: false,
    bundledProductIds: [],
    pages: 160,
    shortDescription: 'Master memory allocation, double pointers, structs, and low-level bits without headache.',
    description: 'Pointers Demystified! Clear handwritten schematics that show pointer addresses, dereferencing, malloc/free heap allocation, function pointers, and structures.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '160 crisp pages dedicated to foundational C',
      'Pointers, arrays, and memory offset visual maps',
      'Bitwise manipulation cheat cards',
      'Common segfault pitfalls and debug strategies'
    ],
    hsnCode: '4901',
    sku: 'PYN-C-03',
    rating: 4.9,
    reviewCount: 265,
    badge: 'Value Pick',
    isFeatured: true
  },
  {
    id: 'book-cpp',
    title: 'C++ & STL Master Handwritten Notes',
    slug: 'cpp-stl-master-handwritten-notes',
    category: 'C/C++',
    regularPrice: 749,
    salePrice: 449,
    stockQuantity: 16,
    isBundle: false,
    bundledProductIds: [],
    pages: 184,
    shortDescription: 'Modern C++ (17/20), Standard Template Library vectors, maps, iterators, and competitive programming tips.',
    description: 'The ultimate handbook for coding tests and competitive programming. Vectors, sets, unordered_map, priority_queue, lambda functions, iterators, and time complexities visually laid out for instant recall during tests.',
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '184 pages with complete STL container guides',
      'Fast I/O & competitive programming templates',
      'Smart pointers, move semantics & RAII diagrams',
      'Big-O complexity visual charts'
    ],
    hsnCode: '4901',
    sku: 'PYN-CPP-04',
    rating: 4.8,
    reviewCount: 198,
    isFeatured: false
  },
  {
    id: 'book-dsa-py',
    title: 'DSA with Python: Handwritten Patterns & Algorithms',
    slug: 'dsa-with-python-handwritten-patterns',
    category: 'DSA',
    regularPrice: 899,
    salePrice: 549,
    stockQuantity: 12,
    isBundle: false,
    bundledProductIds: [],
    pages: 240,
    shortDescription: '15 Algorithmic Patterns (Sliding Window, Two Pointers, Trees, Graphs, DP) in clean Python.',
    description: 'Stop grinding LeetCode blindly. Learn the underlying patterns: Two Pointers, Sliding Window, Monotonic Stack, Binary Search variations, Tree Traversals, Graph BFS/DFS, Dijkstra, Dynamic Programming grids, and Backtracking illustrated step by step.',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '240 pages spanning all major FAANG interview patterns',
      'Handwritten step-by-step recursion trees',
      'Dynamic programming memoization vs tabulation tables',
      '120+ standard interview problems mapped by pattern'
    ],
    hsnCode: '4901',
    sku: 'PYN-DSAPY-05',
    rating: 5.0,
    reviewCount: 512,
    badge: 'Placement Favorite',
    isFeatured: true
  },
  {
    id: 'book-dsa-java',
    title: 'DSA with Java: Data Structures & Algorithms Visual Guide',
    slug: 'dsa-with-java-handwritten-visual-guide',
    category: 'DSA',
    regularPrice: 899,
    salePrice: 549,
    stockQuantity: 15,
    isBundle: false,
    bundledProductIds: [],
    pages: 248,
    shortDescription: 'From Linked Lists and Heaps to Advanced DP & Graphs using Java Collections Framework.',
    description: 'Designed specifically for tech placement interviews. Includes complete Java code snippets alongside handwritten execution diagrams, memory allocation for objects and arrays, and visual recursion tracing.',
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '248 pages printed on high-white 100 GSM paper',
      'Handwritten Tree & Graph visual walkthroughs',
      'Trie, Segment Tree & Disjoint Set Union (DSU) diagrams',
      'Top 100 SDE Sheet problems organized logically'
    ],
    hsnCode: '4901',
    sku: 'PYN-DSAJV-06',
    rating: 4.9,
    reviewCount: 387,
    badge: 'Popular',
    isFeatured: true
  },
  {
    id: 'book-js',
    title: 'JavaScript Simplified: Visual Engine & ES6+ Notes',
    slug: 'javascript-simplified-visual-engine-es6',
    category: 'Web Dev',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 20,
    isBundle: false,
    bundledProductIds: [],
    pages: 188,
    shortDescription: 'Event Loop, Execution Context, Closures, Promises & Async/Await explained with hand-drawn schematics.',
    description: 'Finally understand what happens under the hood in V8 engine! Call stack, Web APIs, Microtask queue, Callback queue, Scope chains, and prototypical inheritance drawn cleanly with relatable visual analogies.',
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '188 pages covering vanilla JS from fundamentals to advanced',
      'Visual Event Loop animated-style diagrams on paper',
      'DOM tree manipulation & event delegation mindmaps',
      'Async patterns, Promises, and fetch API cheat sheets'
    ],
    hsnCode: '4901',
    sku: 'PYN-JS-07',
    rating: 4.9,
    reviewCount: 294,
    isFeatured: false
  },
  {
    id: 'book-react',
    title: 'React.js & Frontend Architecture Handwritten Guide',
    slug: 'react-js-frontend-architecture-notes',
    category: 'Web Dev',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 17,
    isBundle: false,
    bundledProductIds: [],
    pages: 176,
    shortDescription: 'Virtual DOM, Fiber reconcile algorithm, React Hooks lifecycle, state management & performance.',
    description: 'Understand React rendering cycle, useState, useEffect, useMemo, useCallback, custom hooks, context API, and component composition patterns without reading 50 confusing blog posts.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '176 pages covering modern React 18/19 concepts',
      'Handwritten hook dependency rules & re-render maps',
      'Zustand & Redux state flow comparison sketches',
      'Frontend system design interview preparation'
    ],
    hsnCode: '4901',
    sku: 'PYN-RCT-08',
    rating: 4.8,
    reviewCount: 221,
    isFeatured: false
  },
  {
    id: 'book-sql',
    title: 'SQL & Database Systems Handwritten Handbook',
    slug: 'sql-database-systems-handwritten-handbook',
    category: 'Systems',
    regularPrice: 749,
    salePrice: 449,
    stockQuantity: 19,
    isBundle: false,
    bundledProductIds: [],
    pages: 170,
    shortDescription: 'ER diagrams, Joins, Indexing (B-Tree), Normalization, ACID transactions & Query optimization.',
    description: 'Visualize database internals. SQL queries paired with Venn diagrams, B-Tree index traversal flowcharts, 1NF to BCNF normalization tables, and transaction isolation levels.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '170 pages covering PostgreSQL and MySQL practical queries',
      'Visual indexing: Clustered vs Non-clustered B-Trees',
      'Window functions & Common Table Expressions (CTE) cheatsheet',
      'Top 50 database interview questions with queries'
    ],
    hsnCode: '4901',
    sku: 'PYN-SQL-09',
    rating: 4.8,
    reviewCount: 184,
    isFeatured: false
  },
  {
    id: 'book-os',
    title: 'Operating Systems & Process Scheduling Visual Notes',
    slug: 'operating-systems-process-scheduling-visual-notes',
    category: 'Systems',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 11,
    isBundle: false,
    bundledProductIds: [],
    pages: 192,
    shortDescription: 'Processes, Threads, CPU scheduling algorithms, Deadlocks, Paging, Virtual Memory & File Systems.',
    description: 'A student favorite for semester exams and gate/placement prep. Covers Process Control Blocks (PCB), round-robin & priority scheduling, Peterson algorithm, Semaphores, Mutex, Banker algorithm, Page faults, and TLB lookups in hand-drawn visual diagrams.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '192 pages tailored for university exams & SDE interviews',
      'Step-by-step Gantt charts for CPU scheduling',
      'Virtual memory translation & page replacement diagrams',
      'Summary cheat sheets at the end of every chapter'
    ],
    hsnCode: '4901',
    sku: 'PYN-OS-10',
    rating: 4.9,
    reviewCount: 310,
    isFeatured: false
  },
  {
    id: 'book-cn',
    title: 'Computer Networks & Protocols: Handwritten Architecture',
    slug: 'computer-networks-protocols-handwritten-architecture',
    category: 'Systems',
    regularPrice: 799,
    salePrice: 499,
    stockQuantity: 13,
    isBundle: false,
    bundledProductIds: [],
    pages: 180,
    shortDescription: 'OSI 7 Layers, TCP 3-Way Handshake, UDP, DNS resolution, Subnetting, HTTP/2/3, and SSL/TLS.',
    description: 'Understand every packet flow on the internet. Detailed packet headers, TCP congestion control graphs, sliding window protocol, CIDR subnetting calculations, and TLS encryption flow hand-illustrated clearly.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '180 pages covering both theoretical and practical networking',
      'TCP 3-way handshake & 4-way termination flow diagrams',
      'Subnetting shortcuts & IP routing table walkthroughs',
      'Wireshark packet analysis visual companion'
    ],
    hsnCode: '4901',
    sku: 'PYN-CN-11',
    rating: 4.8,
    reviewCount: 245,
    isFeatured: false
  },
  {
    id: 'book-system-design',
    title: 'System Design & High-Scalability Handwritten Cheatsheet',
    slug: 'system-design-high-scalability-handwritten-cheatsheet',
    category: 'Systems',
    regularPrice: 999,
    salePrice: 599,
    stockQuantity: 9,
    isBundle: false,
    bundledProductIds: [],
    pages: 208,
    shortDescription: 'HLD & LLD architectural blueprints for URL shortener, WhatsApp, Netflix, Rate limiters, and Kafka.',
    description: 'Ace your Senior & SDE-2 System Design rounds. Covers Load balancers, Consistent hashing, Caching strategies (Redis/Memcached), Message queues (Kafka/RabbitMQ), CAP Theorem, Sharding, and 12 complete end-to-end architecture blueprints.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '208 large-format pages with full-spread system architecture diagrams',
      '12 real-world case studies (TinyURL, Uber, Instagram, Twitter)',
      'Capacity estimation (QPS, Storage, Bandwidth) formula cards',
      'Trade-off matrices for databases (SQL vs NoSQL vs Graph)'
    ],
    hsnCode: '4901',
    sku: 'PYN-SD-12',
    rating: 5.0,
    reviewCount: 489,
    badge: 'Staff Pick',
    isFeatured: true
  },
  {
    id: 'book-git',
    title: 'Git & GitHub Essentials: Visual Branching & Workflows',
    slug: 'git-github-essentials-visual-branching',
    category: 'Web Dev',
    regularPrice: 599,
    salePrice: 349,
    stockQuantity: 25,
    isBundle: false,
    bundledProductIds: [],
    pages: 136,
    shortDescription: 'Git internals, HEAD pointers, rebasing vs merging, cherry-pick, stashes & conflict resolution.',
    description: 'Never fear a git merge conflict again. Visualizes commit DAG graphs, the 3 trees (Working directory, Staging area, Repository), interactive rebase, and GitHub pull request team workflows.',
    coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '136 pocket-ready spiral pages',
      'Visual guide to rebasing without losing commits',
      'Emergency cheat sheet for undoing mistakes',
      'Team GitFlow branching strategies'
    ],
    hsnCode: '4901',
    sku: 'PYN-GIT-13',
    rating: 4.7,
    reviewCount: 162,
    isFeatured: false
  },

  // SMART BUNDLES (Derive stock from component books)
  {
    id: 'bundle-py-java',
    title: 'Python + Java Duo Bundle (2 Books)',
    slug: 'python-java-duo-bundle',
    category: 'Bundles',
    regularPrice: 1598,
    salePrice: 899,
    stockQuantity: 14, // min(18, 14)
    isBundle: true,
    bundledProductIds: ['book-python', 'book-java'],
    pages: 408,
    shortDescription: 'The two powerhouse backend languages in one discounted combo. Save ₹699.',
    description: 'Get both our bestselling Python Simplified and Java Simplified handwritten books in a single box set. Master both dynamic scripting and enterprise OOP with visual clarity. Stock is automatically synced with component books.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Includes: Python Simplified (196 pgs) + Java Simplified (212 pgs)',
      'Over 400 pages of high-yield handwritten programming notes',
      'Free high-quality bookmark set included',
      'Free Express Delivery across India'
    ],
    hsnCode: '4901',
    sku: 'BNDL-PY-JV',
    rating: 4.9,
    reviewCount: 230,
    badge: 'SAVE 44%',
    isFeatured: true
  },
  {
    id: 'bundle-c-cpp-py',
    title: 'C + C++ + Python Triple Combo (3 Books)',
    slug: 'c-cpp-python-triple-combo',
    category: 'Bundles',
    regularPrice: 2247,
    salePrice: 1199,
    stockQuantity: 16, // min(22, 16, 18)
    isBundle: true,
    bundledProductIds: ['book-c', 'book-cpp', 'book-python'],
    pages: 540,
    shortDescription: 'The foundational triad: Low-level C, competitive C++ STL, and high-level Python. Save ₹1,048.',
    description: 'Everything a computer science engineer needs for core college curriculum and coding rounds. Understand memory at the hardware level with C, master competitive speed with C++, and write rapid automation scripts in Python.',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Includes: C Simplified + C++ & STL + Python Simplified',
      '540 spiral-bound pages packed with diagrams',
      'Covers from bits & memory pointers to advanced OOP',
      'Free sticker pack + bookmarks included'
    ],
    hsnCode: '4901',
    sku: 'BNDL-C-CPP-PY',
    rating: 4.9,
    reviewCount: 185,
    badge: 'SAVE 47%',
    isFeatured: true
  },
  {
    id: 'bundle-cpp-java-py',
    title: 'C++ + Java + Python Trio (3 Books)',
    slug: 'cpp-java-python-trio-bundle',
    category: 'Bundles',
    regularPrice: 2347,
    salePrice: 1299,
    stockQuantity: 14, // min(16, 14, 18)
    isBundle: true,
    bundledProductIds: ['book-cpp', 'book-java', 'book-python'],
    pages: 592,
    shortDescription: 'The big three recruitment languages for Campus Placements & Off-campus drives.',
    description: 'Whether your interview tests in C++, Java, or Python, you will be 100% prepared. High-yield comparisons showing how each language implements memory, collections, and object paradigms.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Includes: C++ & STL + Java Simplified + Python Simplified',
      '592 pages of hand-drawn diagrams and mental models',
      'Comparison cheat sheet of STL vs Java Collections vs Python Builtins',
      'Free Express Shipping'
    ],
    hsnCode: '4901',
    sku: 'BNDL-CPP-JV-PY',
    rating: 4.9,
    reviewCount: 204,
    badge: 'SAVE 45%',
    isFeatured: true
  },
  {
    id: 'bundle-all-four',
    title: 'The Core 4 Developer Pack (C, C++, Java, Python)',
    slug: 'the-core-4-developer-pack',
    category: 'Bundles',
    regularPrice: 3096,
    salePrice: 1599,
    stockQuantity: 14, // min(22, 16, 14, 18)
    isBundle: true,
    bundledProductIds: ['book-c', 'book-cpp', 'book-java', 'book-python'],
    pages: 752,
    shortDescription: 'The complete software engineering programming language library. Save ₹1,497 (48% OFF).',
    description: 'Our most comprehensive foundational bundle. All 4 major programming languages delivered in a premium branded collector box. Covers every concept tested in university exams, GATE, and tier-1 product company interviews.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Includes all 4 books: C, C++, Java, and Python',
      '752 pages on 100 GSM premium thick paper',
      'Collector box packing with free coding cheatsheet poster',
      'Highest value per rupee'
    ],
    hsnCode: '4901',
    sku: 'BNDL-CORE-4',
    rating: 5.0,
    reviewCount: 340,
    badge: 'BEST VALUE',
    isFeatured: true
  },
  {
    id: 'bundle-dsa-system-design',
    title: 'SDE Placement Mastery: DSA + System Design (3 Books)',
    slug: 'sde-placement-mastery-dsa-system-design',
    category: 'Bundles',
    regularPrice: 2797,
    salePrice: 1399,
    shortDescription: 'DSA Python + DSA Java + System Design. Everything required to clear tech rounds.',
    description: 'Designed exclusively for SDE-1 and SDE-2 interviews. Master all 15 coding patterns in both Java and Python, plus full high-level and low-level system design blueprints.',
    stockQuantity: 9, // min(12, 15, 9)
    isBundle: true,
    bundledProductIds: ['book-dsa-py', 'book-dsa-java', 'book-system-design'],
    pages: 696,
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'DSA with Python + DSA with Java + System Design',
      '696 pages covering 250+ FAANG interview problems',
      'Full architectural diagrams for 12 large systems',
      'Free Express Delivery & tracking'
    ],
    hsnCode: '4901',
    sku: 'BNDL-SDE-3',
    rating: 5.0,
    reviewCount: 290,
    badge: 'INTERVIEW PACK',
    isFeatured: true
  },
  {
    id: 'bundle-web-stack',
    title: 'Full-Stack Web Dev Trio (JS + React + SQL)',
    slug: 'full-stack-web-dev-trio',
    category: 'Bundles',
    regularPrice: 2347,
    salePrice: 1199,
    shortDescription: 'Core JavaScript + Modern React Architecture + Relational SQL. Save ₹1,148.',
    description: 'Everything to build and deploy modern web applications. From JavaScript V8 runtime and React component lifecycles to database indexing and query optimization.',
    stockQuantity: 17, // min(20, 17, 19)
    isBundle: true,
    bundledProductIds: ['book-js', 'book-react', 'book-sql'],
    pages: 534,
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    sampleImages: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'JavaScript Simplified + React.js + SQL Handbook',
      '534 pages of practical full-stack mental models',
      'Includes database schema design & React state cheatsheets',
      'Free Shipping across India'
    ],
    hsnCode: '4901',
    sku: 'BNDL-WEB-3',
    rating: 4.9,
    reviewCount: 175,
    badge: 'SAVE 49%',
    isFeatured: false
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  storeName: 'Pynotes',
  logoUrl: '',
  logoHeight: 44,
  announcements: [
    { id: '1', text: '🔥 Sitewide Sale: Flat 35% to 50% OFF on all Handwritten Notes & Smart Bundles!', highlight: 'LIMITED STOCK', active: true },
    { id: '2', text: '⚡ Extra 10% Instant Discount on all Prepaid Orders (UPI, Cards & NetBanking)', highlight: 'SAVE EXTRA 10%', active: true },
    { id: '3', text: '🏷️ Use coupon code HC10 at checkout for an extra 10% OFF your entire order!', highlight: 'CODE: HC10', active: true },
    { id: '4', text: '🚚 FREE Express Shipping across all 28 states & UTs in India. No minimum order.', highlight: 'FREE DELIVERY', active: true }
  ],
  trustTicker: [
    '🚚 Free Express Shipping across India',
    '📖 100% Handwritten Visual Notes Style',
    '✍️ Crisp Diagrams, Flowcharts & Memory Models',
    '🛡️ COD Available + 48-Hour Replacement Guarantee',
    '⭐ 4.9/5 Rating from 45,000+ Students & Engineers'
  ],
  prepaidDiscountPercent: 10,
  codFee: 49,
  freeShippingThreshold: 0,
  gstin: '07AAECP4108K1Z5',
  legalEntity: 'Pynotes Educational Media LLP',
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@pynotes.in',
  coupons: [
    { code: 'HC10', discountPercent: 10, minOrder: 0, active: true },
    { code: 'PYNOTES20', discountPercent: 20, minOrder: 1499, active: true },
    { code: 'FIRSTORDER', discountPercent: 5, minOrder: 399, active: true }
  ],
  serviceablePincodes: ['110001', '560001', '400001', '700001', '600001', '500001', '201301', '122001', '411001']
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'book-python',
    customerName: 'Aman Sharma',
    college: 'IIT Roorkee',
    role: 'Placed at Microsoft',
    rating: 5,
    comment: 'The visual memory layout of Python lists vs tuples and the handwritten recursion trees helped me clear my Microsoft technical round effortlessly. 10/10 quality paper.',
    verified: true,
    date: '2026-09-18'
  },
  {
    id: 'rev-2',
    productId: 'book-python',
    customerName: 'Priya Iyer',
    college: 'NIT Trichy',
    role: 'SDE Intern at Amazon',
    rating: 5,
    comment: 'So much better than staring at 900-page boring PDFs. The spiral binding lets it lay flat on my desk while I code. Arrived in Bangalore in just 3 days.',
    verified: true,
    date: '2026-09-22'
  },
  {
    id: 'rev-3',
    productId: 'bundle-all-four',
    customerName: 'Rohan Deshmukh',
    college: 'COEP Pune',
    role: 'Final Year CSE',
    rating: 5,
    comment: 'I bought The Core 4 Developer Pack. Worth every single rupee. C pointers and Java JVM architecture sections are gold! Great print quality.',
    verified: true,
    date: '2026-09-28'
  },
  {
    id: 'rev-4',
    productId: 'book-dsa-py',
    customerName: 'Sneha Patel',
    college: 'BITS Pilani',
    role: 'Associate SDE',
    rating: 5,
    comment: 'The 15 algorithmic patterns are drawn out with step-by-step state changes. Makes dynamic programming feel intuitive instead of intimidating.',
    verified: true,
    date: '2026-10-02'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'PYN-84219',
    customerName: 'Vikram Malhotra',
    customerEmail: 'vikram.m@gmail.com',
    customerPhone: '9811234567',
    shippingAddress: {
      fullName: 'Vikram Malhotra',
      phone: '9811234567',
      email: 'vikram.m@gmail.com',
      streetAddress: 'Flat 402, Sunshine Towers, Indiranagar',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    items: [
      {
        productId: 'bundle-py-java',
        title: 'Python + Java Duo Bundle (2 Books)',
        quantity: 1,
        unitPrice: 899,
        total: 899,
        isBundle: true,
        bundledProductIds: ['book-python', 'book-java']
      }
    ],
    subtotal: 899,
    discountAmount: 90,
    couponCode: 'HC10',
    prepaidDiscount: 81,
    shippingFee: 0,
    codFee: 0,
    totalAmount: 728,
    paymentMethod: 'prepaid',
    paymentStatus: 'paid',
    status: 'Completed or Shipped',
    codConfirmed: false,
    trackingNumber: 'SR-DEL-98421980',
    courier: 'Delhivery Express',
    trackingEvents: [
      { status: 'Order Placed', timestamp: '2026-10-04 10:15 AM', location: 'New Delhi Hub', note: 'Prepaid payment verified via Razorpay' },
      { status: 'Packed & Dispatched', timestamp: '2026-10-04 04:30 PM', location: 'Gurugram Warehouse', note: 'Handed over to Delhivery courier' },
      { status: 'In Transit', timestamp: '2026-10-05 08:20 AM', location: 'Bengaluru Central Sorting Facility', note: 'Arrived at destination hub' },
      { status: 'Out for Delivery', timestamp: '2026-10-06 09:10 AM', location: 'Indiranagar Delivery Center', note: 'Courier executive assigned' },
      { status: 'Delivered', timestamp: '2026-10-06 02:45 PM', location: 'Bengaluru', note: 'Successfully delivered to customer' }
    ],
    invoiceNumber: 'INV-2026-0891',
    createdAt: '2026-10-04T04:45:00.000Z'
  },
  {
    id: 'ord-102',
    orderNumber: 'PYN-84220',
    customerName: 'Ananya Sen',
    customerEmail: 'ananya.sen@outlook.com',
    customerPhone: '9830123456',
    shippingAddress: {
      fullName: 'Ananya Sen',
      phone: '9830123456',
      email: 'ananya.sen@outlook.com',
      streetAddress: '14/B Lake Gardens, 2nd Floor',
      landmark: 'Opposite State Bank',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700045'
    },
    items: [
      {
        productId: 'book-python',
        title: 'Python Simplified: Visual Handwritten Notes',
        quantity: 1,
        unitPrice: 499,
        total: 499,
        isBundle: false
      }
    ],
    subtotal: 499,
    discountAmount: 0,
    prepaidDiscount: 0,
    shippingFee: 0,
    codFee: 49,
    totalAmount: 548,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'Processing',
    codConfirmed: false, // on COD call list!
    trackingNumber: 'PENDING-CONFIRMATION',
    courier: 'Blue Dart',
    trackingEvents: [
      { status: 'COD Order Placed', timestamp: '2026-10-06 11:30 AM', location: 'Kolkata', note: 'Awaiting phone confirmation from staff' }
    ],
    invoiceNumber: 'INV-2026-0892',
    notes: 'COD order - Customer yet to confirm over phone',
    createdAt: '2026-10-06T06:00:00.000Z'
  },
  {
    id: 'ord-103',
    orderNumber: 'PYN-84221',
    customerName: 'Karthik Raja',
    customerEmail: 'karthik.raja@gmail.com',
    customerPhone: '9443219876',
    shippingAddress: {
      fullName: 'Karthik Raja',
      phone: '9443219876',
      email: 'karthik.raja@gmail.com',
      streetAddress: '73 Anna Salai, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032'
    },
    items: [
      {
        productId: 'bundle-all-four',
        title: 'The Core 4 Developer Pack (C, C++, Java, Python)',
        quantity: 1,
        unitPrice: 1599,
        total: 1599,
        isBundle: true,
        bundledProductIds: ['book-c', 'book-cpp', 'book-java', 'book-python']
      }
    ],
    subtotal: 1599,
    discountAmount: 160,
    couponCode: 'HC10',
    prepaidDiscount: 144,
    shippingFee: 0,
    codFee: 0,
    totalAmount: 1295,
    paymentMethod: 'prepaid',
    paymentStatus: 'paid',
    status: 'Processing',
    codConfirmed: false,
    trackingNumber: 'SR-DEL-98422019',
    courier: 'Delhivery Express',
    trackingEvents: [
      { status: 'Order Placed', timestamp: '2026-10-07 09:15 AM', location: 'Delhi Hub', note: 'Paid online via UPI' },
      { status: 'Order Ready for Packing', timestamp: '2026-10-07 11:00 AM', location: 'Gurugram Facility', note: 'Generating invoice & shipping label' }
    ],
    invoiceNumber: 'INV-2026-0893',
    createdAt: '2026-10-07T03:45:00.000Z'
  }
];
