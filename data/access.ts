
import { DayOfWeek, DailyMethod, AccessCode } from '../types';

export const DEFAULT_LESSON_CONTENT = `The importance of the Inner Voice Method lies in the connection between listening and speaking. When you listen carefully, your brain starts to organize the sounds before you even try to produce them. This process creates a clear cognitive map of the language, making it easier to speak naturally and without the constant need for translation. Focus on the rhythm, the pauses, and the melody of the words.`;

/**
 * MASTER KEYS - Use INNER-TEST-24H to access the Admin panel
 */
export const INITIAL_PERMANENT_KEYS = [
  'INNER-TEST-24H',
  'ALUNO-VIP-2025',
  'METODO-INNER-VOICE',
  'CURSO-INGLES-2025'
];

export const METHODOLOGY: DailyMethod[] = [
  {
    day: DayOfWeek.MONDAY,
    title: "Escuta & Imersão",
    steps: ["Escuta integral do texto", "Leitura silenciosa com som interno", "Repetição leve de frases curtas"],
    instruction: "Você é um Mentor Inner Voice. Segunda-feira: Escuta & Imersão."
  },
  {
    day: DayOfWeek.TUESDAY,
    title: "Ritmo & Fluência",
    steps: ["Escuta focada em ritmo e pausas", "Repetição encadeada", "Leitura em voz alta sem autocorreção"],
    instruction: "Você é um Mentor Inner Voice. Terça-feira: Ritmo & Fluência."
  }
];
