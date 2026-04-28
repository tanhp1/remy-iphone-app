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
  const { allRecipes, user, tweakedRecipes, servingsOverride, updateServings, applyTweak, addToast } = useApp();

  const recipe = allRecipes.find(r => r.id === id);

  if (!recipe) return (
    <div className="bg-bg min-h-full flex items-center justify-center">
      <p className="text-t2">Recipe not found</p>
    </div>
  );

  const isTweaked = tweakedRecipes.has(id);
  const servings = servingsOverride[id] ?? recipe.servings;
  const ratio = servings / recipe.servings;

  const handleApplyTweak = () => {
    applyTweak(id);
    addToast('Little Chef added chili flakes and updated step 3', 'success');
  };

  const stepText = (step) => user.skillLevel === 'Beginner' ? step.beginner : step.beginner;

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
          {recipe.isChefRecipe && (
            <div className="flex items-center gap-1 bg-terra text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              <span>👨‍🍳</span> Chef's
            </div>
          )}
          <button
            onClick={handleApplyTweak}
            className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full active:scale-90 transition-transform"
          >
            ✨ Tweak
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
                  {showNew && <p className="text-amber text-[10px] font-semibold mt-0.5">Added by Little Chef ✨</p>}
                </div>
                {!ing.inPantry && !showNew && (
                  <span className="text-terra text-xs font-medium">+ Add</span>
                )}
              </div>
            );
          })}
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
                {step.isTweaked && isTweaked && (
                  <div className="bg-[rgba(255,159,10,0.12)] border border-amber/25 rounded-lg px-3 py-2 mb-2">
                    <p className="text-amber text-xs font-semibold">✨ Tweaked by Little Chef — chili flakes added for heat</p>
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


    </div>
  );
}
