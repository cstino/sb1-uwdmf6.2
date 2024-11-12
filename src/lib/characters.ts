import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import type { Character } from '../types';
import toast from 'react-hot-toast';

export const saveCharacter = async (userId: string, character: Character): Promise<void> => {
  try {
    const userCharactersRef = collection(db, 'users', userId, 'characters');
    
    // Ensure saves are initialized
    if (!character.stats.saves) {
      character.stats.saves = {
        fortitude: 0,
        reflex: 0,
        will: 0
      };
    }
    
    const characterData = {
      ...character,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(userCharactersRef, characterData);
    
    await updateDoc(docRef, { 
      id: docRef.id,
      updatedAt: serverTimestamp()
    });
    
    character.id = docRef.id;
  } catch (error) {
    console.error('Error saving character:', error);
    throw new Error('Impossibile salvare il personaggio. Riprova più tardi.');
  }
};

export const getCharacters = async (userId: string): Promise<Character[]> => {
  try {
    const userCharactersRef = collection(db, 'users', userId, 'characters');
    const q = query(userCharactersRef);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Character[];
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw new Error('Impossibile caricare i personaggi. Riprova più tardi.');
  }
};

export const updateCharacter = async (characterId: string, updates: Partial<Character>, userId: string): Promise<void> => {
  try {
    const characterRef = doc(db, 'users', userId, 'characters', characterId);
    const { id, createdAt, updatedAt, ...updateData } = updates as any;
    
    // Ensure saves are included in the update
    if (updateData.stats && !updateData.stats.saves) {
      updateData.stats.saves = {
        fortitude: 0,
        reflex: 0,
        will: 0
      };
    }
    
    await updateDoc(characterRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating character:', error);
    throw new Error('Impossibile aggiornare il personaggio. Riprova più tardi.');
  }
};

export const deleteCharacter = async (userId: string, characterId: string): Promise<void> => {
  try {
    const characterRef = doc(db, 'users', userId, 'characters', characterId);
    await deleteDoc(characterRef);
  } catch (error) {
    console.error('Error deleting character:', error);
    throw new Error('Impossibile eliminare il personaggio. Riprova più tardi.');
  }
};