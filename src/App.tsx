// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; // Importato toast
import { useAuth } from './contexts/AuthContext';
import { useCharacters } from './hooks/useCharacters';
import AuthForm from './components/Auth/AuthForm';
import CharacterCreationForm from './components/CharacterCreation/CharacterCreationForm';
import Sidebar from './components/Sidebar';
import CharacterStats from './components/CharacterStats';
import BasicInfo from './components/BasicInfo';
import Skills from './components/Skills';
import Spells from './components/Spells';
import CharacterDiary from './components/CharacterDiary';
import Equipment from './components/Equipment';
import { type Character } from './types';

export default function App() {
  const { user } = useAuth();
  const { characters, loading, createCharacter, updateCharacter, deleteCharacter } = useCharacters(user?.uid);
  const [currentPath, setCurrentPath] = useState('/info');
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (characters.length > 0 && !currentCharacter) {
      setCurrentCharacter(characters[0]);
    }
  }, [characters, currentCharacter]);

  const handleCreateCharacter = async (newCharacter: Character) => {
    const created = await createCharacter(newCharacter);
    if (created) {
      setCurrentCharacter(created);
      setCurrentPath('/info');
    }
  };

  const handleUpdateCharacter = async (updates: Partial<Character>) => {
    if (currentCharacter) {
      try {
        await updateCharacter(currentCharacter.id, updates);
        setCurrentCharacter(prev => prev ? { ...prev, ...updates } : prev);
        toast.success('Personaggio aggiornato con successo'); // Utilizzo di toast
      } catch (error: any) {
        console.error('Error updating character:', error.message, error);
        toast.error('Errore nell\'aggiornare il personaggio'); // Utilizzo di toast
      }
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      await deleteCharacter(characterId);
      if (currentCharacter?.id === characterId) {
        if (characters.length > 1) {
          const remainingCharacters = characters.filter(c => c.id !== characterId);
          setCurrentCharacter(remainingCharacters[0]);
          setCurrentPath('/info');
        } else {
          setCurrentCharacter(null);
          setCurrentPath('/info'); // Reindirizza alla creazione del personaggio
        }
      }
      toast.success('Personaggio eliminato con successo'); // Utilizzo di toast
    } catch (error: any) {
      console.error('Error deleting character:', error.message, error);
      toast.error('Errore nell\'eliminare il personaggio'); // Utilizzo di toast
    }
  };

  const renderContent = () => {
    if (!user) {
      return <AuthForm />;
    }

    if (!user.emailVerified) {
      return (
        <div className="text-center text-gray-400 mt-12">
          <p>Per favore, verifica la tua email per continuare.</p>
          <p className="mt-2 text-sm">Controlla la tua casella di posta.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (characters.length === 0 || (!currentCharacter && currentPath === '/info')) {
      return <CharacterCreationForm onCreateCharacter={handleCreateCharacter} />;
    }

    if (!currentCharacter) {
      return (
        <div className="text-center text-gray-400 mt-12">
          <p>Seleziona un personaggio dal menu laterale</p>
        </div>
      );
    }

    switch (currentPath) {
      case '/info':
        return (
          <BasicInfo
            character={currentCharacter}
            onUpdate={handleUpdateCharacter}
          />
        );
      case '/stats':
        return (
          <CharacterStats
            characterId={currentCharacter.id} 
            stats={currentCharacter.stats}
            setStats={(newStats) => {
              handleUpdateCharacter({
                stats: newStats
              });
            }}
          />
        );
      case '/skills':
        return (
          <Skills
            characterId={currentCharacter.id}
          />
        );
      case '/spells':
        return (
          <Spells
            character={currentCharacter}
            onUpdate={handleUpdateCharacter}
          />
        );
      case '/diary':
        return (
          <CharacterDiary
            character={currentCharacter}
            onUpdate={handleUpdateCharacter}
          />
        );
      case '/equipment':
        return (
          <Equipment
            equipment={currentCharacter.equipment || []}
            onUpdate={async (equipment) => {
              await handleUpdateCharacter({
                equipment
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sidebar
      activePath={currentPath}
      onNavigate={setCurrentPath}
      currentCharacter={currentCharacter}
      characters={characters}
      onSelectCharacter={setCurrentCharacter}
      onCreateCharacter={() => setCurrentPath('/info')}
      onDeleteCharacter={handleDeleteCharacter}
    >
      {renderContent()}
      <Toaster position="top-right" />
    </Sidebar>
  );
}