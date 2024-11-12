// src/components/Skills.tsx

import React, { useState, useEffect } from 'react';
import { Circle, Plus, Minus } from 'lucide-react';
import { calculateModifier, calculateMaxRanksPerSkill, calculateTotalSkillPoints } from '../utils/dndCalculations';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Character } from '../types';

type SkillsProps = {
  characterId: string;
};

const defaultAbilities = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
};

const abilityNames = {
  strength: 'Forza',
  dexterity: 'Destrezza',
  constitution: 'Costituzione',
  intelligence: 'Intelligenza',
  wisdom: 'Saggezza',
  charisma: 'Carisma'
};

// Definisci skillsList fuori dal componente per pulizia del codice
const skillsList = [
  { name: 'Acrobazia', ability: 'dexterity', untrained: false },
  { name: 'Addestrare Animali', ability: 'charisma', untrained: false },
  { name: 'Artigianato', ability: 'intelligence', untrained: true },
  { name: 'Artista della Fuga', ability: 'dexterity', untrained: true },
  { name: 'Ascoltare', ability: 'wisdom', untrained: false },
  { name: 'Camuffare', ability: 'charisma', untrained: true },
  { name: 'Cavalcare', ability: 'dexterity', untrained: true },
  { name: 'Cercare', ability: 'intelligence', untrained: true },
  { name: 'Concentrazione', ability: 'constitution', untrained: true },
  { name: 'Conoscenze (Arcane)', ability: 'intelligence', untrained: false },
  { name: 'Conoscenze (Storia)', ability: 'intelligence', untrained: false },
  { name: 'Conoscenze (Religioni)', ability: 'intelligence', untrained: false },
  { name: 'Conoscenze (Piani)', ability: 'intelligence', untrained: false },
  { name: 'Conoscenze (Locali)', ability: 'intelligence', untrained: false },
  { name: 'Decifrare Scritture', ability: 'intelligence', untrained: false },
  { name: 'Diplomazia', ability: 'charisma', untrained: true },
  { name: 'Disattivare Congegni', ability: 'intelligence', untrained: false },
  { name: 'Equilibrio', ability: 'dexterity', untrained: true },
  { name: 'Falsificare', ability: 'intelligence', untrained: true },
  { name: 'Guarire', ability: 'wisdom', untrained: true },
  { name: 'Intimidire', ability: 'charisma', untrained: true },
  { name: 'Intrattenere', ability: 'charisma', untrained: false },
  { name: 'Muoversi Silenziosamente', ability: 'dexterity', untrained: true },
  { name: 'Nascondersi', ability: 'dexterity', untrained: true },
  { name: 'Nuotare', ability: 'strength', untrained: true },
  { name: 'Osservare', ability: 'wisdom', untrained: false },
  { name: 'Percepire Intenzioni', ability: 'wisdom', untrained: true },
  { name: 'Professione', ability: 'wisdom', untrained: false },
  { name: 'Raccogliere Informazioni', ability: 'charisma', untrained: true },
  { name: 'Raggirare', ability: 'charisma', untrained: true },
  { name: 'Rapidità di Mano', ability: 'dexterity', untrained: false },
  { name: 'Saltare', ability: 'strength', untrained: true },
  { name: 'Sapienza Magica', ability: 'intelligence', untrained: false },
  { name: 'Scalare', ability: 'strength', untrained: true },
  { name: 'Scassinare Serrature', ability: 'dexterity', untrained: false },
  { name: 'Sopravvivenza', ability: 'wisdom', untrained: true },
  { name: 'Utilizzare Corde', ability: 'dexterity', untrained: false },
  { name: 'Utilizzare Oggetti Magici', ability: 'charisma', untrained: false },
  { name: 'Valutare', ability: 'intelligence', untrained: true }
];

const Skills: React.FC<SkillsProps> = ({ characterId }) => {
  const { user } = useAuth();
  const [abilities, setAbilities] = useState(defaultAbilities);
  const [level, setLevel] = useState(1);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({});
  const [classSkills, setClassSkills] = useState<Set<string>>(new Set());
  const [totalRanksUsed, setTotalRanksUsed] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const maxRanksPerSkill = calculateMaxRanksPerSkill(level);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!user || !user.uid || !characterId) {
        console.error('Utente o ID del personaggio non disponibili');
        setIsLoading(false);
        return;
      }
      try {
        const characterRef = doc(db, 'users', user.uid, 'characters', characterId);
        const characterSnap = await getDoc(characterRef);
        if (characterSnap.exists()) {
          const characterData = characterSnap.data() as Character;
          const abilitiesData = characterData.stats?.abilities || defaultAbilities;
          setAbilities(abilitiesData);
          
          // Correggere il percorso del livello
          const levelData = characterData.stats?.level || 1;
          setLevel(levelData);

          const skillsData = characterData.skills || {};
          setSkillRanks(skillsData.skillRanks || {});
          setClassSkills(new Set(skillsData.classSkills || []));
          const totalRanksUsedData = skillsData.totalRanksUsed || 0;
          setTotalRanksUsed(totalRanksUsedData);

          // Recuperare maxPoints da Firestore se esiste, altrimenti calcolarlo
          const maxPointsData = skillsData.maxPoints !== undefined
            ? skillsData.maxPoints
            : calculateTotalSkillPoints(levelData, abilitiesData.intelligence, levelData === 1);
          setMaxPoints(maxPointsData);
        } else {
          console.error('Personaggio non trovato');
        }
      } catch (error) {
        console.error('Errore nel recupero dei dati del personaggio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, [user, characterId]);

  useEffect(() => {
    // Solo se maxPoints non è stato caricato da Firestore
    if (maxPoints === 0) {
      const newMaxPoints = calculateTotalSkillPoints(level, abilities.intelligence, level === 1);
      setMaxPoints(newMaxPoints);
    }
  }, [level, abilities, maxPoints]);

  const handleRankChange = (skillName: string, value: number) => {
    const newValue = Math.max(0, Math.min(value, maxRanksPerSkill));
    const oldValue = skillRanks[skillName] || 0;
    const rankDifference = newValue - oldValue;
    
    if (totalRanksUsed + rankDifference > maxPoints) {
      toast.error('Punti totali superati!');
      return; // Supererebbe i punti disponibili
    }

    setSkillRanks(prev => ({
      ...prev,
      [skillName]: newValue
    }));
    setTotalRanksUsed(prev => prev + rankDifference);
  };

  const toggleClassSkill = (skillName: string) => {
    setClassSkills(prev => {
      const newClassSkills = new Set(prev);
      if (newClassSkills.has(skillName)) {
        newClassSkills.delete(skillName);
      } else {
        newClassSkills.add(skillName);
      }
      return newClassSkills;
    });
  };

  const adjustMaxPoints = (increment: boolean) => {
    const newMaxPoints = increment ? maxPoints + 1 : Math.max(totalRanksUsed, maxPoints - 1);
    setMaxPoints(newMaxPoints);
  };

  const handleSave = async () => {
    if (!user || !user.uid || !characterId) {
      console.error('Utente o ID del personaggio non disponibili');
      toast.error('Impossibile salvare: utente o personaggio non disponibili.');
      return;
    }
    try {
      const characterRef = doc(db, 'users', user.uid, 'characters', characterId);
      await updateDoc(characterRef, {
        skills: {
          skillRanks,
          classSkills: Array.from(classSkills),
          totalRanksUsed,
          maxPoints // Aggiungi maxPoints qui
        }
      });
      toast.success('Abilità salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio delle abilità:', error);
      toast.error('Errore nel salvataggio delle abilità');
    }
  };

  if (isLoading) {
    return <div>Caricamento delle abilità...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Abilità
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustMaxPoints(false)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 
                       hover:bg-white/10 hover:border-red-500/30 transition-all"
            >
              <Minus className="w-4 h-4 text-red-400" />
            </button>
            <div className="text-sm text-gray-400">
              Punti: {totalRanksUsed}/{maxPoints}
            </div>
            <button
              onClick={() => adjustMaxPoints(true)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 
                       hover:bg-white/10 hover:border-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {skillsList.map((skill) => {
          const abilityMod = calculateModifier(abilities[skill.ability as keyof typeof abilities]);
          const ranks = skillRanks[skill.name] || 0;
          const total = abilityMod + ranks;

          return (
            <div key={skill.name} className="relative h-24 p-3 rounded-lg 
                                            bg-gradient-to-br from-purple-500/10 to-blue-600/10 
                                            border border-white/10 hover:border-purple-500/30 transition-all">
              {/* Checkbox */}
              <div className="absolute top-3 left-3">
                <label className="relative w-4 h-4 block cursor-pointer">
                  <input
                    type="checkbox"
                    checked={classSkills.has(skill.name)}
                    onChange={() => toggleClassSkill(skill.name)}
                    className="sr-only peer"
                  />
                  <span className={`absolute inset-0 rounded-full transition-colors
                                ${classSkills.has(skill.name)
                                  ? 'bg-emerald-400'
                                  : 'bg-white/5 border-2 border-white/20'} 
                                peer-hover:border-emerald-400/50`} />
                </label>
              </div>

              {/* Nome dell'abilità e caratteristica associata */}
              <div className="pl-7 pr-4 mb-2">
                <span className="block text-sm font-medium text-gray-300 truncate">
                  {skill.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({abilityNames[skill.ability as keyof typeof abilityNames]})
                </span>
              </div>

              {/* Totale e gradi */}
              <div className="pl-7 flex items-center gap-2">
                <div className="w-16 h-7 flex items-center justify-center rounded-md 
                              bg-black/30 border border-white/10">
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-500 
                                 bg-clip-text text-transparent">
                    {total >= 0 ? '+' : ''}{total}
                  </span>
                </div>
                <input
                  type="number"
                  value={ranks}
                  onChange={(e) => handleRankChange(skill.name, parseInt(e.target.value) || 0)}
                  min="0"
                  max={maxRanksPerSkill}
                  className="w-16 h-7 text-center text-sm bg-white/5 border border-white/10 
                           rounded-md text-gray-100 focus:border-purple-500"
                  placeholder="Gradi"
                />
              </div>

              {/* Indicatore per abilità senza addestramento */}
              {skill.untrained && (
                <div className="absolute bottom-3 right-3">
                  <Circle className="w-2 h-2 fill-current text-purple-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <Circle className="w-2 h-2 fill-current text-purple-400" />
        <span>Utilizzabile senza addestramento</span>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          Salva
        </button>
      </div>
    </div>
  );
}

export default Skills;