
import { PhaseData } from './types';

export const COURSE_PHASES: PhaseData[] = [
  {
    id: 1,
    title: "Linguistic & Cognitive Foundation",
    weeksRange: "Weeks 1–4",
    description: "Build mental clarity, academic language base, and confidence.",
    weeks: [
      {
        id: 1,
        title: "Diagnostic & The TOEFL Map",
        objective: "Remove fear, give clear mental map, establish realistic starting point.",
        internalFocus: "Psychological safety & orientation",
        tasks: ["2 short academic readings", "2 short academic audios", "Written reflection"],
        sessionStructure: ["Opening Mindset", "Guided diagnostic", "Interpretation", "Clarity Concept"]
      },
      {
        id: 2,
        title: "Thinking in English",
        objective: "Reduce mental translation, build basic cognitive flow.",
        internalFocus: "Sustained focus & reduced self-judgment",
        tasks: ["Daily 5-min journal", "3 recorded speaking responses", "Structure-focused reading"],
        sessionStructure: ["Cognitive micro-training", "Applied language work", "Timed responses"]
      },
      {
        id: 3,
        title: "Idea Organization",
        objective: "Teach students to organize ideas before speaking or writing.",
        internalFocus: "Structural confidence",
        tasks: ["4 short written responses", "4 spoken responses", "Self-rating clarity"],
        sessionStructure: ["Point -> Reason -> Example framework", "Guided practice", "Question adaptation"]
      },
      {
        id: 4,
        title: "Academic Base & Stability",
        objective: "Consolidate academic language, create control.",
        internalFocus: "Emotional stability",
        tasks: ["Partial mini-simulation", "Conscious review", "Active rest"],
        sessionStructure: ["Connectors & Contrast", "Integrated practice", "Transition strategy"]
      }
    ]
  },
  {
    id: 2,
    title: "Input Mastery: Reading & Listening",
    weeksRange: "Weeks 5–10",
    description: "Efficient comprehension and precision strategies.",
    weeks: [
      {
        id: 5,
        title: "Active Reading Techniques",
        objective: "Master skimming and scanning without losing meaning.",
        internalFocus: "Visual focus discipline",
        tasks: ["4 academic passages", "Vocabulary tracking", "Main idea drills"],
        sessionStructure: ["Speed reading intro", "Paragraph analysis", "Detail hunting"]
      },
      {
        id: 6,
        title: "Reading: Inference & Rhetoric",
        objective: "Understand what is NOT explicitly stated.",
        internalFocus: "Deep logical mapping",
        tasks: ["Inference practice sets", "Author purpose analysis"],
        sessionStructure: ["Logic mapping", "Indirect meaning", "Rhetorical drills"]
      },
      {
        id: 7,
        title: "Listening: Academic Flow",
        objective: "Follow complex lectures and capture core arguments.",
        internalFocus: "Auditory retention",
        tasks: ["3 lectures", "2 conversations", "Note-taking sync"],
        sessionStructure: ["Audio mapping", "Signal words", "Lecture structure"]
      },
      {
        id: 8,
        title: "Listening: Nuance & Tone",
        objective: "Detect speaker attitude and degree of certainty.",
        internalFocus: "Social-linguistic awareness",
        tasks: ["Attitude question sets", "Tone analysis"],
        sessionStructure: ["Intonation drills", "Pragmatic understanding"]
      },
      {
        id: 9,
        title: "Input Integration",
        objective: "Synthesize reading and listening data quickly.",
        internalFocus: "Multitasking clarity",
        tasks: ["Combined R/L sets", "Comparative note-taking"],
        sessionStructure: ["Synthesis logic", "Data comparison"]
      },
      {
        id: 10,
        title: "Phase 2 Review",
        objective: "Benchmark reading and listening performance.",
        internalFocus: "Confidence building",
        tasks: ["Full R/L section mock", "Review session"],
        sessionStructure: ["Timed simulation", "Error analysis"]
      }
    ]
  },
  {
    id: 3,
    title: "Output Mastery: Speaking & Writing",
    weeksRange: "Weeks 11–16",
    description: "Clear, structured, and confident expression.",
    weeks: [
      {
        id: 11,
        title: "Speaking: Independent Tasks",
        objective: "Formulate strong opinions in 15 seconds.",
        internalFocus: "Reaction speed",
        tasks: ["10 speaking prompts", "Record and review"],
        sessionStructure: ["Brainstorming drills", "Structure optimization"]
      },
      {
        id: 12,
        title: "Speaking: Integrated Campus",
        objective: "Summarize campus situations accurately.",
        internalFocus: "Accuracy and brevity",
        tasks: ["5 campus tasks", "Template refinement"],
        sessionStructure: ["Note-to-speech conversion", "Summary focus"]
      },
      {
        id: 13,
        title: "Speaking: Academic Lectures",
        objective: "Explain complex concepts clearly.",
        internalFocus: "Explanatory clarity",
        tasks: ["5 academic tasks", "Peer-style review"],
        sessionStructure: ["Concept breakdown", "Vocabulary precision"]
      },
      {
        id: 14,
        title: "Writing: Academic Discussion",
        objective: "Master the 10-minute 2026 format.",
        internalFocus: "Concise argumentation",
        tasks: ["8 discussion posts", "Self-editing"],
        sessionStructure: ["Fast typing drills", "Argument construction"]
      },
      {
        id: 15,
        title: "Writing: Integrated Task",
        objective: "Balance reading and listening evidence.",
        internalFocus: "Objectivity",
        tasks: ["4 integrated essays", "Contrastive analysis"],
        sessionStructure: ["Source mapping", "Transition mastery"]
      },
      {
        id: 16,
        title: "Phase 3 Review",
        objective: "Benchmark speaking and writing.",
        internalFocus: "Output resilience",
        tasks: ["Full S/W section mock", "Feedback loop"],
        sessionStructure: ["Simulation", "Score alignment"]
      }
    ]
  },
  {
    id: 4,
    title: "Integration & Logic",
    weeksRange: "Weeks 17–20",
    description: "Connecting all skills with advanced reasoning.",
    weeks: [
      {
        id: 17,
        title: "Advanced Synthesis",
        objective: "Connect ideas across multiple academic domains.",
        internalFocus: "Interdisciplinary thinking",
        tasks: ["Multi-source projects", "Complex lectures"],
        sessionStructure: ["Cross-domain logic", "Advanced connectors"]
      },
      {
        id: 18,
        title: "Error Pattern Analysis",
        objective: "Identify and eliminate recurring mistakes.",
        internalFocus: "Critical self-awareness",
        tasks: ["Personal error log review", "Targeted drills"],
        sessionStructure: ["Pattern recognition", "Precision fixes"]
      },
      {
        id: 19,
        title: "Advanced Paraphrasing",
        objective: "Say the same thing in three different ways.",
        internalFocus: "Linguistic flexibility",
        tasks: ["Synonym drills", "Structure flipping"],
        sessionStructure: ["Vocabulary expansion", "Sentence variety"]
      },
      {
        id: 20,
        title: "Stamina Training",
        objective: "Maintain performance for 2 hours.",
        internalFocus: "Endurance",
        tasks: ["Back-to-back sections", "Focus exercises"],
        sessionStructure: ["Energy management", "Focus reset techniques"]
      }
    ]
  },
  {
    id: 5,
    title: "Final Polish & Simulation",
    weeksRange: "Weeks 21–24",
    description: "Consistency and emotional stability.",
    weeks: [
      {
        id: 21,
        title: "Full Mock Test 1",
        objective: "Experience full test pressure.",
        internalFocus: "Pressure management",
        tasks: ["Full iBT simulation", "Full review"],
        sessionStructure: ["Simulation", "Detailed debrief"]
      },
      {
        id: 22,
        title: "Full Mock Test 2",
        objective: "Refine timing and strategy.",
        internalFocus: "Strategic adaptability",
        tasks: ["Full iBT simulation", "Strategy tweak"],
        sessionStructure: ["Simulation", "Timing optimization"]
      },
      {
        id: 23,
        title: "The 120 Mindset",
        objective: "Final confidence and calmness.",
        internalFocus: "Peak state",
        tasks: ["Relaxed review", "Mental rehearsal"],
        sessionStructure: ["Success visualization", "Final Q&A"]
      },
      {
        id: 24,
        title: "Final Assessment",
        objective: "Confirm readiness for test day.",
        internalFocus: "Calm certainty",
        tasks: ["Last check-in", "Bag packing list"],
        sessionStructure: ["Final feedback", "Closing Ceremony"]
      }
    ]
  }
];

export const SYSTEM_PROMPT_TEMPLATE = (weekTitle: string, objective: string) => `
You are the "Premium TOEFL iBT 2026 Senior Trainer". 
Current Week Focus: ${weekTitle}
Objective: ${objective}

Philosophy:
1. Internal clarity -> linguistic clarity -> reliable performance.
2. It's about thinking in English, not just templates.
3. Use the "Point -> Reason -> Example" framework.
4. Encourage psychological safety.
5. Focus on organization and clarity over complexity.

CRITICAL FORMATTING RULE:
- ALWAYS respond in PLAIN TEXT only.
- DO NOT use Markdown symbols like asterisks (**), hashtags (#), underscores (_), or backticks (\`).
- If you need to emphasize something, use CAPITAL LETTERS sparingly or simply use clear, direct language.
- Use simple line breaks (one or two enters) to separate ideas.
- NO BULLET POINT SYMBOLS unless they are simple dashes (-).
- The goal is a clean, conversational look.

If you are in Voice mode, keep your responses extra concise and natural.
`;
