import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type Character } from '../types';
import toast from 'react-hot-toast';

export function useCharacters(userId: string | undefined) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    const loadCharacters = async () => {
      try {
        const userCharactersRef = collection(db, 'users', userId, 'characters');
        const q = query(userCharactersRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const loadedCharacters = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Character[];
        
        setCharacters(loadedCharacters);
      } catch (error) {
        console.error('Error loading characters:', error);
        toast.error('Errore nel caricamento dei personaggi');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [userId]);

  const createCharacter = async (character: Character) => {
    if (!userId) return null;
    
    try {
      const userCharactersRef = collection(db, 'users', userId, 'characters');
      const { id, ...characterData } = character;
      
      const docRef = await addDoc(userCharactersRef, {
        ...characterData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newCharacter = { 
        ...character, 
        id: docRef.id,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCharacters(prev => [newCharacter, ...prev]);
      toast.success('Personaggio creato con successo!');
      return newCharacter;
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Errore nella creazione del personaggio');
      return null;
    }
  };

  const updateCharacter = async (characterId: string, updates: Partial<Character>) => {
    if (!userId) return;
    
    try {
      const characterRef = doc(db, 'users', userId, 'characters', characterId);
      const { id, createdAt, updatedAt, ...updateData } = updates as any;
      
      // Ensure we're updating the entire stats object
      await updateDoc(characterRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setCharacters(prev => 
        prev.map(c => c.id === characterId ? { 
          ...c,
          ...updates,
          updatedAt: new Date()
        } : c)
      );
      
      toast.success('Personaggio aggiornato con successo');
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Errore nell\'aggiornamento del personaggio');
      throw error;
    }
  };

  const deleteCharacter = async (characterId: string) => {
    if (!userId) return;
    
    try {
      const characterRef = doc(db, 'users', userId, 'characters', characterId);
      await deleteDoc(characterRef);
      setCharacters(prev => prev.filter(c => c.id !== characterId));
      toast.success('Personaggio eliminato con successo');
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Errore nell\'eliminazione del personaggio');
      throw error;
    }
  };

  return {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter
  };
}