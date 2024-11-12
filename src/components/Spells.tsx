// src/components/Spells.tsx

import React, { useState, useEffect } from 'react';
import { Book, Plus, Search, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react';
import type { Spell, Character, SpellSlot, Capability } from '../types';
import SpellSlots from './SpellSlots';
import Capabilities from './Capabilities';
import { calculateModifier } from '../utils/dndCalculations';
import toast from 'react-hot-toast';

interface SpellsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => Promise<void>;
}

const SLOT_COLORS = [
  'from-blue-400 to-blue-500',     // Livello 0
  'from-purple-400 to-purple-500', // Livello 1
  'from-red-400 to-red-500',       // Livello 2
  'from-green-400 to-green-500',   // Livello 3
  'from-yellow-400 to-yellow-500', // Livello 4
  'from-pink-400 to-pink-500',     // Livello 5
  'from-indigo-400 to-indigo-500', // Livello 6
  'from-orange-400 to-orange-500', // Livello 7
  'from-teal-400 to-teal-500',     // Livello 8
  'from-cyan-400 to-cyan-500',     // Livello 9
];

export default function Spells({ character, onUpdate }: SpellsProps) {
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [slots, setSlots] = useState<SpellSlot[]>(
    character.spellSlots || Array.from({ length: 10 }, (_, i) => ({ level: i, total: 0, used: 0 }))
  );
  const [capabilities, setCapabilities] = useState<Capability[]>(character.capabilities || []);

  const [spellForm, setSpellForm] = useState<Partial<Spell>>({
    name: '',
    level: 0,
    description: '',
    effect: '',
    castingTime: '',
    duration: '',
    range: '',
    resistance: false,
    savingThrow: undefined
  });

  useEffect(() => {
    console.log('Character data:', character);
    setSlots(character.spellSlots || Array.from({ length: 10 }, (_, i) => ({ level: i, total: 0, used: 0 })));
    setCapabilities(character.capabilities || []);
  }, [character.spellSlots, character.capabilities]);

  const handleSaveSpell = async () => {
    // Validazione completa dei campi obbligatori
    if (
      !spellForm.name?.trim() ||
      spellForm.level === undefined ||
      !spellForm.description?.trim() ||
      !spellForm.effect?.trim() ||
      !spellForm.castingTime?.trim() ||
      !spellForm.duration?.trim() ||
      !spellForm.range?.trim() ||
      spellForm.resistance === undefined
    ) {
      toast.error('Tutti i campi obbligatori devono essere compilati.');
      return;
    }

    // Costruzione dell'oggetto Spell assicurandosi che tutti i campi siano definiti
    const spellToSave: Spell = {
      id: editingSpell ? editingSpell.id : Date.now().toString(),
      name: spellForm.name.trim(),
      level: spellForm.level,
      description: spellForm.description.trim(),
      effect: spellForm.effect.trim(),
      castingTime: spellForm.castingTime.trim(),
      duration: spellForm.duration.trim(),
      range: spellForm.range.trim(),
      resistance: spellForm.resistance,
      ...(spellForm.savingThrow && {
        savingThrow: {
          type: spellForm.savingThrow.type,
          effect: spellForm.savingThrow.effect.trim(),
        }
      }),
    };

    try {
      const updatedSpells = [...(character.spells || [])];
      
      if (editingSpell) {
        const index = updatedSpells.findIndex(s => s.id === editingSpell.id);
        if (index !== -1) {
          updatedSpells[index] = spellToSave;
        }
      } else {
        updatedSpells.push(spellToSave);
      }

      // Rimuovi eventuali undefined dai campi
      const sanitizedSpells = updatedSpells.map(spell => {
        const { savingThrow, ...rest } = spell;
        return savingThrow ? { ...rest, savingThrow } : rest;
      });

      await onUpdate({
        spells: sanitizedSpells
      });

      setShowSpellModal(false);
      setEditingSpell(null);
      setSpellForm({
        name: '',
        level: 0,
        description: '',
        effect: '',
        castingTime: '',
        duration: '',
        range: '',
        resistance: false,
        savingThrow: undefined
      });
      
      toast.success(editingSpell ? 'Incantesimo modificato' : 'Incantesimo aggiunto');
    } catch (error: any) {
      console.error('Error saving spell:', error.message, error);
      toast.error('Errore nel salvare l\'incantesimo');
    }
  };

  const handleDeleteSpell = async (spellId: string) => {
    try {
      const updatedSpells = character.spells?.filter(s => s.id !== spellId) || [];
      await onUpdate({
        spells: updatedSpells
      });
      setDeleteConfirmation(null);
      setSelectedSpell(null);
      toast.success('Incantesimo eliminato');
    } catch (error: any) {
      console.error('Error deleting spell:', error.message, error);
      toast.error('Errore nell\'eliminare l\'incantesimo');
    }
  };

  const handleUpdateSlots = async (newSlots: SpellSlot[]) => {
    try {
      await onUpdate({
        spellSlots: newSlots
      });
      setSlots(newSlots);
    } catch (error: any) {
      console.error('Error updating spell slots:', error.message, error);
      toast.error('Errore nell\'aggiornare gli slot degli incantesimi');
    }
  };

  const handleUpdateCapabilities = async (newCapabilities: Capability[]) => {
    try {
      await onUpdate({
        capabilities: newCapabilities
      });
      setCapabilities(newCapabilities);
    } catch (error: any) {
      console.error('Error updating capabilities:', error.message, error);
      toast.error('Errore nell\'aggiornare le capacità');
    }
  };

  // Raggruppa gli incantesimi per livello
  const spellsByLevel = (character.spells || [])
    .filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spell.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === 'all' || spell.level === filterLevel;
      return matchesSearch && matchesLevel;
    })
    .reduce((acc, spell) => {
      if (!acc[spell.level]) {
        acc[spell.level] = [];
      }
      acc[spell.level].push(spell);
      return acc;
    }, {} as Record<number, Spell[]>);

  const charismaMod = character.stats?.abilities?.charisma ? calculateModifier(character.stats.abilities.charisma) : 0;
  const baseCD = 10 + charismaMod;

  return (
    <div className="space-y-8">
      {/* Intestazione e Pulsante Aggiungi Incantesimo Spostato Sopra la Lista */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Incantesimi
        </h2>
        <button
          onClick={() => setShowSpellModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                   rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuovo Incantesimo</span>
        </button>
      </div>

      {/* Capacità */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-600/10 
                    border border-white/10">
        <Capabilities capabilities={capabilities} onUpdate={handleUpdateCapabilities} />
      </div>

      {/* Classe Difficoltà (CD) */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-600/10 
                    border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium text-gray-300">Classe Difficoltà</h3>
        </div>
        <p className="text-gray-400">
          CD = {baseCD} + Livello Incantesimo
        </p>
      </div>

      {/* Spell Slots */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-600/10 
                    border border-white/10">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Slot Incantesimi</h3>
        <SpellSlots slots={slots} onUpdate={handleUpdateSlots} />
      </div>

      {/* Ricerca e Filtro Incantesimi */}
      {character.spells && character.spells.length > 0 && (
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca incantesimi..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-gray-100 focus:border-purple-500"
          >
            <option value="all">Tutti i livelli</option>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i}>Livello {i}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lista degli Incantesimi Raggruppati per Livello */}
      <div className="grid grid-cols-2 gap-8">
        {/* Livelli 0-4 */}
        <div className="space-y-8">
          {Object.entries(spellsByLevel)
            .filter(([level]) => Number(level) <= 4)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([level, spells]) => (
              <div key={level} className="space-y-4">
                <h3 className={`text-2xl font-medieval bg-gradient-to-r 
                             ${SLOT_COLORS[Number(level)]} bg-clip-text text-transparent`}>
                  Livello {level}
                </h3>
                <div className="grid gap-2">
                  {spells.map(spell => (
                    <div
                      key={spell.id}
                      onClick={() => setSelectedSpell(selectedSpell?.id === spell.id ? null : spell)}
                      className="p-3 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10 
                               hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-gray-200">{spell.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSpell(spell);
                              setSpellForm(spell);
                              setShowSpellModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                            title="Modifica Incantesimo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmation(spell.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Elimina Incantesimo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {selectedSpell?.id === spell.id && (
                        <div className="mt-4 space-y-2 text-sm text-gray-400">
                          <p>{spell.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <span className="font-medium text-gray-300">Tempo di Lancio:</span>
                              <p>{spell.castingTime}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300">Durata:</span>
                              <p>{spell.duration}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300">Raggio:</span>
                              <p>{spell.range}</p>
                            </div>
                            {spell.savingThrow && (
                              <div>
                                <span className="font-medium text-gray-300">Tiro Salvezza:</span>
                                <p>{spell.savingThrow.type} - {spell.savingThrow.effect}</p>
                              </div>
                            )}
                          </div>
                          {spell.effect && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-300">Effetto:</span>
                              <p>{spell.effect}</p>
                            </div>
                          )}
                          {spell.resistance && (
                            <p className="mt-2 text-yellow-400">Resistenza agli incantesimi applicabile</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
        {/* Livelli 5-9 */}
        <div className="space-y-8">
          {Object.entries(spellsByLevel)
            .filter(([level]) => Number(level) > 4)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([level, spells]) => (
              <div key={level} className="space-y-4">
                <h3 className={`text-2xl font-medieval bg-gradient-to-r 
                             ${SLOT_COLORS[Number(level)]} bg-clip-text text-transparent`}>
                  Livello {level}
                </h3>
                <div className="grid gap-2">
                  {spells.map(spell => (
                    <div
                      key={spell.id}
                      onClick={() => setSelectedSpell(selectedSpell?.id === spell.id ? null : spell)}
                      className="p-3 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10 
                               hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-gray-200">{spell.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSpell(spell);
                              setSpellForm(spell);
                              setShowSpellModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                            title="Modifica Incantesimo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmation(spell.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Elimina Incantesimo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {selectedSpell?.id === spell.id && (
                        <div className="mt-4 space-y-2 text-sm text-gray-400">
                          <p>{spell.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <span className="font-medium text-gray-300">Tempo di Lancio:</span>
                              <p>{spell.castingTime}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300">Durata:</span>
                              <p>{spell.duration}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300">Raggio:</span>
                              <p>{spell.range}</p>
                            </div>
                            {spell.savingThrow && (
                              <div>
                                <span className="font-medium text-gray-300">Tiro Salvezza:</span>
                                <p>{spell.savingThrow.type} - {spell.savingThrow.effect}</p>
                              </div>
                            )}
                          </div>
                          {spell.effect && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-300">Effetto:</span>
                              <p>{spell.effect}</p>
                            </div>
                          )}
                          {spell.resistance && (
                            <p className="mt-2 text-yellow-400">Resistenza agli incantesimi applicabile</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Messaggio Nessun Incantesimo */}
      {(!character.spells || character.spells.length === 0) && !showSpellModal && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nessun incantesimo. Aggiungi il tuo primo incantesimo!</p>
        </div>
      )}

      {/* Modale di Conferma Eliminazione Incantesimo */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-red-400 mb-4">Conferma Eliminazione</h3>
            <p className="text-gray-300 mb-6">
              Sei sicuro di voler eliminare questo incantesimo?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDeleteSpell(deleteConfirmation)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg
                         hover:bg-red-500/30 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale di Aggiunta/Modifica Incantesimo */}
      {showSpellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medieval text-purple-400 mb-6">
              {editingSpell ? 'Modifica Incantesimo' : 'Nuovo Incantesimo'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={spellForm.name}
                    onChange={(e) => setSpellForm({ ...spellForm, name: e.target.value })}
                    className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                             text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Livello
                  </label>
                  <select
                    value={spellForm.level}
                    onChange={(e) => setSpellForm({ ...spellForm, level: Number(e.target.value) })}
                    className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                             text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i}>Livello {i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={spellForm.description}
                  onChange={(e) => setSpellForm({ ...spellForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                           text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Effetto
                </label>
                <textarea
                  value={spellForm.effect}
                  onChange={(e) => setSpellForm({ ...spellForm, effect: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                           text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tempo di Lancio
                  </label>
                  <input
                    type="text"
                    value={spellForm.castingTime}
                    onChange={(e) => setSpellForm({ ...spellForm, castingTime: e.target.value })}
                    className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                             text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Durata
                  </label>
                  <input
                    type="text"
                    value={spellForm.duration}
                    onChange={(e) => setSpellForm({ ...spellForm, duration: e.target.value })}
                    className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                             text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Raggio
                </label>
                <input
                  type="text"
                  value={spellForm.range}
                  onChange={(e) => setSpellForm({ ...spellForm, range: e.target.value })}
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                           text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={spellForm.savingThrow !== undefined}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSpellForm({
                          ...spellForm,
                          savingThrow: { type: 'fortitude', effect: '' }
                        });
                      } else {
                        setSpellForm({
                          ...spellForm,
                          savingThrow: undefined
                        });
                      }
                    }}
                    className="rounded border-white/10 bg-white/5 text-purple-500 
                           focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Richiede Tiro Salvezza
                  </span>
                </label>

                {spellForm.savingThrow && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <select
                        value={spellForm.savingThrow.type}
                        onChange={(e) => setSpellForm({
                          ...spellForm,
                          savingThrow: {
                            ...spellForm.savingThrow!,
                            type: e.target.value as 'fortitude' | 'reflex' | 'will'
                          }
                        })}
                        className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                                 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="fortitude">Tempra</option>
                        <option value="reflex">Riflessi</option>
                        <option value="will">Volontà</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={spellForm.savingThrow.effect}
                        onChange={(e) => setSpellForm({
                          ...spellForm,
                          savingThrow: {
                            ...spellForm.savingThrow!,
                            effect: e.target.value
                          }
                        })}
                        placeholder="Effetto del tiro salvezza"
                        className="w-full p-2 bg-transparent border border-gray-500 rounded-lg
                                 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={spellForm.resistance}
                    onChange={(e) => setSpellForm({ ...spellForm, resistance: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-purple-500 
                           focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    È possibile resistere
                  </span>
                </label>
              </div>
            </div>

            {/* Pulsanti di Azione del Modale */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSpellModal(false);
                  setEditingSpell(null);
                  setSpellForm({
                    name: '',
                    level: 0,
                    description: '',
                    effect: '',
                    castingTime: '',
                    duration: '',
                    range: '',
                    resistance: false,
                    savingThrow: undefined
                  });
                }}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveSpell}
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
  );
}