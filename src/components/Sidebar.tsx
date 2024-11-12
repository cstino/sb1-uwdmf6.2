import React, { useState } from 'react';
import { ScrollText, BookOpen, Backpack, User, LogOut, LogIn, Settings, ChevronRight, Book, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CharacterSelector from './CharacterSelector';
import type { Character } from '../types';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { name: 'Info Base', icon: <User className="w-5 h-5" />, path: '/info' },
  { name: 'Caratteristiche', icon: <ScrollText className="w-5 h-5" />, path: '/stats' },
  { name: 'Abilità', icon: <BookOpen className="w-5 h-5" />, path: '/skills' },
  { name: 'Incantesimi', icon: <Wand2 className="w-5 h-5" />, path: '/spells' },
  { name: 'Equipaggiamento', icon: <Backpack className="w-5 h-5" />, path: '/equipment' },
  { name: 'Diario', icon: <Book className="w-5 h-5" />, path: '/diary' }
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  currentCharacter: Character | null;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  onDeleteCharacter: (characterId: string) => Promise<void>;
  children?: React.ReactNode;
}

export default function Sidebar({
  activePath,
  onNavigate,
  currentCharacter,
  characters,
  onSelectCharacter,
  onCreateCharacter,
  onDeleteCharacter,
  children
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar */}
      <div className={`h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10 
                      fixed left-0 top-0 flex flex-col transition-all duration-300
                      ${isExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex-1 p-4">
          {/* Toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-center mb-2 p-2 rounded-lg bg-white/5 border border-white/10 
                     hover:bg-white/10 transition-all"
          >
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 
                                  ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <ScrollText className="w-8 h-8 text-purple-400" />
            <h1 className={`text-xl font-medieval bg-gradient-to-r from-purple-400 to-blue-500 
                         bg-clip-text text-transparent transition-opacity duration-200
                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              D&D 3.5e
            </h1>
          </div>

          {isExpanded && (
            <div className="mb-6">
              <CharacterSelector
                characters={characters}
                currentCharacter={currentCharacter}
                onSelectCharacter={onSelectCharacter}
                onCreateCharacter={onCreateCharacter}
                onDeleteCharacter={onDeleteCharacter}
              />
            </div>
          )}
          
          {characters.length > 0 && (
            <nav className="space-y-2">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`group cursor-pointer transition-colors duration-200
                            ${!isExpanded 
                              ? 'w-full h-10 flex items-center justify-center' 
                              : 'w-full px-3 py-2 flex items-center'}
                            ${activePath === item.path 
                              ? 'text-purple-400' 
                              : 'text-gray-400 hover:text-purple-400'}`}
                >
                  <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
                    {React.cloneElement(item.icon, {
                      className: `w-5 h-5 transition-colors duration-200 ${
                        activePath === item.path ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                      }`
                    })}
                    <span className={`font-medium whitespace-nowrap transition-opacity duration-200
                                  ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Account Section */}
        <div className="p-4 border-t border-white/10">
          {user ? (
            <div className="space-y-2">
              {isExpanded && (
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
              <div className={`grid ${isExpanded ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                <button
                  onClick={() => onNavigate('/settings')}
                  className="flex items-center justify-center gap-2 h-10 text-gray-400 
                           hover:text-purple-400 transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  {isExpanded && <span>Account</span>}
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 h-10 text-gray-400 
                           hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {isExpanded && <span>Esci</span>}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {isExpanded && <span className="font-medium">Accedi</span>}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className={`min-h-screen p-8 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-16'}`}>
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}