import React from 'react';
import { Shield, Heart, Swords } from 'lucide-react';
import { type CharacterStats } from '../types';
import { calculateModifier } from '../utils/dndCalculations';

type CombatStatsProps = {
  stats: CharacterStats;
  setStats: (stats: CharacterStats) => void;
};

export default function CombatStats({ stats, setStats }: CombatStatsProps) {
  if (!stats || !stats.ac) {
    return (
      <div className="text-center text-gray-400 mt-12">
        Statistiche di combattimento non disponibili
      </div>
    );
  }

  const totalAC = (stats.ac.base || 0) + 
                  (stats.ac.armor || 0) + 
                  (stats.ac.shield || 0) + 
                  (calculateModifier(stats.abilities.dexterity) || 0) + 
                  (stats.ac.natural || 0) + 
                  (stats.ac.deflection || 0) + 
                  (stats.ac.misc || 0);

  const hpPercentage = Math.min(100, Math.max(0, (stats.hp.current / stats.hp.max) * 100));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Statistiche di Combattimento
      </h2>
      
      <div className="space-y-6">
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-purple-400 group-hover:text-purple-500 transition-colors" />
              <span className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors">
                Punti Ferita
              </span>
            </div>
            
            <div className="flex bg-black/30 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-1 border-r border-white/10">
                <div className="text-[10px] text-gray-500 text-center">PF ATTUALI</div>
                <input
                  type="number"
                  value={stats.hp.current}
                  onChange={(e) => {
                    const newValue = Math.min(stats.hp.max, Math.max(0, parseInt(e.target.value) || 0));
                    setStats({
                      ...stats,
                      hp: { ...stats.hp, current: newValue }
                    });
                  }}
                  className="w-12 text-center bg-transparent border-none text-gray-100 
                           focus:outline-none focus:ring-0"
                />
              </div>
              <div className="px-4 py-1">
                <div className="text-[10px] text-gray-500 text-center">PF TOT</div>
                <input
                  type="number"
                  value={stats.hp.max}
                  onChange={(e) => {
                    const newMax = Math.max(1, parseInt(e.target.value) || 0);
                    setStats({
                      ...stats,
                      hp: {
                        max: newMax,
                        current: Math.min(stats.hp.current, newMax)
                      }
                    });
                  }}
                  className="w-12 text-center bg-transparent border-none text-gray-100 font-bold
                           focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="h-3 bg-white/5 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-300/80 via-purple-500/80 to-violet-600/80 
                       backdrop-blur-sm transition-all duration-500 ease-out"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <Shield className="h-6 w-6 text-blue-400 group-hover:text-blue-500 transition-colors" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
              Classe Armatura
            </label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 
                            border border-white/10">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 
                               bg-clip-text text-transparent">{totalAC}</span>
                <span className="block text-xs text-gray-400">Totale</span>
              </div>
              <input
                type="number"
                value={stats.ac.armor}
                onChange={(e) => setStats({
                  ...stats,
                  ac: { ...stats.ac, armor: parseInt(e.target.value) || 0 }
                })}
                placeholder="Armatura"
                className="p-2 text-center bg-white/5 border border-white/10 rounded-lg 
                         text-gray-100 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <Swords className="h-6 w-6 text-yellow-400 group-hover:text-yellow-500 transition-colors" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 group-hover:text-yellow-400 transition-colors">
              BAB
            </label>
            <input
              type="number"
              value={stats.bab}
              onChange={(e) => setStats({
                ...stats,
                bab: parseInt(e.target.value) || 0
              })}
              className="w-full p-2 text-center bg-white/5 border border-white/10 rounded-lg 
                       text-gray-100 focus:border-yellow-500 mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}