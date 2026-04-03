import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import BottomSheet from '../components/BottomSheet';

const FILTERS = ['All', 'Remy Originals', 'Imported', 'Family Recipe'];

const SOURCE_MAP = {
  'Remy Originals': 'Remy Original',
  'Imported':       'Imported',
  'Family Recipe':  'Family Recipe',
};

const ADD_OPTIONS = [
  { icon: '📎', label: 'Import from URL',     sub: 'Paste a link from any recipe site'  },
  { icon: '📷', label: 'Scan a recipe card',  sub: 'Take a photo of a recipe'           },
  { icon: '✏️', label: 'Enter manually',       sub: 'Type ingredients and steps'         },
  { icon: '✨', label: 'Remy Original (AI)',   sub: 'Let Remy create a recipe for you'   },
];

export default function RecipeLibrary() {
  const [filter, setFilter] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { recipes, addToast } = useApp();

  const filtered = filter === 'All'
    ? recipes
    : recipes.filter(r => r.source === SOURCE_MAP[filter]);

  const handleAddOption = (label) => {
    setSheetOpen(false);
    setTimeout(() => addToast('Recipe saved to your library', 'success'), 300);
  };

  return (
    <div className="bg-bg min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-4 pb-4 border-b border-s3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-serif text-2xl font-bold text-t1">My Recipes</h1>
          <span className="bg-s2 text-t2 text-xs rounded-full px-2.5 py-0.5 border border-s3 font-semibold">
            {recipes.length}
          </span>
        </div>
        <p className="text-t3 text-xs">Personalized to your Keto lifestyle</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 py-3 border-b border-s3">
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

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </div>

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
