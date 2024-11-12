import React, { useState } from 'react';
import { Shield, Heart, Swords, Star, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { calculateModifier } from '../utils/dndCalculations';
import AbilityScores from './AbilityScores';
import SavingThrows from './SavingThrows';
import type { CharacterStats as CharacterStatsType, Talent } from '../types';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type CharacterStatsProps = {
  characterId: string;
  stats: CharacterStatsType;
  setStats: React.Dispatch<React.SetStateAction<CharacterStatsType>>;
};

const talentTypes: Record<Talent['type'], { label: string; bgClass: string; textClass: string }> = {
  combat: { 
    label: 'Combattimento', 
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-400'
  },
  skill: { 
    label: 'Abilità', 
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400'
  },
  magic: { 
    label: 'Magia', 
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400'
  },
  other: { 
    label: 'Altro', 
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400'
  }
};

export default function CharacterStats({ characterId, stats, setStats }: CharacterStatsProps) {
  console.log('Ricevuto characterId:', characterId);
  console.log('Ricevute stats:', stats);

  const [isEditing, setIsEditing] = useState(false);
  const [editableStats, setEditableStats] = useState<CharacterStatsType>(stats);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [showHealModal, setShowHealModal] = useState(false);
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [healAmount, setHealAmount] = useState(0);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const startEditing = () => {
    setEditableStats(stats);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableStats(stats);
  };

  const handleSave = () => {
    setIsEditing(false);
    setStats(editableStats);
    saveStatsToDatabase(editableStats);
  };

  const saveStatsToDatabase = async (updatedStats: CharacterStatsType) => {
    try {
      const userId = auth.currentUser?.uid;
      console.log('User ID:', userId);
      console.log('Character ID:', characterId);

      if (!userId || !characterId) {
        throw new Error('ID utente o personaggio mancante');
      }

      const docRef = doc(db, 'users', userId, 'characters', characterId);
      await setDoc(docRef, { stats: updatedStats }, { merge: true });

      console.log('Statistiche salvate con successo!');
      toast.success('Statistiche salvate con successo!');
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);

      if (error instanceof Error) {
        console.error('Dettagli dell\'errore:', error.message);
      }

      toast.error('Errore durante il salvataggio delle statistiche');
    }
  };

  const [talentForm, setTalentForm] = useState<Partial<Talent>>({
    name: '',
    description: '',
    type: 'combat'
  });

  const totalAC = (stats.ac.base || 0) + 
                  (stats.ac.armor || 0) + 
                  (stats.ac.shield || 0) + 
                  (calculateModifier(stats.abilities.dexterity) || 0) + 
                  (stats.ac.natural || 0) + 
                  (stats.ac.deflection || 0) + 
                  (stats.ac.misc || 0);

  const hpPercentage = Math.min(100, Math.max(0, (stats.hp.current / stats.hp.max) * 100));

  const handleDamage = () => {
    const newCurrentHP = Math.max(0, stats.hp.current - damageAmount);
    setStats({
      ...stats,
      hp: { ...stats.hp, current: newCurrentHP }
    });
    setDamageAmount(0);
    setShowDamageModal(false);
  };

  const handleHeal = () => {
    const newCurrentHP = Math.min(stats.hp.max, stats.hp.current + healAmount);
    setStats({
      ...stats,
      hp: { ...stats.hp, current: newCurrentHP }
    });
    setHealAmount(0);
    setShowHealModal(false);
  };

  const handleSaveTalent = () => {
    if (!talentForm.name || !talentForm.description || !talentForm.type) {
      toast.error('Nome e descrizione sono obbligatori');
      return;
    }

    const updatedTalents = [...(stats.talents || [])];
    
    if (editingTalent) {
      const index = updatedTalents.findIndex(t => t.id === editingTalent.id);
      if (index !== -1) {
        updatedTalents[index] = { ...talentForm, id: editingTalent.id } as Talent;
      }
    } else {
      updatedTalents.push({
        ...talentForm,
        id: Date.now().toString()
      } as Talent);
    }

    setStats({
      ...stats,
      talents: updatedTalents
    });

    setShowTalentModal(false);
    setEditingTalent(null);
    setTalentForm({
      name: '',
      description: '',
      type: 'combat'
    });
    
    toast.success(editingTalent ? 'Talento modificato' : 'Talento aggiunto');
  };

  const handleDeleteTalent = (talentId: string) => {
    const updatedTalents = stats.talents?.filter(t => t.id !== talentId) || [];
    setStats({
      ...stats,
      talents: updatedTalents
    });
    setDeleteConfirmation(null);
    toast.success('Talento eliminato');
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        {!isEditing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                       rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
          >
            <Edit2 className="w-5 h-5" />
            <span>Modifica</span>
          </button>
        ) : (
          <div className="flex">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 
                         rounded-lg hover:bg-green-500/30 transition-colors text-sm"
            >
              <Save className="w-5 h-5" />
              <span>Salva</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 
                         rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              <X className="w-5 h-5" />
              <span>Annulla</span>
            </button>
          </div>
        )}
      </div>
      <div className="space-y-16">
        <AbilityScores 
          abilities={isEditing ? editableStats.abilities : stats.abilities}
          onUpdate={(ability, value) => {
            if (isEditing) {
              setEditableStats({
                ...editableStats,
                abilities: {
                  ...editableStats.abilities,
                  [ability]: value
                }
              });
            }
          }}
          isEditing={isEditing}
        />

        <div className="space-y-8">
          {/* HP Bar */}
          <div className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-purple-400 group-hover:text-purple-500 transition-colors" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors">
                  Punti Ferita
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDamageModal(true)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg
                           hover:bg-red-500/30 transition-colors text-sm"
                >
                  Danni
                </button>
                <button
                  onClick={() => setShowHealModal(true)}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg
                           hover:bg-green-500/30 transition-colors text-sm"
                >
                  Cura
                </button>
              </div>
            </div>

            <div className="flex bg-gray-800/20 rounded-lg border border-white/10 overflow-hidden mb-2">
              <div className="px-4 py-2 border-r border-white/10">
                <div className="text-[10px] text-gray-500">PF ATTUALI</div>
                <div className="text-center text-gray-100">
                  {stats.hp.current}
                </div>
              </div>
              <div className="px-4 py-2">
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

            <div className="h-3 bg-white/5 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-300/80 via-purple-500/80 to-violet-600/80 
                           backdrop-blur-sm transition-all duration-500 ease-out"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* Combat Values Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Armor Class */}
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-blue-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
                  Classe Armatura
                </span>
              </div>

              <div className="flex bg-gray-800/20 rounded-lg border border-white/10 overflow-hidden h-12">
                <div className="px-4 flex-1 border-r border-white/10 flex flex-col justify-center">
                  <div className="text-[10px] text-gray-500 text-center">CA BASE</div>
                  <input
                    type="number"
                    value={stats.ac.base}
                    onChange={(e) => setStats({
                      ...stats,
                      ac: { ...stats.ac, base: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full text-center bg-transparent border-none text-gray-100 
                             focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="px-4 flex-1 border-r border-white/10 flex flex-col justify-center">
                  <div className="text-[10px] text-gray-500 text-center">ARMATURA</div>
                  <input
                    type="number"
                    value={stats.ac.armor}
                    onChange={(e) => setStats({
                      ...stats,
                      ac: { ...stats.ac, armor: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full text-center bg-transparent border-none text-gray-100 
                             focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="px-4 flex-1 bg-gradient-to-br from-blue-500/20 to-purple-600/20 
                              flex flex-col justify-center">
                  <div className="text-[10px] text-gray-500 text-center">CA TOT</div>
                  <span className="text-center text-lg font-bold bg-gradient-to-r from-blue-400 
                                 to-purple-500 bg-clip-text text-transparent">
                    {totalAC}
                  </span>
                </div>
              </div>
            </div>

            {/* BAB */}
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="h-6 w-6 text-yellow-400 group-hover:text-yellow-500 transition-colors" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-yellow-400 transition-colors">
                  BAB
                </span>
              </div>

              <div className="flex bg-gray-800/20 rounded-lg border border-white/10 overflow-hidden h-12">
                <input
                  type="number"
                  value={stats.bab}
                  onChange={(e) => setStats({
                    ...stats,
                    bab: parseInt(e.target.value) || 0
                  })}
                  className="w-full text-center bg-transparent border-none text-gray-100 
                             focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Saving Throws */}
          <SavingThrows
            abilities={stats.abilities}
            level={stats.level}
            characterClass={stats.characterClass}
            onSave={(saves) => {
              setStats({
                ...stats,
                saves
              });
            }}
            currentSaves={stats.saves}
          />

          {/* Talents Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medieval text-gray-200 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Talenti
              </h3>
              <button
                onClick={() => setShowTalentModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 
                         rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Talento</span>
              </button>
            </div>

            <div className="grid gap-3">
              {stats.talents?.map(talent => {
                const typeInfo = talentTypes[talent.type] || {
                  label: 'Sconosciuto',
                  bgClass: 'bg-gray-500/20',
                  textClass: 'text-gray-400',
                };
                return (
                  <div
                    key={talent.id}
                    className="p-4 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10
                             hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medieval text-gray-200 flex items-center gap-2">
                          {talent.name}
                          <span className={`text-sm px-2 py-0.5 rounded-full ${typeInfo.bgClass} ${typeInfo.textClass}`}>
                            {typeInfo.label}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">{talent.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTalent(talent);
                            setTalentForm(talent);
                            setShowTalentModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirmation === talent.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteTalent(talent.id)}
                              className="px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded
                                       hover:bg-red-500/30 transition-colors"
                            >
                              Conferma
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation(null)}
                              className="px-2 py-1 text-sm bg-white/5 text-gray-400 rounded
                                       hover:bg-white/10 transition-colors"
                            >
                              Annulla
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmation(talent.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!stats.talents || stats.talents.length === 0) && (
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">Nessun talento. Aggiungi il tuo primo talento!</p>
              </div>
            )}
          </div>
        </div>

        {/* Damage Modal */}
        {showDamageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xs">
              <h3 className="text-lg font-medium text-red-400 mb-4">Danni Subiti</h3>
              <input
                type="number"
                value={damageAmount}
                onChange={(e) => setDamageAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                         text-gray-100 focus:border-red-500 mb-4"
                placeholder="Ammontare dei danni"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDamage}
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg
                           hover:bg-red-500/30 transition-colors"
                >
                  Applica
                </button>
                <button
                  onClick={() => {
                    setDamageAmount(0);
                    setShowDamageModal(false);
                  }}
                  className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg
                           hover:bg-white/10 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Heal Modal */}
        {showHealModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xs">
              <h3 className="text-lg font-medium text-green-400 mb-4">Cure Ricevute</h3>
              <input
                type="number"
                value={healAmount}
                onChange={(e) => setHealAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                         text-gray-100 focus:border-green-500 mb-4"
                placeholder="Ammontare della cura"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleHeal}
                  className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg
                           hover:bg-green-500/30 transition-colors"
                >
                  Applica
                </button>
                <button
                  onClick={() => {
                    setHealAmount(0);
                    setShowHealModal(false);
                  }}
                  className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg
                           hover:bg-white/10 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Talent Modal */}
        {showTalentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-medieval text-purple-400 mb-6">
                {editingTalent ? 'Modifica Talento' : 'Nuovo Talento'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={talentForm.name}
                    onChange={(e) => setTalentForm({ ...talentForm, name: e.target.value })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                             text-gray-100 focus:border-purple-500"
                    placeholder="Nome del talento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={talentForm.type}
                    onChange={(e) => setTalentForm({ ...talentForm, type: e.target.value as Talent['type'] })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                             text-gray-100 focus:border-purple-500"
                  >
                    {Object.entries(talentTypes).map(([type, info]) => (
                      <option key={type} value={type}>{info.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={talentForm.description}
                    onChange={(e) => setTalentForm({ ...talentForm, description: e.target.value })}
                    rows={3}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                             text-gray-100 focus:border-purple-500 resize-none"
                    placeholder="Descrizione del talento"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowTalentModal(false);
                    setEditingTalent(null);
                    setTalentForm({
                      name: '',
                      description: '',
                      type: 'combat'
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Annulla</span>
                </button>
                <button
                  onClick={handleSaveTalent}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                           rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Salva</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}