import { NoteDocument, UserPreferences, ActivityItem, ActivityActionType } from '../types/note';

const STORAGE_KEY = 'notemind_ai_notes_v1';
const PREFS_KEY = 'notemind_ai_prefs_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultEducationLevel: 'college',
  defaultOutputLanguage: 'English',
  defaultNoteLength: 'medium',
  defaultNoteType: 'detailed',
};

// Seed sample notes for a populated workspace on first launch
const INITIAL_SAMPLE_NOTES: NoteDocument[] = [
  {
    id: 'sample-quantum-computing',
    title: 'Quantum Computing Fundamentals & Qubit Mechanics',
    subject: 'Computer Science & Physics',
    topic: 'Quantum Information Systems',
    educationLevel: 'college',
    noteType: 'detailed',
    length: 'medium',
    sourceLanguage: 'English',
    outputLanguage: 'English',
    sourceWordCount: 820,
    sourceSnippet: 'Quantum computation utilizes quantum mechanical phenomena such as superposition and entanglement...',
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 5,
    isFavorite: true,
    tags: ['Physics', 'Quantum', 'Algorithms'],
    content: `# Quantum Computing Fundamentals & Qubit Mechanics
**Subject:** Computer Science & Physics | **Level:** Undergraduate / College | **Synthesized by:** NoteMind AI

## 1. Executive Overview
Classical computers store and process information in discrete binary states known as **bits**, which can strictly represent either \`0\` or \`1\`. Quantum computation expands this paradigm by exploiting fundamental quantum phenomena—principally **superposition** and **entanglement**—allowing a quantum computer to evaluate vast computational spaces exponentially faster than classical Turing machines for specialized algorithms.

> **Golden Rule of Quantum State:** A qubit remains in a continuous probability distribution until a projective measurement forces the wave function to collapse to a definite basis state |0⟩ or |1⟩.

---

## 2. Fundamental Principles

### 2.1 Qubits and the Bloch Sphere
A single quantum bit (**qubit**) is represented mathematically as a state vector |ψ⟩ in a two-dimensional complex Hilbert space:

\`\`\`
|ψ⟩ = α|0⟩ + β|1⟩
\`\`\`

Where:
- \`α\` and \`β\` are complex probability amplitudes (\`α, β ∈ ℂ\`).
- Probability normalization condition: \`|α|² + |β|² = 1\`.
- \`|α|²\` represents the probability of measuring the qubit in state \`|0⟩\`.
- \`|β|²\` represents the probability of measuring the qubit in state \`|1⟩\`.

### 2.2 Superposition vs. Classical Determinism
Unlike classical bits, a qubit can exist in a linear combination of basis states simultaneously. When passed through a **Hadamard Gate (H)**, a base state \`|0⟩\` is placed into equal superposition:

\`\`\`
H|0⟩ = (|0⟩ + |1⟩) / √2
\`\`\`

### 2.3 Quantum Entanglement
Entanglement is a non-local correlation where the quantum states of two or more particles cannot be described independently of each other. The classic Bell state (maximally entangled pair):

\`\`\`
|Φ⁺⟩ = (|00⟩ + |11⟩) / √2
\`\`\`

Measuring particle A instantaneously determines the state of particle B, regardless of spatial distance.

---

## 3. Core Quantum Logic Gates

| Gate Name | Matrix Representation | Function / Transformation |
| :--- | :--- | :--- |
| **Pauli-X** | \`[[0, 1], [1, 0]]\` | Quantum NOT gate; flips \`|0⟩\` ↔ \`|1⟩\`. |
| **Pauli-Z** | \`[[1, 0], [0, -1]]\` | Phase flip; inverts the sign of \`|1⟩\`. |
| **Hadamard (H)** | \`1/√2 [[1, 1], [1, -1]]\` | Creates uniform superposition from definite states. |
| **CNOT** | \`4x4 Permutation Matrix\` | Entangles 2 qubits; flips target if control is \`|1⟩\`. |

---

## 4. Key Takeaways
- **No-Cloning Theorem:** An arbitrary unknown quantum state cannot be copied perfectly, making quantum cryptography inherently tamper-evident.
- **Quantum Advantage:** Achieved specifically for problems matching quantum structure (e.g., Shor's factoring, Grover's database search, quantum molecular simulation).
- **Decoherence Challenge:** The primary engineering bottleneck is environmental thermal noise inducing phase errors before logic operations conclude.`,
  },
  {
    id: 'sample-biology-flashcards',
    title: 'Cellular Respiration & ATP Bioenergetics Flashcards',
    subject: 'Biology & Biochemistry',
    topic: 'Metabolism',
    educationLevel: 'college',
    noteType: 'flashcards',
    length: 'detailed',
    sourceLanguage: 'English',
    outputLanguage: 'English',
    sourceWordCount: 650,
    createdAt: Date.now() - 3600000 * 24 * 4,
    updatedAt: Date.now() - 3600000 * 12,
    isFavorite: true,
    tags: ['Biology', 'Biochemistry', 'Flashcards'],
    content: `### Cellular Respiration & ATP Bioenergetics Flashcards\n\nHigh-yield active recall flashcard deck covering Glycolysis, the Citric Acid Cycle, and Oxidative Phosphorylation.\n\n*Deck contains 8 interactive cards.*`,
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the net ATP yield produced per glucose molecule during Glycolysis?',
        back: 'Net yield is 2 ATP molecules (4 ATP generated minus 2 ATP consumed during the preparatory phosphorylation phase), along with 2 NADH and 2 pyruvate molecules.',
        category: 'Glycolysis',
        mastered: true,
      },
      {
        id: 'fc-2',
        front: 'Where in eukaryotic cells does the Citric Acid (Krebs) Cycle take place?',
        back: 'In the mitochondrial matrix. In contrast, glycolysis occurs in the cytoplasm and oxidative phosphorylation occurs across the inner mitochondrial membrane.',
        category: 'Cellular Anatomy',
        mastered: false,
      },
      {
        id: 'fc-3',
        front: 'What is the primary role of Oxygen (O₂) in Aerobic Cellular Respiration?',
        back: 'Oxygen acts as the final terminal electron acceptor at Complex IV of the Electron Transport Chain (ETC). It combines with electrons and free protons to form H₂O.',
        category: 'Electron Transport',
        mastered: true,
      },
      {
        id: 'fc-4',
        front: 'What creates the Proton-Motive Force that drives ATP Synthase?',
        back: 'The active pumping of H⁺ protons from the mitochondrial matrix across the inner membrane into the intermembrane space by Complexes I, III, and IV creates an electrochemical proton gradient.',
        category: 'Chemiosmosis',
        mastered: false,
      },
      {
        id: 'fc-5',
        front: 'What is the theoretical maximum net ATP produced from one mole of glucose in aerobic respiration?',
        back: 'Approximately 30 to 32 ATP molecules per glucose molecule, accounting for transport costs of cytosolic NADH into mitochondria.',
        category: 'Yield & Efficiency',
        mastered: false,
      },
      {
        id: 'fc-6',
        front: 'What happens to pyruvate if molecular oxygen is completely absent?',
        back: 'Pyruvate enters fermentation pathways (lactic acid fermentation in humans/bacteria, or ethanol fermentation in yeast) to regenerate NAD⁺ from NADH so glycolysis can continue.',
        category: 'Anaerobic Metabolism',
        mastered: false,
      },
    ],
  },
  {
    id: 'sample-cs-quiz',
    title: 'Data Structures & Algorithmic Complexity Quiz',
    subject: 'Computer Science',
    topic: 'Time-Space Complexity & Graph Theory',
    educationLevel: 'engineering',
    noteType: 'quiz',
    length: 'medium',
    sourceLanguage: 'English',
    outputLanguage: 'English',
    sourceWordCount: 920,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 2,
    isFavorite: false,
    tags: ['Algorithms', 'Data Structures', 'Quiz'],
    content: `### Data Structures & Algorithmic Complexity Quiz\n\nInteractive practice test evaluating mastery of Big-O notations, Hash Tables, Balanced Trees, and Shortest Path algorithms.\n\n*Interactive quiz with 5 questions.*`,
    quiz: [
      {
        id: 'qz-1',
        question: 'What is the worst-case time complexity of searching for an element in a standard Hash Table that uses chaining for collision resolution?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
        answerIndex: 2,
        explanation: 'While average-case hash search is O(1), the worst-case occurs when all keys hash to the exact same bucket, causing the linked chain to degenerate into a linear list of size N (O(N) search).',
      },
      {
        id: 'qz-2',
        question: 'Which self-balancing binary search tree guarantees that the heights of any two sibling subtrees never differ by more than 1?',
        options: ['Red-Black Tree', 'AVL Tree', 'B+ Tree', 'Splay Tree'],
        answerIndex: 1,
        explanation: 'AVL trees strictly enforce a balance factor of -1, 0, or +1 at every node. Red-Black trees permit the longest path to be up to twice the shortest path.',
      },
      {
        id: 'qz-3',
        question: 'What is the time complexity of Dijkstra’s Algorithm implemented with a Min-Heap priority queue on a graph with V vertices and E edges?',
        options: ['O(V²)', 'O((V + E) log V)', 'O(V × E)', 'O(E log E)'],
        answerIndex: 1,
        explanation: 'With a binary min-heap, inserting each vertex and extracting minimum takes O(V log V), while relaxing edges takes O(E log V), yielding O((V + E) log V).',
      },
      {
        id: 'qz-4',
        question: 'Which sorting algorithm is guaranteed to be both stable and achieve O(N log N) worst-case time complexity?',
        options: ['QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort'],
        answerIndex: 2,
        explanation: 'MergeSort consistently runs in O(N log N) across best, average, and worst cases, and preserves the relative order of duplicate keys (stability). QuickSort is O(N²) worst-case; HeapSort is unstable.',
      },
    ],
  },
];

export function getSavedNotes(): NoteDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with sample notes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_NOTES));
      return INITIAL_SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_NOTES;
  } catch (e) {
    console.error('Failed to load notes from localStorage:', e);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveNotes(notes: NoteDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

export function saveSingleNote(note: NoteDocument): void {
  const notes = getSavedNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = { ...note, updatedAt: Date.now() };
  } else {
    notes.unshift({ ...note, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveNotes(notes);
}

export function deleteNote(id: string): void {
  const notes = getSavedNotes();
  const filtered = notes.filter((n) => n.id !== id);
  saveNotes(filtered);
}

export function getNoteById(id: string): NoteDocument | undefined {
  const notes = getSavedNotes();
  return notes.find((n) => n.id === id);
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

export function exportNotesBackupJson(): string {
  const notes = getSavedNotes();
  return JSON.stringify(notes, null, 2);
}

export function importNotesBackupJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Backup file must contain an array of notes.' };
    }
    // Validate each note has an id and title
    const validNotes: NoteDocument[] = parsed.filter((n) => n && typeof n.id === 'string' && typeof n.title === 'string');
    if (validNotes.length === 0) {
      return { success: false, count: 0, error: 'No valid notes found in backup.' };
    }

    // Merge with existing notes (matching IDs overwrite, new IDs prepend)
    const existing = getSavedNotes();
    const existingMap = new Map(existing.map((n) => [n.id, n]));
    validNotes.forEach((n) => existingMap.set(n.id, n));

    const merged = Array.from(existingMap.values());
    saveNotes(merged);
    return { success: true, count: validNotes.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e.message || 'Invalid JSON format.' };
  }
}

// Activity History Tracking
const ACTIVITY_KEY = 'notemind_ai_activity_v1';

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    action: 'create_note',
    title: 'Created note: Quantum Computing Fundamentals & Qubit Mechanics',
    targetId: 'sample-quantum-computing',
    targetType: 'note',
    timestamp: Date.now() - 1000 * 60 * 18, // 18 mins ago
    details: 'College level • Detailed Notes • 820 words',
  },
  {
    id: 'act-2',
    action: 'practice_flashcards',
    title: 'Practiced flashcards: Cellular Respiration & ATP Bioenergetics',
    targetId: 'sample-biology-flashcards',
    targetType: 'flashcards',
    timestamp: Date.now() - 1000 * 60 * 65, // ~1 hour ago
    details: 'Mastered 2 of 6 cards',
  },
  {
    id: 'act-3',
    action: 'complete_quiz',
    title: 'Completed quiz: Data Structures & Algorithmic Complexity',
    targetId: 'sample-cs-quiz',
    targetType: 'quiz',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    details: 'Score: 100% (4/4 questions correct)',
  },
  {
    id: 'act-4',
    action: 'export_note',
    title: 'Exported note: Quantum Computing Fundamentals & Qubit Mechanics',
    targetId: 'sample-quantum-computing',
    targetType: 'note',
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    details: 'Format: Formatted PDF document',
  },
];

export function getRecentActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITIES;
  } catch (e) {
    console.error('Failed to load activities:', e);
    return INITIAL_ACTIVITIES;
  }
}

export function logActivity(
  action: ActivityActionType,
  title: string,
  meta?: {
    targetId?: string;
    targetType?: 'note' | 'flashcards' | 'quiz';
    details?: string;
  }
): ActivityItem {
  const current = getRecentActivities();
  const newItem: ActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action,
    title,
    targetId: meta?.targetId,
    targetType: meta?.targetType,
    timestamp: Date.now(),
    details: meta?.details,
  };

  // Keep latest 50 activities
  const updated = [newItem, ...current.slice(0, 49)];
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save activity:', e);
  }
  return newItem;
}

export function clearActivities(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch (e) {
    console.error('Failed to clear activities:', e);
  }
}

