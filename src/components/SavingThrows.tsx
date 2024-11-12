import React, { useState, useEffect } from 'react';
import { Zap, Wind, Brain, Edit2, Check, X } from 'lucide-react';
import { calculateModifier } from '../utils/dndCalculations';
import type { CharacterStats } from '../types';

interface SavingThrowsProps {
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  level: number;
  characterClass: string;
  onSave?: (saves: { fortitude: number; reflex: number; will: number }) => void;
  currentSaves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
}

export default function SavingThrows({
  abilities,
  level,
  characterClass,
  onSave,
  currentSaves,
}: SavingThrowsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    fortitude: currentSaves.fortitude,
    reflex: currentSaves.reflex,
    will: currentSaves.will,
  });

  // Synchronizza editValues con currentSaves quando non si sta modificando
  useEffect(() => {
    if (!isEditing) {
      setEditValues({
        fortitude: currentSaves.fortitude,
        reflex: currentSaves.reflex,
        will: currentSaves.will,
      });
    }
  }, [currentSaves, isEditing]);

  const saves = [
    { 
      name: 'Tempra',
      key: 'fortitude',
      ability: 'constitution',
      icon: <Zap className="h-6 w-6 text-red-400 group-hover:text-red-500 transition-colors" />
    },
    { 
      name: 'Riflessi',
      key: 'reflex',
      ability: 'dexterity',
      icon: <Wind className="h-6 w-6 text-green-400 group-hover:text-green-500 transition-colors" />
    },
    { 
      name: 'Volontà',
      key: 'will',
      ability: 'wisdom',
      icon: <Brain className="h-6 w-6 text-blue-400 group-hover:text-blue-500 transition-colors" />
    }
  ];

  const handleSave = () => {
    if (onSave) {
      onSave(editValues);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Tiri Salvezza
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 
                     hover:border-purple-500/30 transition-all group"
          >
            <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 
                       hover:bg-emerald-500/30 transition-all group"
            >
              <Check className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValues({
                  fortitude: currentSaves.fortitude,
                  reflex: currentSaves.reflex,
                  will: currentSaves.will,
                });
              }}
              className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 
                       hover:bg-red-500/30 transition-all group"
            >
              <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {saves.map((save) => {
          const abilityMod = calculateModifier(abilities[save.ability as keyof typeof abilities]);
          const total = editValues[save.key as keyof typeof editValues] + abilityMod;

          return (
            <div key={save.key} className="group flex items-center justify-between p-3 rounded-lg 
                                        bg-gradient-to-br from-purple-500/10 to-blue-600/10 
                                        border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-2">
                {save.icon}
                <span className="text-lg font-medium text-gray-300 group-hover:text-purple-400 transition-colors">
                  {save.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues[save.key as keyof typeof editValues]}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        [save.key]: parseInt(e.target.value) || 0
                      }))}
                      className="w-16 p-2 text-center bg-white/5 border border-white/10 rounded-lg 
                               text-gray-100 focus:border-purple-500"
                    />
                  ) : (
                    <>
                      <span>Base: {currentSaves[save.key as keyof typeof currentSaves]}</span>
                      <span className="mx-1">+</span>
                      <span>Mod: {abilityMod >= 0 ? '+' : ''}{abilityMod}</span>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded-lg 
                              bg-gradient-to-br from-purple-500/20 to-blue-600/20 
                              border border-white/10">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-500 
                                 bg-clip-text text-transparent">
                    {total >= 0 ? '+' : ''}{total}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}