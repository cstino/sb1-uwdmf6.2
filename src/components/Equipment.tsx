import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, Shield, Sword, ScrollText, Coins, Package, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type ItemType = 'weapon' | 'armor' | 'potion' | 'scroll' | 'coins' | 'other';

interface EquipmentItem {
  id: string;
  type: ItemType;
  name: string;
  description?: string;
  quantity: number;
  effect?: string;
  value?: number;
}

interface EquipmentProps {
  equipment: EquipmentItem[];
  onUpdate: (equipment: EquipmentItem[]) => Promise<void>;
}

const itemTypeInfo = {
  weapon: { label: 'Armi', icon: Sword, color: 'red' },
  armor: { label: 'Armature e Scudi', icon: Shield, color: 'blue' },
  potion: { label: 'Pozioni', icon: Package, color: 'purple' },
  scroll: { label: 'Pergamene', icon: ScrollText, color: 'yellow' },
  coins: { label: 'Monete', icon: Coins, color: 'amber' },
  other: { label: 'Altro', icon: Package, color: 'gray' }
};

export default function Equipment({ equipment, onUpdate }: EquipmentProps) {
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const [itemForm, setItemForm] = useState<Partial<EquipmentItem>>({
    type: 'weapon',
    name: '',
    description: '',
    quantity: 1,
    effect: '',
    value: 0
  });

  const handleSaveItem = async () => {
    if (!itemForm.name) {
      toast.error('Il nome è obbligatorio');
      return;
    }

    try {
      const updatedEquipment = [...equipment];
      
      if (editingItem) {
        const index = updatedEquipment.findIndex(i => i.id === editingItem.id);
        if (index !== -1) {
          updatedEquipment[index] = { ...itemForm, id: editingItem.id } as EquipmentItem;
        }
      } else {
        updatedEquipment.push({
          ...itemForm,
          id: Date.now().toString()
        } as EquipmentItem);
      }

      await onUpdate(updatedEquipment);
      setShowItemModal(false);
      setEditingItem(null);
      setItemForm({
        type: 'weapon',
        name: '',
        description: '',
        quantity: 1,
        effect: '',
        value: 0
      });
      
      toast.success(editingItem ? 'Oggetto modificato' : 'Oggetto aggiunto');
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Errore nel salvare l\'oggetto');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedEquipment = equipment.filter(i => i.id !== itemId);
      await onUpdate(updatedEquipment);
      setDeleteConfirmation(null);
      toast.success('Oggetto eliminato');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Errore nell\'eliminare l\'oggetto');
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedEquipment = filteredEquipment.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<ItemType, EquipmentItem[]>);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Equipaggiamento
        </h2>
        <button
          onClick={() => setShowItemModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 
                   rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuovo Oggetto</span>
        </button>
      </div>

      {/* Search and Filter */}
      {equipment.length > 0 && (
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca oggetti..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | 'all')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-gray-100 focus:border-purple-500"
          >
            <option value="all">Tutti i tipi</option>
            {Object.entries(itemTypeInfo).map(([type, info]) => (
              <option key={type} value={type}>{info.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedEquipment).map(([type, items]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-xl font-medieval text-gray-200 flex items-center gap-2">
              {React.createElement(itemTypeInfo[type as ItemType].icon, {
                className: `w-5 h-5 text-${itemTypeInfo[type as ItemType].color}-400`
              })}
              {itemTypeInfo[type as ItemType].label}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10
                           hover:border-purple-500/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medieval text-gray-200">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setItemForm(item);
                          setShowItemModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirmation === item.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
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
                          onClick={() => setDeleteConfirmation(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <div className="text-gray-400">
                      Quantità: <span className="text-gray-200">{item.quantity}</span>
                    </div>
                    {item.value !== undefined && (
                      <div className="text-gray-400">
                        Valore: <span className="text-gray-200">{item.value} mo</span>
                      </div>
                    )}
                  </div>
                  {item.effect && (
                    <div className="mt-2 text-sm text-gray-400">
                      Effetto: <span className="text-gray-300">{item.effect}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {equipment.length === 0 && !showItemModal && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nessun oggetto. Aggiungi il tuo primo oggetto!</p>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-medieval text-purple-400 mb-6">
              {editingItem ? 'Modifica Oggetto' : 'Nuovo Oggetto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo di Oggetto
                </label>
                <select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as ItemType })}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                           text-gray-100 focus:border-purple-500"
                >
                  {Object.entries(itemTypeInfo).map(([type, info]) => (
                    <option key={type} value={type}>{info.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                           text-gray-100 focus:border-purple-500"
                  placeholder="Nome dell'oggetto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                           text-gray-100 focus:border-purple-500 resize-none"
                  placeholder="Descrizione dell'oggetto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Quantità
                  </label>
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                             text-gray-100 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Valore (mo)
                  </label>
                  <input
                    type="number"
                    value={itemForm.value}
                    onChange={(e) => setItemForm({ ...itemForm, value: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                             text-gray-100 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Effetto
                </label>
                <textarea
                  value={itemForm.effect}
                  onChange={(e) => setItemForm({ ...itemForm, effect: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-lg
                           text-gray-100 focus:border-purple-500 resize-none"
                  placeholder="Effetto dell'oggetto (se presente)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                  setItemForm({
                    type: 'weapon',
                    name: '',
                    description: '',
                    quantity: 1,
                    effect: '',
                    value: 0
                  });
                }}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveItem}
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