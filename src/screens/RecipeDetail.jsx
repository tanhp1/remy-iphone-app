import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Scale a qty string by a ratio, returning a clean formatted string
function scaleQty(qtyStr, ratio) {
  if (!qtyStr || ratio === 1) return qtyStr;
  // Extract leading number (int or decimal), keep any trailing non-numeric suffix (e.g. "300g" → 300, "g")
  const match = String(qtyStr).match(/^([\d.\/]+)(.*)/);
  if (!match) return qtyStr;

  let num;
  if (match[1].includes('/')) {
    // Handle fractions like "1/2"
    const [n, d] = match[1].split('/');
    num = parseFloat(n) / parseFloat(d);
  } else {
    num = parseFloat(match[1]);
  }
  if (isNaN(num)) return qtyStr;

  const scaled = num * ratio;

  // Format: prefer clean fractions for small values, integers when whole, 1 decimal otherwise
  const FRACTIONS = [
    [0.25, '¼'], [0.33, '⅓'], [0.5, '½'], [0.67, '⅔'], [0.75, '¾'],
  ];
  const whole = Math.floor(scaled);
  const frac = scaled - whole;
  let formatted;

  if (frac < 0.05) {
    formatted = String(whole === 0 ? scaled.toFixed(1).replace(/\.0$/, '') : whole);
  } else {
    const fracMatch = FRACTIONS.find(([v]) => Math.abs(frac - v) < 0.07);
    if (fracMatch) {
      formatted = whole > 0 ? `${whole}${fracMatch[1]}` : fracMatch[1];
    } else {
      formatted = scaled < 10 ? parseFloat(scaled.toFixed(1)).toString() : Math.round(scaled).toString();
    }
  }

  return formatted + match[2]; // re-attach suffix like "g", "ml" etc.
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRecipes, servingsOverride, updateServings, addToast } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editDone, setEditDone] = useState(false);

  const recipe = allRecipes.find(r => r.id === id);

  if (!recipe) return (
    <div className="bg-bg min-h-full flex items-center justify-center">
      <p className="text-t2">Recipe not found</p>
    </div>
  );

  const servings = servingsOverride[id] ?? recipe.servings;
  const ratio = servings / recipe.servings;

  const handleAIEdit = () => {
    if (!editPrompt.trim()) return;
    setEditLoading(true);
    setTimeout(() => {
      setEditLoading(false);
      setEditDone(true);
      setTimeout(() => {
        setEditOpen(false);
        setEditDone(false);
        setEditPrompt('');
        addToast('Recipe updated by Little Chef ✨', 'success');
      }, 800);
    }, 1600);
  };

  const stepText = (step) => step.beginner;

  return (
    <div className="bg-bg min-h-full pb-6">
      {/* Hero */}
      <div className="relative flex items-end" style={{ backgroundColor: recipe.color, minHeight: recipe.isChefRecipe ? '224px' : '208px' }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl drop-shadow-xl">{recipe.emoji}</span>
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />

        {/* Top-right action pills */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full active:scale-90 transition-transform"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => navigate(`/recipes/${id}/cook`)}
            className="flex items-center gap-1 bg-terra text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full active:scale-90 transition-transform shadow-[0_0_10px_rgba(212,101,74,0.5)]"
          >
            ▶ Cook
          </button>
        </div>

        <div className="relative z-10 px-5 pb-4 w-full">
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">{recipe.title}</h1>
          {/* Chef star rating in hero */}
          {recipe.rating && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                    fill={i <= Math.round(recipe.rating.overall) ? '#FFD700' : 'none'}
                    stroke="#FFD700" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span className="text-white/90 text-xs font-bold">{recipe.rating.overall.toFixed(1)}</span>
              {recipe.rating.count && <span className="text-white/60 text-[10px]">({recipe.rating.count.toLocaleString()} ratings)</span>}
            </div>
          )}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full
            flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Chef note banner */}
      {recipe.isChefRecipe && recipe.chefNote && (
        <div className="mx-4 mt-3 bg-[rgba(212,101,74,0.08)] border border-terra/25 rounded-xl px-4 py-3">
          <p className="text-terra text-xs font-bold mb-1">👨‍🍳 A note from {recipe.chefName}</p>
          <p className="text-t2 text-sm leading-relaxed italic">"{recipe.chefNote}"</p>
        </div>
      )}

      {/* Metadata row */}
      <div className="bg-s1 border-b border-s3 px-5 py-3 flex items-center gap-4">
        <div className="text-center">
          <p className="text-t1 font-bold text-sm">{recipe.prepTime + recipe.cookTime}<span className="text-t3 text-xs font-normal"> min</span></p>
          <p className="text-t3 text-[10px]">Total</p>
        </div>
        <div className="w-px h-8 bg-s3" />
        <div className="text-center flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button onClick={() => updateServings(id, -1)} className="w-6 h-6 bg-s2 border border-s3 rounded-lg text-t1 text-xs font-bold active:scale-90 transition-transform">−</button>
            <span className="text-t1 font-bold text-sm">{servings}</span>
            <button onClick={() => updateServings(id, +1)} className="w-6 h-6 bg-s2 border border-s3 rounded-lg text-t1 text-xs font-bold active:scale-90 transition-transform">+</button>
          </div>
          <p className="text-t3 text-[10px]">Servings</p>
        </div>
        <div className="w-px h-8 bg-s3" />
        <div className="text-center">
          <p className="text-t1 font-bold text-sm">{recipe.difficulty}</p>
          <p className="text-t3 text-[10px]">Level</p>
        </div>
        <div className="w-px h-8 bg-s3" />
        <span className="bg-terra/20 text-terra text-[10px] font-bold px-2 py-0.5 rounded-full">{recipe.source}</span>
      </div>

      {/* Ingredients */}
      <div className="px-4 mb-4">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-3">
          Ingredients · {servings} servings
        </p>
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((ing, i) => (
            <div
              key={i}
              className="bg-s1 border border-s3 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-terra/50 flex-shrink-0" />
              <span className="text-t1 text-sm font-medium flex-1">
                {scaleQty(ing.qty, ratio)} {ing.unit} {ing.item}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Steps */}
      <div className="px-4 mb-6">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-3">Instructions</p>
        <div className="flex flex-col gap-4">
          {recipe.steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-terra/15 flex items-center justify-center">
                <span className="font-serif text-terra font-bold text-base">{step.number}</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-t1 text-base leading-relaxed">{stepText(step)}</p>
                {step.timerSeconds && (
                  <span className="inline-flex items-center gap-1 mt-1.5 bg-terra/15 text-terra border border-terra/25 rounded-full px-2.5 py-1 text-xs font-semibold">
                    ⏱ {Math.ceil(step.timerSeconds / 60)} min — {step.timerLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {recipe.tips && (
          <div className="mt-4 bg-s1 border border-s3 rounded-xl px-4 py-3">
            <p className="text-terra text-xs font-bold mb-1">💡 Chef's Tip</p>
            <p className="text-t2 text-sm">{recipe.tips}</p>
          </div>
        )}
      </div>


      {/* AI Edit sheet */}
      {editOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end">
          <div className="bg-s1 border-t border-s3 rounded-t-3xl w-full px-5 pt-5 pb-8 animate-fade-in">
            <div className="w-10 h-1 bg-s3 rounded-full mx-auto mb-5" />
            <p className="text-t1 font-bold text-base mb-1">Edit with Little Chef ✨</p>
            <p className="text-t3 text-xs mb-4">Describe what you'd like to change — add a note, swap an ingredient, adjust servings, simplify a step.</p>
            <textarea
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              placeholder={"e.g. 'Make it dairy-free'\ne.g. 'Add a note about substituting chicken'\ne.g. 'Simplify step 3 for beginners'"}
              rows={3}
              autoFocus
              className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setEditOpen(false); setEditPrompt(''); }}
                className="flex-1 border border-s3 rounded-xl py-3 text-t2 text-sm font-medium active:bg-s2"
              >
                Cancel
              </button>
              <button
                onClick={handleAIEdit}
                disabled={!editPrompt.trim() || editLoading}
                className="flex-[2] bg-terra text-white rounded-xl py-3 text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              >
                {editDone ? '✓ Done!' : editLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : 'Apply edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
