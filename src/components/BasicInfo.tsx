// BasicInfo.tsx

import React, { useState } from 'react';
import { Edit, Check, X, Plus, ChevronUp, ChevronDown, Trash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Character } from '../types';
import toast from 'react-hot-toast';

type BasicInfoProps = {
  character: Character;
  onUpdate: (updatedCharacter: Character) => Promise<void>;
};

export default function BasicInfo({ character, onUpdate }: BasicInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    level: character.level,
    deity: character.deity || { name: '', description: '' },
    languages: character.languages || [],
    background: character.background || '',
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [levelChangeAnimation, setLevelChangeAnimation] = useState<'increase' | 'decrease' | null>(null);

  const handleSaveEdit = async () => {
    try {
      await onUpdate({
        ...character,
        ...editForm
      });
      setIsEditing(false);
      toast.success('Modifiche salvate con successo');
    } catch (error) {
      console.error('Errore nel salvataggio delle modifiche:', error);
      toast.error('Errore nel salvataggio delle modifiche');
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      deity: character.deity || { name: '', description: '' },
      languages: character.languages || [],
      background: character.background || '',
    });
    setIsEditing(false);
  };

  const handleLevelChange = async (increment: boolean) => {
    const newLevel = increment ? editForm.level + 1 : Math.max(1, editForm.level - 1);
    setLevelChangeAnimation(increment ? 'increase' : 'decrease');

    try {
      await onUpdate({
        ...character,
        level: newLevel
      });
      setEditForm(prev => ({ ...prev, level: newLevel }));

      setTimeout(() => {
        setLevelChangeAnimation(null);
      }, 1000);

      toast.success(`Livello ${increment ? 'aumentato' : 'diminuito'} con successo`);
    } catch (error) {
      console.error('Errore nell\'aggiornamento del livello:', error);
      toast.error('Errore nell\'aggiornamento del livello');
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      setEditForm(prev => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      languages: prev.languages?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-medieval text-gray-200">Informazioni Base</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 
                     hover:border-purple-500/30 transition-all group"
          >
            <Edit className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 
                       hover:bg-emerald-500/30 transition-all group"
            >
              <Check className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 
                       hover:bg-red-500/30 transition-all group"
            >
              <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Dettagli del personaggio */}
        <div className="text-center space-y-2">
          {/* Il nome, la classe, la razza e il livello rimangono invariati come richiesto */}
          <h1 className="text-3xl font-medieval bg-gradient-to-r from-purple-400 to-blue-500 
                      bg-clip-text text-transparent">
            {editForm.name}
          </h1>
          <div className="flex gap-4 justify-center">
            <span className="bg-gradient-to-r from-purple-400/80 to-blue-500/80 
                         bg-clip-text text-transparent text-lg font-medieval">
              {editForm.race}
            </span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="bg-gradient-to-r from-purple-400/60 to-blue-500/60 
                         bg-clip-text text-transparent text-lg font-medieval">
              {editForm.class}
            </span>
          </div>
        </div>

        {/* Controlli del livello */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLevelChange(false)}
            disabled={editForm.level <= 1}
            className="p-2 rounded-full bg-white/5 border border-white/10 
                     hover:bg-white/10 hover:border-purple-500/30 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
          <div className={`text-4xl font-medieval font-bold bg-gradient-to-r 
                        from-purple-400 to-blue-500 bg-clip-text text-transparent
                        transition-transform duration-300
                        ${levelChangeAnimation === 'increase' ? 'scale-125' : ''}
                        ${levelChangeAnimation === 'decrease' ? 'scale-75' : ''}`}>
            {editForm.level}
          </div>
          <button
            onClick={() => handleLevelChange(true)}
            disabled={editForm.level >= 20}
            className="p-2 rounded-full bg-white/5 border border-white/10 
                     hover:bg-white/10 hover:border-purple-500/30 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Sezione Divinità */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-xl font-medieval bg-gradient-to-r from-yellow-400 to-amber-500 
                      bg-clip-text text-transparent">
            Divinità
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.deity?.name || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  deity: { ...prev.deity, name: e.target.value }
                }))}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                         text-gray-100 focus:border-yellow-500"
                placeholder="Nome della divinità"
              />
              <textarea
                value={editForm.deity?.description || ''}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  deity: { ...prev.deity, description: e.target.value }
                }))}
                rows={3}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                         text-gray-100 focus:border-yellow-500 resize-none"
                placeholder="Descrizione della divinità..."
              />
            </div>
          ) : (
            editForm.deity?.name ? (
              <>
                <h4 className="text-lg text-gray-200">{character.deity?.name}</h4>
                {character.deity?.description && (
                  <p className="text-gray-400 text-sm italic">
                    {character.deity.description}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Nessuna divinità associata.</p>
            )
          )}
        </div>

        {/* Sezione Lingue */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-300">Lingue Conosciute</h3>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {editForm.languages?.map((language, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 
                             flex items-center gap-2 group"
                  >
                    <span className="text-sm text-gray-300">{language}</span>
                    <button
                      onClick={() => handleRemoveLanguage(index)}
                      className="opacity-100 transition-opacity"
                    >
                      <Trash className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg
                           text-gray-100 focus:border-purple-500"
                  placeholder="Aggiungi nuova lingua"
                />
                <button
                  onClick={handleAddLanguage}
                  className="p-2 rounded-lg bg-purple-500/20 text-purple-400 
                           hover:bg-purple-500/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {character.languages?.map((language, index) => (
                <div
                  key={index}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 
                           flex items-center gap-2"
                >
                  <span className="text-sm text-gray-300">{language}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="block text-xl font-medieval text-gray-200 mb-2">Background</label>
        {isEditing ? (
          <textarea
            value={editForm.background || ''}
            onChange={(e) => setEditForm({ ...editForm, background: e.target.value })}
            rows={5}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-lg
                     text-gray-100 focus:border-purple-500 resize-none"
            placeholder="Descrivi la storia del tuo personaggio..."
          />
        ) : (
          <p className="text-gray-400 text-justify leading-relaxed">
            {character.background || 'Nessun background disponibile.'}
          </p>
        )}
      </div>
    </div>
  );
}