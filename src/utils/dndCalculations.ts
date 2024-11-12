export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

interface ClassInfo {
  hitDie: number;
  bab: number;
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
}

export const classDetails: Record<string, ClassInfo> = {
  'Barbaro': { 
    hitDie: 12, 
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 }
  },
  'Bardo': { 
    hitDie: 6, 
    bab: 0.75,
    saves: { fortitude: 0, reflex: 2, will: 2 }
  },
  'Chierico': { 
    hitDie: 8, 
    bab: 0.75,
    saves: { fortitude: 2, reflex: 0, will: 2 }
  },
  'Druido': { 
    hitDie: 8, 
    bab: 0.75,
    saves: { fortitude: 2, reflex: 0, will: 2 }
  },
  'Guerriero': { 
    hitDie: 10, 
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 }
  },
  'Ladro': { 
    hitDie: 6, 
    bab: 0.75,
    saves: { fortitude: 0, reflex: 2, will: 0 }
  },
  'Mago': { 
    hitDie: 4, 
    bab: 0.5,
    saves: { fortitude: 0, reflex: 0, will: 2 }
  },
  'Monaco': { 
    hitDie: 8, 
    bab: 0.75,
    saves: { fortitude: 2, reflex: 2, will: 2 }
  },
  'Paladino': { 
    hitDie: 10, 
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 }
  },
  'Ranger': { 
    hitDie: 8, 
    bab: 1,
    saves: { fortitude: 2, reflex: 2, will: 0 }
  },
  'Stregone': { 
    hitDie: 4, 
    bab: 0.5,
    saves: { fortitude: 0, reflex: 0, will: 2 }
  }
};

export const calculateFirstLevelHP = (characterClass: string, constitutionScore: number): number => {
  const classInfo = classDetails[characterClass];
  if (!classInfo) return 0;
  
  const constitutionModifier = calculateModifier(constitutionScore);
  return classInfo.hitDie + constitutionModifier;
};

export const calculateBAB = (characterClass: string, level: number): number => {
  const classInfo = classDetails[characterClass];
  if (!classInfo) return 0;
  
  return Math.floor(level * classInfo.bab);
};

export const calculateSavingThrow = (
  type: 'fortitude' | 'reflex' | 'will',
  characterClass: string,
  level: number,
  abilityScore: number
): number => {
  const classInfo = classDetails[characterClass];
  if (!classInfo) return 0;

  const baseSave = classInfo.saves[type];
  const abilityModifier = calculateModifier(abilityScore);
  
  return baseSave + abilityModifier;
};

export const calculateMaxRanksPerSkill = (level: number): number => {
  return 3 + level;
};

export const calculateTotalSkillPoints = (
  level: number,
  intelligenceScore: number,
  isFirstLevel: boolean
): number => {
  const intModifier = calculateModifier(intelligenceScore);
  const basePoints = 2 + Math.max(0, intModifier);
  
  if (isFirstLevel) {
    return basePoints * 4;
  }
  
  return basePoints + 1;
};