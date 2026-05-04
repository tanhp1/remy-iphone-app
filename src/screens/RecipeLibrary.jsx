import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

export default function RecipeLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allRecipes, cookbooks } = useApp();

  const cookbookId = searchParams.get('cookbook');
  const activeCookbook = cookbooks.find(cb => cb.id === cookbookId) ?? null;

  const [selectedCookbook, setSelectedCookbook] = useState(activeCookbook?.id ?? 'all');
  const [search, setSearch] = useState('');

  const currentCookbook = cookbooks.find(cb => cb.id === selectedCookbook);
  const visibleIds = currentCookbook ? currentCookbook.recipeIds : null;

  const filtered = allRecipes
    .filter(r => !visibleIds || visibleIds.includes(r.id))
    .filter(r => !search.trim()
      || r.title.toLowerCase().includes(search.toLowerCase())
      || r.cuisine.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-bg min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-s3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-serif text-2xl font-bold text-t1">Recipes</h1>
          <button
            onClick={() => navigate('/import')}
            className="w-8 h-8 bg-terra rounded-full flex items-center justify-center
              shadow-[0_0_12px_rgba(212,101,74,0.35)] active:scale-90 transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <p className="text-t3 text-xs">{allRecipes.length} recipes across {cookbooks.length} {cookbooks.length === 1 ? 'cookbook' : 'cookbooks'}</p>
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
            placeholder="Search recipes..."
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

      {/* Cookbook filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 py-2 border-b border-s3">
        <button
          onClick={() => setSelectedCookbook('all')}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95
            ${selectedCookbook === 'all' ? 'bg-terra text-white' : 'bg-s2 text-t2 border border-s3'}`}
        >
          All
        </button>
        {cookbooks.map(cb => (
          <button
            key={cb.id}
            onClick={() => setSelectedCookbook(cb.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95
              ${selectedCookbook === cb.id ? 'bg-terra text-white' : 'bg-s2 text-t2 border border-s3'}`}
          >
            <span>{cb.emoji}</span> {cb.name}
          </button>
        ))}
      </div>

      {/* Grid or empty */}
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
              <button onClick={() => setSearch('')} className="text-terra text-sm font-semibold">Clear search</button>
            </>
          ) : (
            <>
              <span className="text-5xl">📖</span>
              <p className="text-t1 font-bold text-base text-center">No recipes yet</p>
              <p className="text-t3 text-sm text-center">Add your first recipe to this cookbook</p>
              <button
                onClick={() => navigate('/import')}
                className="mt-2 bg-terra text-white rounded-xl px-5 py-2.5 text-sm font-semibold active:scale-95 transition-transform"
              >
                + Add recipe
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
