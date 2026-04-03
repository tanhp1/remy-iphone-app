import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RECIPES } from '../data/recipes';
import { PANTRY_INITIAL } from '../data/pantry';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Score each recipe by how many ingredients the pantry covers
function getPantryMatches(recipes, pantry) {
  const pantryNames = pantry.map(p => p.name.toLowerCase());
  return recipes
    .map(r => {
      const matched = r.ingredients.filter(ing =>
        pantryNames.some(p => p.includes(ing.item.toLowerCase()) || ing.item.toLowerCase().includes(p))
      ).length;
      const pct = Math.round((matched / r.ingredients.length) * 100);
      return { ...r, pantryMatch: pct, pantryMatched: matched };
    })
    .sort((a, b) => b.pantryMatch - a.pantryMatch);
}

// ─── Voice button ───────────────────────────────────────────
function VoiceButton() {
  const [listening, setListening] = useState(false);

  const toggle = () => setListening(v => !v);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        {listening && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-terra/10 animate-ping" />
            <div className="absolute w-20 h-20 rounded-full bg-terra/15 animate-ping"
              style={{ animationDelay: '0.2s' }} />
          </>
        )}
        <button
          onClick={toggle}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-200 z-10
            ${listening
              ? 'bg-terra scale-110 shadow-[0_0_32px_rgba(212,101,74,0.7)]'
              : 'bg-terra shadow-[0_0_20px_rgba(212,101,74,0.45)] active:scale-95'
            }`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8"  y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      </div>
      {listening ? (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-terra animate-pulse" />
          <p className="text-xs font-semibold text-terra">Remy is listening</p>
        </div>
      ) : (
        <p className="text-xs font-semibold text-t3">Ask Remy</p>
      )}
    </div>
  );
}

// ─── Start Cooking button ───────────────────────────────────
function StartCookingButton({ recipes, pantry }) {
  const navigate = useNavigate();
  const pantryNames = pantry.map(p => p.name.toLowerCase());
  const top = recipes
    .map(r => {
      const matched = r.ingredients.filter(ing =>
        pantryNames.some(p => p.includes(ing.item.toLowerCase()) || ing.item.toLowerCase().includes(p))
      ).length;
      return { ...r, pct: Math.round((matched / r.ingredients.length) * 100) };
    })
    .sort((a, b) => b.pct - a.pct)[0];

  const handlePress = () => {
    if (top) navigate(`/recipes/${top.id}/cook`);
    else navigate('/recipes');
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handlePress}
        className="w-16 h-16 rounded-full bg-s2 border-2 border-terra flex items-center justify-center
          shadow-[0_0_16px_rgba(212,101,74,0.3)] active:scale-95 transition-all duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#D4654A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </button>
      <p className="text-xs font-semibold text-t3">Start cooking</p>
    </div>
  );
}

// ─── Recipe card (tall, pantry-aware) ──────────────────────
function PantryRecipeCard({ recipe }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="flex-shrink-0 w-[200px] bg-s1 border border-s3 rounded-3xl overflow-hidden
        active:scale-95 transition-transform duration-100 cursor-pointer shadow-lg"
    >
      {/* Color hero */}
      <div className="h-44 flex items-center justify-center relative" style={{ backgroundColor: recipe.color }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
        <span className="text-6xl drop-shadow-xl relative z-10">{recipe.emoji}</span>
        {/* Pantry match badge */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-[10px] font-semibold">
              {recipe.pantryMatched}/{recipe.ingredients.length} in pantry
            </span>
            <span className="text-white text-[10px] font-bold">{recipe.pantryMatch}%</span>
          </div>
          <div className="h-1 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${recipe.pantryMatch}%` }} />
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-3.5">
        <p className="text-t1 font-bold text-sm leading-snug mb-1 line-clamp-2">{recipe.title}</p>
        <p className="text-t3 text-xs mb-2">{recipe.cuisine} · {recipe.prepTime + recipe.cookTime} min</p>
        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 1).map(t => (
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

// ─── Main component ─────────────────────────────────────────
export default function Home() {
  const { user, pantry } = useApp();
  const effectivePantry = pantry.length ? pantry : PANTRY_INITIAL;
  const rankedRecipes = getPantryMatches(RECIPES, effectivePantry);

  return (
    <div className="bg-bg min-h-full flex flex-col relative overflow-hidden" style={{ minHeight: '100%' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3">
        {/* Wordmark */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">👨‍🍳</span>
          <span className="font-serif text-t1 font-bold text-lg tracking-tight">Remy</span>
        </div>
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-terra flex items-center justify-center
          shadow-[0_0_12px_rgba(212,101,74,0.35)]">
          <span className="text-white font-bold text-sm">{user.name[0]}</span>
        </div>
      </div>

      {/* ── Greeting ── */}
      <div className="px-5 mb-5">
        <h1 className="font-serif text-2xl font-bold text-t1 leading-tight">
          {greeting()}, {user.name}
        </h1>
        <p className="text-t2 text-sm mt-1">
          Recipes matched to your pantry
        </p>
      </div>

      {/* ── Pantry label ── */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider">
          Based on your pantry
        </p>
        <span className="bg-s2 border border-s3 text-t2 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {effectivePantry.length} items
        </span>
      </div>

      {/* ── Recipe cards (horizontal scroll) ── */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-3 overflow-x-auto scrollbar-none px-5 pb-4 h-full items-start">
          {rankedRecipes.map(r => (
            <PantryRecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>

      {/* ── Expiring soon nudge ── */}
      {PANTRY_INITIAL.some(p => p.expiringSoon) && (
        <div className="mx-5 mb-3 bg-[rgba(255,159,10,0.08)] border border-amber/25 rounded-2xl px-4 py-3
          flex items-center gap-3">
          <span className="text-amber text-base flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-amber text-xs font-bold">Items expiring soon</p>
            <p className="text-t2 text-xs mt-0.5 truncate">
              {PANTRY_INITIAL.filter(p => p.expiringSoon).map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-10 py-5 pb-6">
        <StartCookingButton recipes={rankedRecipes} pantry={effectivePantry} />
        <VoiceButton />
      </div>
    </div>
  );
}
