import React, { useState, useEffect } from 'react';
import { Scroll, User, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import type { Character, CharacterStats } from '../../types';
import { calculateFirstLevelHP, calculateBAB } from '../../utils/dndCalculations';

interface CharacterCreationFormProps {
  onCreateCharacter: (character: Character) => void;
}

const characterClasses = [
  'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero',
  'Ladro', 'Mago', 'Monaco', 'Paladino', 'Ranger', 'Stregone'
];

const races = [
  'Umano', 'Elfo', 'Nano', 'Halfling', 'Gnomo',
  'Mezzelfo', 'Mezzorco', 'Drow'
];

const abilityNames = {
  strength: 'Forza',
  dexterity: 'Destrezza',
  constitution: 'Costituzione',
  intelligence: 'Intelligenza',
  wisdom: 'Saggezza',
  charisma: 'Carisma'
};

export default function CharacterCreationForm({ onCreateCharacter }: CharacterCreationFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    race: 'Umano',
    class: 'Guerriero',
    level: 1,
    userId: user?.uid,
    stats: {
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      hp: { current: 10, max: 10 },
      ac: { base: 10, armor: 0, shield: 0, dex: 0, natural: 0, deflection: 0, misc: 0 },
      saves: { fortitude: 0, reflex: 0, will: 0 },
      bab: 0,
      level: 1,
      characterClass: 'Guerriero'
    }
  });

  useEffect(() => {
    if (character.class && character.stats?.abilities.constitution) {
      const maxHP = calculateFirstLevelHP(
        character.class,
        character.stats.abilities.constitution
      );
      const bab = calculateBAB(character.class, 1);

      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats!,
          hp: { current: maxHP, max: maxHP },
          bab
        }
      }));
    }
  }, [character.class, character.stats?.abilities.constitution]);

  const handleAbilityChange = (ability: keyof CharacterStats['abilities'], value: number) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats!,
        abilities: {
          ...prev.stats!.abilities,
          [ability]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    if (!character.name || character.name.trim() === '') {
      toast.error('Inserisci il nome del personaggio');
      return;
    }

    if (!user?.uid) {
      toast.error('Errore di autenticazione');
      return;
    }

    const newCharacter: Character = {
      id: Date.now().toString(),
      name: character.name,
      race: character.race!,
      class: character.class!,
      level: character.level!,
      userId: user.uid,
      stats: character.stats as CharacterStats
    };

    onCreateCharacter(newCharacter);
  };

  // ... rest of the component remains the same
}