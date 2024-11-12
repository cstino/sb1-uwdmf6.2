// src/components/Capabilities.tsx

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  RefreshCw
} from 'lucide-react';
import type { Capability } from '../types';
import toast from 'react-hot-toast';

interface CapabilitiesProps {
  capabilities: Capability[];
  onUpdate: (capabilities: Capability[]) => void;
}

export default function Capabilities({ capabilities, onUpdate }: CapabilitiesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCapability, setNewCapability] = useState<Partial<Capability>>({
    name: '',
    description: '',
    dailyUses: 1,
    used: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCapability, setEditCapability] = useState<Partial<Capability>>({});

  // Aggiungi una nuova capacità
  const handleAddCapability = () => {
    if (!newCapability.name.trim() || !newCapability.description.trim() || !newCapability.dailyUses) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    const capability: Capability = {
      id: Date.now().toString(),
      name: newCapability.name.trim(),
      description: newCapability.description.trim(),
      dailyUses: newCapability.dailyUses,
      used: 0,
    };

    onUpdate([...capabilities, capability]);
    setNewCapability({ name: '', description: '', dailyUses: 1, used: 0 });
    setIsAdding(false);
    toast.success('Capacità aggiunta');
  };

  // Modifica una capacità esistente
  const handleEditCapability = () => {
    if (!editCapability.name.trim() || !editCapability.description.trim() || editCapability.dailyUses === undefined) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    const updatedCapabilities = capabilities.map(cap =>
      cap.id === editingId
        ? {
            ...cap,
            name: editCapability.name.trim(),
            description: editCapability.description.trim(),
            dailyUses: editCapability.dailyUses,
            used: Math.min(cap.used, editCapability.dailyUses),
          }
        : cap
    );

    onUpdate(updatedCapabilities);
    setEditingId(null);
    setEditCapability({});
    toast.success('Capacità modificata');
  };

  // Elimina una capacità
  const handleDeleteCapability = (id: string) => {
    const updatedCapabilities = capabilities.filter(cap => cap.id !== id);
    onUpdate(updatedCapabilities);
    toast.success('Capacità eliminata');
  };

  // Usa una capacità incrementando il contatore
  const handleUseCapability = (id: string) => {
    const updatedCapabilities = capabilities.map(cap =>
      cap.id === id && cap.used < cap.dailyUses ? { ...cap, used: cap.used + 1 } : cap
    );
    onUpdate(updatedCapabilities);
    toast.success('Capacità utilizzata');
  };

  // Reset degli usi giornalieri di tutte le capacità
  const handleResetAllUses = () => {
    const updatedCapabilities = capabilities.map(cap => ({ ...cap, used: 0 }));
    onUpdate(updatedCapabilities);
    toast.success('Usi delle capacità resettati');
  };

  // Reset di una singola capacità
  const handleResetUse = (id: string) => {
    const updatedCapabilities = capabilities.map(cap =>
      cap.id === id ? { ...cap, used: 0 } : cap
    );
    onUpdate(updatedCapabilities);
    toast.success('Uso della capacità resettato');
  };

  return (
    <div className="space-y-6">
      {/* Intestazione con Titolo e Pulsanti */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-300">Capacità</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllUses}
            className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 
                       rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
            title="Reset Usi Giornalieri"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Usi</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 
                       rounded-lg hover:bg-green-500/30 transition-colors text-sm"
            title="Aggiungi Nuova Capacità"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        </div>
      </div>

      {/* Lista delle Capacità */}
      <div className="space-y-4">
        {capabilities.map(cap => (
          <div key={cap.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
            {editingId === cap.id ? (
              // Modulo di Modifica Capacità
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editCapability.name}
                  onChange={(e) => setEditCapability({ ...editCapability, name: e.target.value })}
                  placeholder="Nome"
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={editCapability.description}
                  onChange={(e) => setEditCapability({ ...editCapability, description: e.target.value })}
                  placeholder="Descrizione"
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <input
                  type="number"
                  min="1"
                  value={editCapability.dailyUses}
                  onChange={(e) => setEditCapability({ ...editCapability, dailyUses: Number(e.target.value) })}
                  placeholder="Usi Giornalieri"
                  className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ) : (
              // Visualizzazione delle Capacità
              <div className="flex-1">
                <h4 className="text-gray-200 font-semibold">{cap.name}</h4>
                <p className="text-gray-400 text-sm">{cap.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {Array.from({ length: cap.dailyUses }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUseCapability(cap.id)}
                      disabled={idx < cap.used}
                      className={`w-4 h-4 rounded-full transition-colors duration-200 
                                 ${idx < cap.used 
                                    ? 'bg-gradient-to-r from-purple-400 to-blue-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-400 to-green-500 hover:opacity-80'}`}
                      title={`Uso ${idx + 1}`}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Usati: {cap.used} / {cap.dailyUses}
                </p>
              </div>
            )}

            {/* Pulsanti di Azione */}
            <div className="flex items-center gap-2">
              {editingId === cap.id ? (
                <>
                  <button
                    onClick={handleEditCapability}
                    className="p-1 text-green-400 hover:text-green-500 transition-colors"
                    title="Salva Modifiche"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditCapability({});
                    }}
                    className="p-1 text-red-400 hover:text-red-500 transition-colors"
                    title="Annulla Modifiche"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleResetUse(cap.id)}
                    className="p-1 text-yellow-400 hover:text-yellow-500 transition-colors"
                    title="Reset Usa Capacità"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(cap.id);
                      setEditCapability({
                        name: cap.name,
                        description: cap.description,
                        dailyUses: cap.dailyUses,
                      });
                    }}
                    className="p-1 text-purple-400 hover:text-purple-500 transition-colors"
                    title="Modifica Capacità"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCapability(cap.id)}
                    className="p-1 text-red-400 hover:text-red-500 transition-colors"
                    title="Elimina Capacità"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modale per Aggiungere una Capacità */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-medieval text-green-400 mb-4">Aggiungi Capacità</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newCapability.name}
                onChange={(e) => setNewCapability({ ...newCapability, name: e.target.value })}
                placeholder="Nome"
                className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                value={newCapability.description}
                onChange={(e) => setNewCapability({ ...newCapability, description: e.target.value })}
                placeholder="Descrizione"
                className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <input
                type="number"
                min="1"
                value={newCapability.dailyUses}
                onChange={(e) => setNewCapability({ ...newCapability, dailyUses: Number(e.target.value) })}
                placeholder="Usi Giornalieri"
                className="w-full p-2 bg-transparent border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCapability({ name: '', description: '', dailyUses: 1, used: 0 });
                }}
                className="px-4 py-2 text-red-400 hover:text-red-500 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddCapability}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 
                           rounded-lg hover:bg-green-500/30 transition-colors"
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