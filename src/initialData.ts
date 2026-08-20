import { Notebook, Section, Note, Flashcard, Quiz, StudyStats, ThemeConfig } from "./types";

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: "light-minimal",
  name: "Crisp Studio",
  isDark: false,
  accentColor: "#2563eb",
  fontStyle: "sans",
  paperPattern: "blank",
};

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: "nb-cs",
    title: "Computer Science & AI",
    icon: "Cpu",
    color: "#3b82f6",
    description: "Deep learning, transformer architectures, systems, and algorithms.",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-19T14:30:00.000Z",
  },
  {
    id: "nb-bio",
    title: "Neuroscience & Medicine",
    icon: "Dna",
    color: "#10b981",
    description: "Cellular biology, neural circuits, biochemistry, and physiology.",
    createdAt: "2026-08-12T09:00:00.000Z",
    updatedAt: "2026-08-18T18:20:00.000Z",
  },
  {
    id: "nb-econ",
    title: "Economics & Game Theory",
    icon: "TrendingUp",
    color: "#f59e0b",
    description: "Macro trends, market failures, behavioral models, and mechanism design.",
    createdAt: "2026-08-14T11:00:00.000Z",
    updatedAt: "2026-08-17T12:00:00.000Z",
  },
  {
    id: "nb-startup",
    title: "Venture Strategy & Scale",
    icon: "Rocket",
    color: "#8b5cf6",
    description: "Product-market fit, unit economics, moats, and AI startup blueprints.",
    createdAt: "2026-08-15T08:30:00.000Z",
    updatedAt: "2026-08-20T00:15:00.000Z",
  },
];

export const INITIAL_SECTIONS: Section[] = [
  // CS Sections
  {
    id: "sec-cs-ai",
    notebookId: "nb-cs",
    title: "Transformer & Attention Models",
    color: "#3b82f6",
    icon: "Brain",
    createdAt: "2026-08-10T10:05:00.000Z",
    updatedAt: "2026-08-19T14:30:00.000Z",
  },
  {
    id: "sec-cs-sys",
    notebookId: "nb-cs",
    title: "Distributed Systems & Raft",
    color: "#06b6d4",
    icon: "Server",
    createdAt: "2026-08-11T11:00:00.000Z",
    updatedAt: "2026-08-16T16:00:00.000Z",
  },
  // Bio Sections
  {
    id: "sec-bio-cell",
    notebookId: "nb-bio",
    title: "ATP Synthesis & Bioenergetics",
    color: "#10b981",
    icon: "Zap",
    createdAt: "2026-08-12T09:10:00.000Z",
    updatedAt: "2026-08-18T18:20:00.000Z",
  },
  // Econ Sections
  {
    id: "sec-econ-market",
    notebookId: "nb-econ",
    title: "Behavioral Economics & Biases",
    color: "#f59e0b",
    icon: "Scale",
    createdAt: "2026-08-14T11:15:00.000Z",
    updatedAt: "2026-08-17T12:00:00.000Z",
  },
  // Startup Sections
  {
    id: "sec-startup-pmf",
    notebookId: "nb-startup",
    title: "SaaS Moats & Growth Loops",
    color: "#8b5cf6",
    icon: "Target",
    createdAt: "2026-08-15T08:35:00.000Z",
    updatedAt: "2026-08-20T00:15:00.000Z",
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "note-transformers-101",
    notebookId: "nb-cs",
    sectionId: "sec-cs-ai",
    title: "Transformer Architecture & Multi-Head Self-Attention",
    content: `# Transformer Architecture & Multi-Head Self-Attention

> **Core Thesis:** The Transformer model discards recurrence and convolutions entirely, relying solely on **Self-Attention Mechanisms** to compute representations of input sequences in parallel.

---

## 1. Key Mathematical Foundation: Scaled Dot-Product Attention

The core attention formula maps a set of query vectors ($Q$), key vectors ($K$), and value vectors ($V$):

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

### Why scale by $\\sqrt{d_k}$?
- For large dimensions $d_k$, dot products grow large in magnitude.
- Large values push the softmax function into regions with extremely small gradients (vanishing gradient problem).
- Scaling by $1 / \\sqrt{d_k}$ counteracts this variance scaling.

---

## 2. Multi-Head Attention (MHA)

Instead of performing a single attention function with $d_{\\text{model}}$-dimensional queries, keys, and values, Multi-Head Attention projects them $h$ times with distinct learned linear projections:

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
$$\\text{where } \\text{head}_i = \\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$$

### Strategic Benefits:
- Allows the model to jointly attend to information from different representation subspaces at different positions.
- Example: One head tracks syntactic subject-verb agreements while another head captures semantic pronoun references.

---

## 3. Positional Encoding
Because Transformers contain no recurrence (unlike RNNs or LSTMs), order information must be injected:

$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$
$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$

- Wavelengths form a geometric progression from $2\\pi$ to $10000 \\cdot 2\\pi$.
- Hypothesized to allow the model to easily learn relative positions since $PE_{pos+k}$ can be expressed as a linear function of $PE_{pos}$.

---

## 4. Key Takeaways Checklist
- [x] Attention complexity is $O(n^2 \\cdot d)$ with sequence length $n$
- [x] Layer Normalization (Pre-LN vs Post-LN stability)
- [x] Residual connections preserve gradient flow ($x + \\text{Sublayer}(x)$)
- [ ] Implement FlashAttention kernel optimization in PyTorch`,
    cornellCues: "Q, K, V Matrices\nWhy scale by sqrt(d_k)?\nMulti-Head Attention vs Single Head\nPositional Encoding Sine/Cosine Formula",
    cornellSummary: "Transformers achieve massive parallelism over RNNs via Multi-Head Self-Attention. Attention scales Query-Key dot products by sqrt(d_k) to prevent vanishing gradients in softmax.",
    tags: ["Machine Learning", "Deep Learning", "Attention", "Math", "AI Systems"],
    isPinned: true,
    isFavorite: true,
    status: "mastered",
    createdAt: "2026-08-16T14:00:00.000Z",
    updatedAt: "2026-08-19T14:30:00.000Z",
  },
  {
    id: "note-atp-synthase",
    notebookId: "nb-bio",
    sectionId: "sec-bio-cell",
    title: "Chemiosmosis, Proton Gradient & ATP Synthase Molecular Motor",
    content: `# Chemiosmosis & The ATP Synthase Molecular Motor

> **Overview:** ATP Synthase ($F_oF_1$ complex) is one of nature's most magnificent rotary nano-machines, converting the potential energy of a transmembrane electrochemical proton gradient (Proton-Motive Force) into chemical energy stored in ATP phosphodiester bonds.

---

## 1. The Electrochemical Proton Gradient (PMF)

The **Proton-Motive Force ($\\Delta p$)** consists of two additive components across the mitochondrial inner membrane:

$$\\Delta p = \\Delta \\psi - \\left(\\frac{2.3 RT}{F}\\right) \\Delta \\text{pH}$$

- $\\Delta \\psi$: Electrical membrane potential (~160 to 180 mV, matrix negative)
- $\\Delta \\text{pH}$: Chemical pH gradient (~0.5 to 1.0 pH unit, matrix alkaline)

---

## 2. Structural Architecture: $F_o$ and $F_1$ Subunits

### $F_o$ Subunit (Membrane-embedded rotor & stator):
- **c-ring**: Composed of 8–10 c-subunits that rotate as protons bind to conserved Aspartate/Glutamate residues.
- **a-subunit**: Contains two non-crossing half-channels. Protons enter from the intermembrane space, neutralize the aspartate on the c-ring, rotate 360°, and exit to the matrix.

### $F_1$ Subunit (Catalytic head in mitochondrial matrix):
- **$\\alpha_3\\beta_3$ hexamer**: 3 catalytic $\\beta$ subunits alternating with $\\alpha$ subunits.
- **$\\gamma$-subunit (Central shaft)**: Asymmetric camshaft that turns inside the $\\alpha_3\\beta_3$ ring, forcing conformational changes.

---

## 3. Paul Boyer's Binding Change Mechanism

Each of the three $\\beta$-subunits cycles continuously through 3 distinct states:
1. **Open (O) State**: Very low affinity for nucleotides; newly synthesized ATP is released, and ADP + Pi bind.
2. **Loose (L) State**: Binds ADP and Pi loosely, holding them in close spatial proximity.
3. **Tight (T) State**: Tight catalytic conformation that forces spontaneous synthesis of ATP without immediate energy input!

*Critical Insight:* Energy is NOT required to form the phosphoanhydride bond of ATP; energy (from proton flux rotation) is required to dislodge and release the tightly bound ATP in the T $\\to$ O transition!`,
    cornellCues: "Proton-Motive Force (PMF)\nF_o vs F_1 Subunit roles\nBinding Change Mechanism (O -> L -> T)\nEnergy input role (ATP release vs formation)",
    cornellSummary: "ATP Synthase functions as a rotary motor driven by proton-motive force across the mitochondrial membrane. The binding change mechanism rotates beta subunits through Open, Loose, and Tight states.",
    tags: ["Biology", "Biochemistry", "Bioenergetics", "Cell Biology"],
    isPinned: false,
    isFavorite: true,
    status: "in-progress",
    createdAt: "2026-08-17T09:20:00.000Z",
    updatedAt: "2026-08-18T18:20:00.000Z",
  },
  {
    id: "note-saas-moats",
    notebookId: "nb-startup",
    sectionId: "sec-startup-pmf",
    title: "Venture SaaS Moats: Network Effects, Data Flywheels & Switching Costs",
    content: `# Venture SaaS Moats & Defensibility in the AI Era

> **Foundational Premise:** In an era where AI models and code generation are commoditizing raw feature velocity, sustainable gross margins and enterprise value are dictated by durable structural moats.

---

## 1. Hamilton Helmer's 7 Powers Applied to AI SaaS

1. **Network Effects**: Value increases quadratically with every added user ($n(n-1)/2$). Example: Collaborative student flashcard repositories and shared lecture graph hubs.
2. **Switching Costs**: Frictional friction (data schemas, muscle memory, historical review graphs, team workflows).
3. **Cornered Resource**: Proprietary labeled dataset, un-scrapeable workflow telemetry, exclusive distribution channel.
4. **Scale Economies**: Spreading high inference GPU reservation costs over millions of active queries, driving COGS to near-zero per active seat.
5. **Process Power**: Proprietary engineering knowledge and complex systems architecture that cannot be reverse-engineered quickly.
6. **Branding**: Trust and cognitive shortcut (e.g. "The world's most trusted AI note platform").
7. **Counter-Positioning**: Offering a novel disruptive business model that incumbents cannot match without cannibalizing their core revenue.

---

## 2. The AI Workflow Data Flywheel

\`\`\`
[More Users Taking Notes & Quizzes]
               │
               ▼
[Proprietary Knowledge Gaps & Recall Telemetry]
               │
               ▼
[Fine-Tuned Specialized Student AI Models]
               │
               ▼
[Superior Personalized Memory Retention Rate]
               │
               ▼
[Higher Organic Word-of-Mouth & Student Virality]
\`\`\`

---

## 3. High-Priority Execution Tactics
- [x] Zero-latency local caching + instant background cloud sync
- [x] Active recall spaced repetition algorithms (SuperMemo SM-2 & FSRS)
- [x] Collaborative group study arenas and interactive practice exams`,
    tags: ["Startup", "Strategy", "SaaS", "Growth", "Product Design"],
    isPinned: true,
    isFavorite: false,
    status: "draft",
    createdAt: "2026-08-18T16:00:00.000Z",
    updatedAt: "2026-08-20T00:15:00.000Z",
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    noteId: "note-transformers-101",
    question: "What is the primary reason for scaling QK^T by 1 / sqrt(d_k) in Self-Attention?",
    answer: "To prevent large dot products from pushing the softmax function into regions with vanishingly small gradients.",
    hint: "Think about softmax gradient saturation at high magnitudes.",
    category: "Math & Attention",
    difficulty: "medium",
    repetitions: 3,
    intervalDays: 7,
    easeFactor: 2.5,
    nextReviewDate: "2026-08-22T00:00:00.000Z",
    masteryScore: 85,
  },
  {
    id: "fc-2",
    noteId: "note-transformers-101",
    question: "Why do Transformers require Positional Encodings, unlike RNNs or LSTMs?",
    answer: "Because Self-Attention is permutation-invariant and processes all tokens in parallel with zero inherent sequential recurrence.",
    hint: "Order invariance in matrix multiplication.",
    category: "Architecture",
    difficulty: "easy",
    repetitions: 4,
    intervalDays: 14,
    easeFactor: 2.6,
    nextReviewDate: "2026-08-25T00:00:00.000Z",
    masteryScore: 95,
  },
  {
    id: "fc-3",
    noteId: "note-transformers-101",
    question: "What is the computational complexity of standard Self-Attention with sequence length N and dimension D?",
    answer: "O(N² · D) in time and memory due to the N x N attention weight matrix computation.",
    hint: "Quadratic with token count.",
    category: "Complexity",
    difficulty: "hard",
    repetitions: 1,
    intervalDays: 2,
    easeFactor: 2.2,
    nextReviewDate: "2026-08-20T00:00:00.000Z",
    masteryScore: 50,
  },
  {
    id: "fc-4",
    noteId: "note-atp-synthase",
    question: "In Paul Boyer's Binding Change Mechanism, what step actually requires proton-motive force energy input?",
    answer: "The release of tightly bound ATP (transitioning the catalytic beta subunit from Tight to Open state), NOT the chemical condensation of ADP + Pi.",
    hint: "ATP synthesis is spontaneous on the enzyme surface; ATP detachment is energy-demanding.",
    category: "Biochemistry",
    difficulty: "hard",
    repetitions: 2,
    intervalDays: 4,
    easeFactor: 2.4,
    nextReviewDate: "2026-08-21T00:00:00.000Z",
    masteryScore: 70,
  },
  {
    id: "fc-5",
    noteId: "note-atp-synthase",
    question: "What are the two additive physical components of the Proton-Motive Force (Δp)?",
    answer: "The electrical membrane potential (Δψ) and the chemical pH concentration gradient (ΔpH).",
    hint: "Charge difference + proton concentration difference.",
    category: "Bioenergetics",
    difficulty: "medium",
    repetitions: 3,
    intervalDays: 8,
    easeFactor: 2.5,
    nextReviewDate: "2026-08-24T00:00:00.000Z",
    masteryScore: 90,
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: "quiz-transformer-mastery",
    noteId: "note-transformers-101",
    noteTitle: "Transformer Architecture & Multi-Head Self-Attention",
    title: "Transformer & Self-Attention Diagnostic Exam",
    estimatedMinutes: 5,
    totalQuestions: 4,
    score: 100,
    completedAt: "2026-08-19T16:00:00.000Z",
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "In the Scaled Dot-Product Attention formula, what does dividing by √d_k prevent?",
        options: [
          "GPU memory overflow during matrix transposition",
          "Vanishing gradients caused by softmax saturation on large dot products",
          "Excessive attention on padding tokens in batching",
          "Overfitting on positional encodings",
        ],
        correctAnswer: "Vanishing gradients caused by softmax saturation on large dot products",
        explanation: "As d_k grows large, dot products grow substantially in magnitude, pushing softmax into extreme regions where derivatives are virtually zero.",
        userAnswer: "Vanishing gradients caused by softmax saturation on large dot products",
        isCorrect: true,
      },
      {
        id: "q2",
        type: "true_false",
        question: "Standard Self-Attention operations are permutation-invariant if positional encodings are removed.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Without positional encodings, swapping any two input tokens produces the exact same transformed output embeddings permuted accordingly.",
        userAnswer: "True",
        isCorrect: true,
      },
      {
        id: "q3",
        type: "mcq",
        question: "What is the primary benefit of Multi-Head Attention over a single large attention head?",
        options: [
          "It cuts the parameter count by 50%",
          "It allows the model to jointly attend to information from different representation subspaces at different positions",
          "It replaces matrix multiplication with convolution operations",
          "It guarantees 100% linear time complexity O(N)",
        ],
        correctAnswer: "It allows the model to jointly attend to information from different representation subspaces at different positions",
        explanation: "Multi-Head Attention projects Q, K, V into multiple lower-dimensional subspaces, enabling distinct heads to specialize in syntactic, semantic, and positional relationships.",
        userAnswer: "It allows the model to jointly attend to information from different representation subspaces at different positions",
        isCorrect: true,
      },
      {
        id: "q4",
        type: "fill_blank",
        question: "The computational time and memory complexity of standard self-attention with respect to sequence length N is O(_____).",
        correctAnswer: "N^2",
        explanation: "Because every token computes attention weights against every other token, an N x N attention matrix is constructed, resulting in O(N^2) quadratic scaling.",
        userAnswer: "N^2",
        isCorrect: true,
      },
    ],
  },
];

export const INITIAL_STUDY_STATS: StudyStats = {
  streakDays: 6,
  lastStudiedDate: "2026-08-20",
  totalCardsStudied: 48,
  cardsMastered: 24,
  quizzesTaken: 7,
  quizzesCompleted: 7,
  averageQuizScore: 92,
  totalStudyMinutes: 215,
  activityHistory: [
    { date: "2026-08-15", count: 8 },
    { date: "2026-08-16", count: 14 },
    { date: "2026-08-17", count: 10 },
    { date: "2026-08-18", count: 18 },
    { date: "2026-08-19", count: 22 },
    { date: "2026-08-20", count: 12 },
  ],
};

export const INITIAL_STATS = INITIAL_STUDY_STATS;
