// AbilityScores.tsx
import React from 'react';
import { calculateModifier } from '../utils/dndCalculations';

type AbilityScoresProps = {
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  onUpdate: (ability: string, value: number) => void;
  isEditing: boolean;
};

export default function AbilityScores({ abilities, onUpdate, isEditing }: AbilityScoresProps) {
  if (!abilities) {
    return (
      <div className="text-center text-gray-400 mt-12">
        Caratteristiche non disponibili
      </div>
    );
  }

  const abilityNames = [
    { key: 'strength', name: 'Forza' },
    { key: 'dexterity', name: 'Destrezza' },
    { key: 'constitution', name: 'Costituzione' },
    { key: 'intelligence', name: 'Intelligenza' },
    { key: 'wisdom', name: 'Saggezza' },
    { key: 'charisma', name: 'Carisma' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Caratteristiche
      </h2>
      <div className="grid gap-4">
        {abilityNames.map(({ key, name }) => (
          <div key={key} className="flex items-center justify-between group">
            <label className="text-lg font-medium text-gray-300 group-hover:text-purple-400 transition-colors">
              {name}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={abilities[key as keyof typeof abilities]}
                onChange={(e) => {
                  if (isEditing) {
                    onUpdate(key, parseInt(e.target.value) || 0);
                  }
                }}
                disabled={!isEditing}
                className={`w-16 h-12 text-center ${
                !isEditing ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-900/20'
                } border border-white/10 rounded-lg
                text-white focus:border-purple-500`}
              />
              <div className="w-16 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br 
                            from-purple-500/20 to-blue-600/20 border border-white/10">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-500 
                               bg-clip-text text-transparent">
                  {calculateModifier(abilities[key as keyof typeof abilities]) >= 0 ? '+' : ''}
                  {calculateModifier(abilities[key as keyof typeof abilities])}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}