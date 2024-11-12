import React, { useState, useEffect, useRef } from 'react';
import { Book, Plus, Search, Tag, X, Edit2, Save, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, getDocs, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface TaggedText {
  text: string;
  tag: string;
  color: string;
}

interface DiaryEntry {
  id: string;
  content: string;
  sessionNumber: number;
  taggedTexts: TaggedText[];
  createdAt: Date;
}

export default function CharacterDiary() {
  const { user } = useAuth();
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [taggedTexts, setTaggedTexts] = useState<TaggedText[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const loadDiary = async () => {
    if (!user) return;
    try {
      const diaryRef = collection(db, 'users', user.uid, 'diary');
      const q = query(diaryRef);
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as DiaryEntry[];
      setDiary(entries.sort((a, b) => b.sessionNumber - a.sessionNumber));
    } catch (error) {
      console.error('Error loading diary:', error);
    }
  };

  useEffect(() => {
    loadDiary();
  }, [user]);

  const handleSave = async () => {
    if (!user || !content.trim()) return;

    try {
      const diaryRef = collection(db, 'users', user.uid, 'diary');
      const sessionNumber = editingSession || Math.max(0, ...diary.map(e => e.sessionNumber)) + 1;

      if (editingSession) {
        const entryToUpdate = diary.find(e => e.sessionNumber === editingSession);
        if (entryToUpdate) {
          const entryRef = doc(db, 'users', user.uid, 'diary', entryToUpdate.id);
          await updateDoc(entryRef, {
            content,
            taggedTexts,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        await addDoc(diaryRef, {
          content,
          sessionNumber,
          taggedTexts,
          createdAt: serverTimestamp()
        });
      }

      setContent('');
      setTaggedTexts([]);
      setIsWriting(false);
      setEditingSession(null);
      loadDiary();
    } catch (error) {
      console.error('Error saving diary entry:', error);
    }
  };

  const renderTaggedContent = (entry: DiaryEntry) => {
    let content = entry.content;
    const tags = entry.taggedTexts || [];

    return (
      <div className="prose prose-invert max-w-none">
        {content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">
            {paragraph}
          </p>
        ))}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-sm rounded-full"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.tag}: {tag.text}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredDiary = diary.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.taggedTexts?.some(tag => 
                           tag.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tag.tag.toLowerCase().includes(searchQuery.toLowerCase())
                         );

    const matchesTag = !selectedTag || 
                      entry.taggedTexts?.some(tag => tag.tag === selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(
    diary.flatMap(entry => entry.taggedTexts?.map(tag => tag.tag) || [])
  ));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Diario dell'Avventura
        </h2>
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                     rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuova Sessione</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      {!isWriting && diary.length > 0 && (
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca nel diario..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
            />
          </div>
          {allTags.length > 0 && (
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 focus:border-purple-500"
            >
              <option value="">Tutti i tag</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Writing Area */}
      {(isWriting || editingSession) && (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi gli appunti della sessione..."
            className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-lg
                     text-gray-100 placeholder-gray-500 focus:border-purple-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setContent('');
                setTaggedTexts([]);
                setIsWriting(false);
                setEditingSession(null);
              }}
              className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                       rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Salva</span>
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredDiary.map(entry => (
          <div
            key={entry.id}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medieval text-gray-200">
                Sessione {entry.sessionNumber}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setContent(entry.content);
                    setTaggedTexts(entry.taggedTexts || []);
                    setEditingSession(entry.sessionNumber);
                    setIsWriting(true);
                  }}
                  className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {deleteConfirmation === entry.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        try {
                          const entryRef = doc(db, 'users', user.uid, 'diary', entry.id);
                          await deleteDoc(entryRef);
                          loadDiary();
                          setDeleteConfirmation(null);
                        } catch (error) {
                          console.error('Error deleting entry:', error);
                        }
                      }}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg 
                               hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Conferma
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation(null)}
                      className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg 
                               hover:bg-white/10 transition-colors text-sm"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmation(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {renderTaggedContent(entry)}
          </div>
        ))}
      </div>

      {diary.length === 0 && !isWriting && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Il diario è vuoto. Inizia a scrivere la tua avventura!</p>
        </div>
      )}
    </div>
  );
}