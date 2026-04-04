import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomSheet from '../components/BottomSheet';

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
  const { allRecipes, user, tweakedRecipes, servingsOverride, updateServings, applyTweak, addToast, addGroceryItems, groceryList } = useApp();

  const recipe = allRecipes.find(r => r.id === id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tweakInput, setTweakInput] = useState('');
  const [tweakLoading, setTweakLoading] = useState(false);

  if (!recipe) return (
    <div className="bg-bg min-h-full flex items-center justify-center">
      <p className="text-t2">Recipe not found</p>
    </div>
  );

  const isTweaked = tweakedRecipes.has(id);
  const servings = servingsOverride[id] ?? recipe.servings;
  const ratio = servings / recipe.servings;
  const inPantryCount = recipe.ingredients.filter(i => i.inPantry).length;
  const pantryPct = Math.round((inPantryCount / recipe.ingredients.length) * 100);
  const missingIngredients = recipe.ingredients.filter(i => !i.inPantry && !(i.isNew && !isTweaked));
  const groceryNames = new Set(groceryList.map(g => g.name.toLowerCase()));
  const notYetInGrocery = missingIngredients.filter(i => !groceryNames.has(i.item.toLowerCase()));

  const handleAddMissingToGrocery = () => {
    addGroceryItems(notYetInGrocery.map(i => ({ name: i.item, qty: `${i.qty} ${i.unit}`.trim() })));
    addToast(`${notYetInGrocery.length} item${notYetInGrocery.length !== 1 ? 's' : ''} added to grocery list`, 'success');
  };

  const handleApplyTweak = () => {
    setTweakLoading(true);
    setTimeout(() => {
      setTweakLoading(false);
      setSheetOpen(false);
      applyTweak(id);
      addToast('Remy added chili flakes and updated step 3', 'success');
    }, 1200);
  };

  const stepText = (step) => user.skillLevel === 'Beginner' ? step.beginner : step.beginner;

  return (
    <div className="bg-bg min-h-full pb-28">
      {/* Hero */}
      <div className="relative h-52 flex items-end" style={{ backgroundColor: recipe.color }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl drop-shadow-xl">{recipe.emoji}</span>
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
        <div className="relative z-10 px-5 pb-4 w-full">
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">{recipe.title}</h1>
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

      {/* Pantry match banner */}
      <div className="mx-4 my-3 bg-[rgba(109,184,122,0.1)] border border-[rgba(109,184,122,0.25)] rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sage font-semibold text-sm">You have {inPantryCount} of {recipe.ingredients.length} ingredients</p>
          <p className="text-sage text-xs font-bold">{pantryPct}%</p>
        </div>
        <div className="h-1.5 bg-s3 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: `${pantryPct}%` }} />
        </div>
        {notYetInGrocery.length > 0 ? (
          <button
            onClick={handleAddMissingToGrocery}
            className="w-full flex items-center justify-center gap-2 bg-s1 border border-s3 rounded-lg py-2.5
              active:bg-s2 transition-colors"
          >
            <span className="text-sm">🛒</span>
            <span className="text-t1 text-xs font-semibold">
              Add {notYetInGrocery.length} missing item{notYetInGrocery.length !== 1 ? 's' : ''} to grocery list
            </span>
          </button>
        ) : missingIngredients.length > 0 ? (
          <div className="flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6DB87A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-sage text-xs font-semibold">All missing items already in your grocery list</span>
          </div>
        ) : null}
      </div>

      {/* Ingredients */}
      <div className="px-4 mb-4">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-3">
          Ingredients · {servings} servings
        </p>
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((ing, i) => {
            const showNew = ing.isNew && isTweaked;
            const hidden = ing.isNew && !isTweaked;
            if (hidden) return null;
            return (
              <div
                key={i}
                className={`bg-s1 border rounded-xl px-4 py-3 flex items-center gap-3
                  ${showNew ? 'border-amber/40' : 'border-s3'}
                  ${showNew ? 'animate-fade-in' : ''}`}
              >
                {showNew && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber rounded-l-xl" />}
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                  ${ing.inPantry ? 'bg-sage' : 'border-2 border-s3'}`}>
                  {ing.inPantry && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <polyline points="1 4 3.5 6.5 9 1"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${ing.inPantry ? 'text-t1' : 'text-t3'}`}>
                    {scaleQty(ing.qty, ratio)} {ing.unit} {ing.item}
                  </span>
                  {showNew && <p className="text-amber text-[10px] font-semibold mt-0.5">Added by Remy ✨</p>}
                </div>
                {!ing.inPantry && !showNew && (
                  <span className="text-terra text-xs font-medium">+ Add</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tweak button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full mt-3 border border-s3 rounded-xl py-3 text-t2 text-sm font-medium
            active:bg-s2 transition-colors"
        >
          ✨ Tweak this recipe
        </button>
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
                {step.isTweaked && isTweaked && (
                  <div className="bg-[rgba(255,159,10,0.12)] border border-amber/25 rounded-lg px-3 py-2 mb-2">
                    <p className="text-amber text-xs font-semibold">✨ Tweaked by Remy — chili flakes added for heat</p>
                  </div>
                )}
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

      {/* Sticky CTA */}
      <div className="absolute bottom-16 left-0 right-0 px-4 py-3 bg-bg/90 backdrop-blur-sm border-t border-s3">
        <button
          onClick={() => navigate(`/recipes/${id}/voice`)}
          className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
            active:scale-98 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]"
        >
          Start Cooking →
        </button>
        <p
          onClick={() => navigate(`/recipes/${id}/cook`)}
          className="text-center text-t3 text-xs mt-2 cursor-pointer underline active:text-t2"
        >
          Free mode (no voice)
        </p>
      </div>

      {/* Tweak sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Tweak this recipe">
        <div className="p-4 flex flex-col gap-4">
          <p className="text-t2 text-sm">Tell Remy how you'd like to change this recipe:</p>
          <textarea
            value={tweakInput}
            onChange={e => setTweakInput(e.target.value)}
            rows={3}
            placeholder="e.g. Make it spicier, reduce sodium, scale to 6..."
            className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3
              focus:border-terra focus:ring-1 focus:ring-terra/30 outline-none resize-none"
          />
          <button
            onClick={handleApplyTweak}
            disabled={tweakLoading}
            className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-base
              active:scale-95 transition-transform disabled:opacity-60"
          >
            {tweakLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Remy is tweaking...
              </span>
            ) : 'Apply Tweak'}
          </button>
          <div className="h-2" />
        </div>
      </BottomSheet>
    </div>
  );
}
