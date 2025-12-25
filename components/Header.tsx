
import React from 'react';
import { ICONS } from '../constants.tsx';
import { SortOption } from '../types';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenSettings: () => void;
  onOpenCreator: () => void;
  isSyncEnabled: boolean;
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onOpenSettings, 
  onOpenCreator, 
  isSyncEnabled,
  sortBy,
  onSortChange
}) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 pt-8 pb-4 mb-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Notes</h1>
            {isSyncEnabled ? (
              <div 
                onClick={onOpenSettings}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                Owner Verified
              </div>
            ) : (
              <div 
                onClick={onOpenSettings}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full border border-slate-100 hover:bg-slate-100"
              >
                Guest Mode
              </div>
            )}
          </div>
          <p className="text-lg text-slate-500 font-light max-w-2xl">
            {isSyncEnabled ? 'Administrative access active. Changes will sync to GitHub.' : 'Read-only public access to the knowledge repository.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto pb-1">
          <div className="relative flex-1 md:w-64">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter topics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-white transition-all"
            >
              <option value="alpha-asc">A-Z</option>
              <option value="alpha-desc">Z-A</option>
              <option value="newest">Newest</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {isSyncEnabled && (
            <button 
              onClick={onOpenCreator}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm font-bold animate-in zoom-in duration-300"
            >
              <ICONS.Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
