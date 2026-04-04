import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import BottomSheet from '../components/BottomSheet';

const FILTERS = ['All', 'Saved', 'Imported', 'Family Recipe'];

const SOURCE_MAP = {
  'Saved':        'Saved',
  'Imported':     'Imported',
  'Family Recipe':'Family Recipe',
};

const ADD_OPTIONS = [
  { icon: '📎', label: 'Import from URL',    sub: 'Paste a link from any recipe site' },
  { icon: '📷', label: 'Scan a recipe card', sub: 'Take a photo of a recipe'          },
  { icon: '✏️', label: 'Enter manually',      sub: 'Type ingredients and steps'        },
  { icon: '✨', label: 'Little Chef Original (AI)',  sub: 'Let Little Chef create a recipe for you'  },
];

export default function RecipeLibrary() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { recipes, addToast } = useApp();

  const filtered = recipes
    .filter(r => filter === 'All' || r.source === SOURCE_MAP[filter])
    .filter(r => !search.trim() || r.title.toLowerCase().includes(search.toLowerCase()) ||
                 r.cuisine.toLowerCase().includes(search.toLowerCase()));

  const handleAddOption = () => {
    setSheetOpen(false);
    setTimeout(() => addToast('Recipe saved to your library', 'success'), 300);
  };

  return (
    <div className="bg-bg min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-s3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-serif text-2xl font-bold text-t1">My Recipes</h1>
          <span className="bg-s2 text-t2 text-xs rounded-full px-2.5 py-0.5 border border-s3 font-semibold">
            {recipes.length}
          </span>
        </div>
        <p className="text-t3 text-xs">Your personal cookbook</p>
      </div>

      {/* Search */}
      <div className="px-5 pt-3 pb-2">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15"
            viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your recipes..."
            className="w-full bg-s2 border border-s3 rounded-xl pl-10 pr-4 py-2.5 text-t1 text-sm
              placeholder-t3 focus:border-terra outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-t3 text-lg leading-none active:text-t1">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 py-2 border-b border-s3">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95
              ${filter === f ? 'bg-terra text-white' : 'bg-s2 text-t2 border border-s3'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8 gap-3">
          {search ? (
            <>
              <span className="text-5xl">🔍</span>
              <p className="text-t1 font-bold text-base text-center">No results for "{search}"</p>
              <p className="text-t3 text-sm text-center">Try a different name or cuisine</p>
              <button onClick={() => setSearch('')}
                className="mt-2 text-terra text-sm font-semibold active:opacity-70">
                Clear search
              </button>
            </>
          ) : (
            <>
              <span className="text-5xl">📖</span>
              <p className="text-t1 font-bold text-base text-center">No {filter === 'All' ? '' : filter} recipes yet</p>
              <p className="text-t3 text-sm text-center leading-relaxed">
                Tap the <span className="text-terra font-bold">+</span> button to add your first recipe
              </p>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="absolute bottom-24 right-5 w-14 h-14 bg-terra rounded-full flex items-center justify-center
          shadow-[0_0_20px_rgba(212,101,74,0.4)] active:scale-90 transition-transform z-20 text-white text-2xl font-bold"
      >
        +
      </button>

      {/* Add recipe sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Recipe">
        <div className="p-4 flex flex-col gap-3">
          {ADD_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => handleAddOption(opt.label)}
              className="flex items-center gap-4 bg-s2 border border-s3 rounded-xl p-4
                active:bg-s3 transition-colors text-left"
            >
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <p className="text-t1 font-semibold text-sm">{opt.label}</p>
                <p className="text-t3 text-xs mt-0.5">{opt.sub}</p>
              </div>
            </button>
          ))}
          <div className="h-4" />
        </div>
      </BottomSheet>
    </div>
  );
}
