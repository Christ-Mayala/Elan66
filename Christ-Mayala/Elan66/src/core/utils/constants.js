export const GOLD_STANDARD_DAYS = 66;
export const PHASE_LENGTH_DAYS = 22;

export const DisciplineMode = {
  soft: 'soft',
  strict: 'strict',
};

export const DayState = {
  success: 'success',
  resisted: 'resisted',
  fail: 'fail',
};

export const HabitStatus = {
  active: 'active',
  completed: 'completed',
  archived: 'archived',
};

export const nudge66Text =
  "La science suggère que 66 jours sont nécessaires pour ancrer un changement durable. Relever le défi ?";

export const phaseCopy = {
  1: {
    name: 'Destruction',
    color: '#EF4444',
    message: {
      soft: "Tu es en train de déconstruire un ancien schéma. La résistance est normale.",
      strict: 'Tu déconstruis. La résistance est attendue. Tiens.',
    },
  },
  2: {
    name: 'Installation',
    color: '#F59E0B',
    message: {
      soft: 'Le changement est en cours. Continue, même quand tu doutes.',
      strict: 'Continue. Même quand tu doutes. Surtout quand tu doutes.',
    },
  },
  3: {
    name: 'Intégration',
    color: '#22C55E',
    message: {
      soft: "Tu deviens la personne qui n’a plus besoin de lutter.",
      strict: 'Consolide. Répète. Ne lâche rien.',
    },
  },
};

export const dailyNudgesByPhase = {
  1: {
    soft: "Objectif: tenir, pas performer.",
    strict: 'Tiens. Point.',
  },
  2: {
    soft: 'Persévérance consciente. Un jour à la fois.',
    strict: 'Fais le travail. Un jour.',
  },
  3: {
    soft: 'Consolidation. Laisse l’effort devenir simple.',
    strict: 'Consolide. Ne redescends pas.',
  },
};

export const sosMotivation = {
  soft: [
    'Respire. Tu n’as rien à prouver. Juste 3 minutes.',
    'La pulsion monte, puis redescend. Reste là.',
    'Tu fais déjà le choix le plus difficile : ne pas fuir.',
  ],
  strict: [
    'Trois minutes. Reste en contrôle.',
    'Ne négocie pas. Tiens la ligne.',
    'Aujourd’hui compte. Maintenant compte.',
  ],
};
