export type SpellSchool =
  | 'Abiurazione'
  | 'Ammaliamento'
  | 'Divinazione'
  | 'Evocazione'
  | 'Illusione'
  | 'Invocazione'
  | 'Necromanzia'
  | 'Trasmutazione';

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: SpellSchool;
  description: string;
  effect: string;
  castingTime: string;
  duration: string;
  range: string;
  resistance: boolean;
  savingThrow?: {
    type: 'fortitude' | 'reflex' | 'will';
    effect: string;
  };
}

export interface CharacterStats {
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hp: {
    current: number;
    max: number;
  };
  ac: {
    base: number;
    armor: number;
    shield: number;
    dex: number;
    natural: number;
    deflection: number;
    misc: number;
  };
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  bab: number;
  level: number;
  characterClass: string;
  talents?: Talent[];
}

export interface DiaryTag {
  id: string;
  type: 'character' | 'location' | 'item' | 'quest' | 'lore';
  name: string;
  description?: string;
  firstMentionedIn: string;
}

export interface DiarySession {
  id: string;
  title: string;
  content: string;
  tags: Array<{
    id: string;
    position: [number, number];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  deity?: {
    name: string;
    description: string;
  };
  languages: string[];
  background?: string;
  stats: CharacterStats;
  diary?: DiarySession[];
  tags?: DiaryTag[];
  spells?: Spell[];
  capabilities: Capability[];
  equipment?: EquipmentItem[];
  photoURL?: string; // Aggiunta della proprietà photoURL
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'skill' | 'magic' | 'other';
}

export interface EquipmentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight?: number;
  value?: number;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  dailyUses: number;
  used: number;
}