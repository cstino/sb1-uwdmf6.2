import React from 'react';
import { Plus, Minus, RefreshCw } from 'lucide-react';
import type { SpellSlot } from '../types';

interface SpellSlotsProps {
  slots: SpellSlot[];
  onUpdate: (slots: SpellSlot[]) => void;
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

export default function SpellSlots({ slots, onUpdate }: SpellSlotsProps) {
  const handleSlotClick = (levelIndex: number, slotIndex: number) => {
    const updatedSlots = [...slots];
    const slot = updatedSlots[levelIndex];
    const usedArray = Array(slot.total).fill(false)
      .map((_, i) => i < slot.used);
    
    usedArray[slotIndex] = !usedArray[slotIndex];
    slot.used = usedArray.filter(Boolean).length;
    
    onUpdate(updatedSlots);
  };

  const handleAddSlot = (levelIndex: number) => {
    const updatedSlots = [...slots];
    updatedSlots[levelIndex].total += 1;
    onUpdate(updatedSlots);
  };

  const handleRemoveSlot = (levelIndex: number) => {
    const updatedSlots = [...slots];
    const slot = updatedSlots[levelIndex];
    if (slot.total > 0) {
      slot.total -= 1;
      slot.used = Math.min(slot.used, slot.total);
      onUpdate(updatedSlots);
    }
  };

  const handleResetLevel = (levelIndex: number) => {
    const updatedSlots = [...slots];
    updatedSlots[levelIndex].used = 0;
    onUpdate(updatedSlots);
  };

  const handleResetAll = () => {
    const updatedSlots = slots.map(slot => ({
      ...slot,
      used: 0
    }));
    onUpdate(updatedSlots);
  };

  const renderLevelGroup = (startIndex: number, endIndex: number) => (
    <div className="space-y-3">
      {slots.slice(startIndex, endIndex).map((slot, idx) => {
        const levelIndex = startIndex + idx;
        return (
          <div key={levelIndex} className="flex items-center gap-2">
            <div className={`w-20 text-lg font-medieval bg-gradient-to-r ${SLOT_COLORS[levelIndex]} bg-clip-text text-transparent`}>
              Liv. {levelIndex}
            </div>
            <div className="flex-1 flex items-center gap-1">
              {Array.from({ length: slot.total }).map((_, slotIndex) => (
                <button
                  key={slotIndex}
                  onClick={() => handleSlotClick(levelIndex, slotIndex)}
                  className={`h-2 flex-1 rounded-full transition-all duration-200 ${
                    slotIndex < slot.used
                      ? 'bg-gray-600'
                      : `bg-gradient-to-r ${SLOT_COLORS[levelIndex]} hover:opacity-80`
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleResetLevel(levelIndex)}
                className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleRemoveSlot(levelIndex)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleAddSlot(levelIndex)}
                className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 
                   rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Ripristina Tutti</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {renderLevelGroup(0, 5)}
        {renderLevelGroup(5, 10)}
      </div>
    </div>
  );
}