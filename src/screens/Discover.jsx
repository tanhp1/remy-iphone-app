import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DISCOVER_RECIPES } from '../data/recipes';

const CUISINES = ['All', 'Italian', 'Japanese', 'French', 'Thai', 'Vietnamese', 'Indian', 'Korean', 'Mexican'];
const SERVINGS_OPTIONS = ['Any', '1–2', '3–4', '5+'];
const COST_OPTIONS = ['Any', '$', '$$', '$$$'];

function StarRow({ value, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? '#D4654A' : 'none'}
          stroke="#D4654A" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-t2 text-[10px] ml-0.5">{value.toFixed(1)}</span>
      {count && <span className="text-t3 text-[10px]">({count.toLocaleString()})</span>}
    </div>
  );
}

function DiscoverCard({ recipe, pantryMatch }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-s1 border border-s3 rounded-2xl overflow-hidden active:scale-98 transition-transform cursor-pointer"
    >
      <div className="h-32 flex items-center justify-center relative" style={{ backgroundColor: recipe.color }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
        <span className="text-5xl drop-shadow-xl relative z-10">{recipe.emoji}</span>
        {recipe.isChefRecipe && (
          <div className="absolute top-2 left-2 z-20 bg-terra text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>👨‍🍳</span> Chef's Pick
          </div>
        )}
        {recipe.source === 'Community' && (
          <div className="absolute top-2 left-2 z-20 bg-s1/80 text-t1 text-[10px] font-bold px-2.5 py-1 rounded-full">
            Community
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3 z-10">
          {pantryMatch !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${pantryMatch}%` }} />
              </div>
              <span className="text-white text-[10px] font-bold">{pantryMatch}%</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-t1 font-bold text-sm leading-snug mb-1">{recipe.title}</p>
        <p className="text-t3 text-xs mb-2">{recipe.cuisine} · {recipe.prepTime + recipe.cookTime} min · {recipe.servings} servings · {recipe.cost}</p>
        {recipe.rating && <StarRow value={recipe.rating.overall} count={recipe.rating.count} />}
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.dietaryTags.slice(0, 2).map(t => (
            <span key={t} className="bg-s2 text-t2 border border-s3 rounded-full px-2 py-0.5 text-[10px] font-medium">
              {t}
            </span>
          ))}
          <span className="bg-terra/15 text-terra border border-terra/25 rounded-full px-2 py-0.5 text-[10px] font-medium">
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const { pantry } = useApp();
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [servings, setServings] = useState('Any');
  const [cost, setCost] = useState('Any');
  const [sortBy, setSortBy] = useState('match');

  const pantryNames = pantry.map(p => p.name.toLowerCase());

  const withMatch = useMemo(() => DISCOVER_RECIPES.map(r => {
    const matched = r.ingredients.filter(ing =>
      pantryNames.some(p => p.includes(ing.item.toLowerCase()) || ing.item.toLowerCase().includes(p))
    ).length;
    return { ...r, pantryMatchPct: Math.round((matched / r.ingredients.length) * 100) };
  }), [pantry]);

  const filtered = useMemo(() => {
    return withMatch.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
          !r.cuisine.toLowerCase().includes(search.toLowerCase())) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (servings !== 'Any') {
        const s = r.servings;
        if (servings === '1–2' && s > 2) return false;
        if (servings === '3–4' && (s < 3 || s > 4)) return false;
        if (servings === '5+' && s < 5) return false;
      }
      if (cost !== 'Any' && r.cost !== cost) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') return b.pantryMatchPct - a.pantryMatchPct;
      if (sortBy === 'rating') return (b.rating?.overall ?? 0) - (a.rating?.overall ?? 0);
      if (sortBy === 'time') return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      return 0;
    });
  }, [withMatch, search, cuisine, servings, cost, sortBy]);

  const chefRecipes = filtered.filter(r => r.isChefRecipe);
  const otherRecipes = filtered.filter(r => !r.isChefRecipe);

  return (
    <div className="bg-bg min-h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-serif text-2xl font-bold text-t1">Discover</h1>
          <button
            onClick={() => navigate('/upload-recipe')}
            className="flex items-center gap-1.5 bg-terra/15 border border-terra/30 text-terra text-xs font-semibold
              px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            + Upload Recipe
          </button>
        </div>
        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-t3" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full bg-s2 border border-s3 rounded-xl pl-10 pr-4 py-3 text-t1 text-sm
              placeholder-t3 focus:border-terra outline-none"
          />
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="flex-shrink-0 bg-s2 border border-s3 text-t2 text-xs font-semibold rounded-full px-3 py-1.5
              outline-none appearance-none cursor-pointer"
          >
            <option value="match">🥗 Pantry match</option>
            <option value="rating">⭐ Top rated</option>
            <option value="time">⏱ Quickest</option>
          </select>

          {/* Cuisine */}
          <select
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
            className="flex-shrink-0 bg-s2 border border-s3 text-t2 text-xs font-semibold rounded-full px-3 py-1.5
              outline-none appearance-none cursor-pointer"
          >
            {CUISINES.map(c => <option key={c} value={c}>{c === 'All' ? '🌍 Cuisine' : c}</option>)}
          </select>

          {/* Servings */}
          <select
            value={servings}
            onChange={e => setServings(e.target.value)}
            className="flex-shrink-0 bg-s2 border border-s3 text-t2 text-xs font-semibold rounded-full px-3 py-1.5
              outline-none appearance-none cursor-pointer"
          >
            {SERVINGS_OPTIONS.map(s => <option key={s} value={s}>{s === 'Any' ? '👥 Servings' : `${s} people`}</option>)}
          </select>

          {/* Cost */}
          <select
            value={cost}
            onChange={e => setCost(e.target.value)}
            className="flex-shrink-0 bg-s2 border border-s3 text-t2 text-xs font-semibold rounded-full px-3 py-1.5
              outline-none appearance-none cursor-pointer"
          >
            {COST_OPTIONS.map(c => <option key={c} value={c}>{c === 'Any' ? '💰 Cost' : c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-24">
        {/* Chef's picks */}
        {chefRecipes.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">👨‍🍳</span>
              <p className="text-t1 font-bold text-sm">Chef's Picks</p>
              <div className="flex-1 h-px bg-s3" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {chefRecipes.map(r => (
                <DiscoverCard key={r.id} recipe={r} pantryMatch={r.pantryMatchPct} />
              ))}
            </div>
          </div>
        )}

        {/* All recipes */}
        {otherRecipes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-t1 font-bold text-sm">All Recipes</p>
              <span className="bg-s2 border border-s3 text-t3 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {otherRecipes.length}
              </span>
              <div className="flex-1 h-px bg-s3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {otherRecipes.map(r => (
                <DiscoverCard key={r.id} recipe={r} pantryMatch={r.pantryMatchPct} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">🔍</span>
            <p className="text-t2 text-sm font-semibold">No recipes found</p>
            <p className="text-t3 text-xs text-center">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
