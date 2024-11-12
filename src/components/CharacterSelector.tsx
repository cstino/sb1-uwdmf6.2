import React, { useState } from 'react';
import { ChevronDown, Plus, UserCircle, Trash2 } from 'lucide-react';
import type { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  currentCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  onDeleteCharacter: (characterId: string) => Promise<void>;
}

export default function CharacterSelector({
  characters,
  currentCharacter,
  onSelectCharacter,
  onCreateCharacter,
  onDeleteCharacter
}: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (characterId: string) => {
    try {
      await onDeleteCharacter(characterId);
      setShowDeleteConfirm(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full h-12 px-3 rounded-lg bg-white/5 hover:bg-white/10 
                 border border-white/10 hover:border-purple-500/30 transition-all group"
      >
        <div className="absolute inset-0 flex items-center">
          <ChevronDown className={`ml-3 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <div className="flex-1 flex items-center justify-center gap-2">
            <UserCircle className="w-5 h-5 text-purple-400" />
            <span className="font-medieval text-gray-100 group-hover:text-purple-400 transition-colors">
              {currentCharacter?.name || 'Seleziona Personaggio'}
            </span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-gray-800 
                      border border-white/10 rounded-lg shadow-xl z-50">
          {characters.map((character) => (
            <div key={character.id} className="relative group">
              {showDeleteConfirm === character.id ? (
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-red-400">Eliminare {character.name}?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded
                               hover:bg-red-500/30 transition-colors"
                    >
                      Conferma
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-2 py-1 text-sm bg-white/5 text-gray-400 rounded
                               hover:bg-white/10 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2 
                              hover:bg-purple-500/20 transition-colors">
                  <button
                    onClick={() => {
                      onSelectCharacter(character);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 text-left text-gray-300
                             hover:text-purple-400 transition-colors"
                  >
                    <span className="font-medieval">{character.name}</span>
                    <span className="text-sm text-gray-500">
                      {character.race} • {character.class} liv.{character.level}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(character.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400
                             hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <div className="border-t border-white/10 mt-2 pt-2">
            <button
              onClick={() => {
                onCreateCharacter();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300
                       hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Personaggio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}