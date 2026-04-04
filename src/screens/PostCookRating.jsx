import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CHIPS = [
  'Perfect as-is', 'Will make again', 'Too complex',
  'Too long', 'Tweaked it', 'Family loved it',
];

const STAR_LABELS = ['', 'Disappointing', 'It was okay', 'Pretty good', 'Really good', 'Absolutely loved it'];

export default function PostCookRating() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRecipes, addToast } = useApp();
  const recipe = allRecipes.find(r => r.id === id);

  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [tweakNote, setTweakNote] = useState('');
  const [saveToFavorites, setSaveToFavorites] = useState(false);
  const [bouncing, setBouncing] = useState(null);
  const [done, setDone] = useState(false);

  const handleStar = (s) => {
    setStars(s);
    setBouncing(s);
    if (s >= 4) setSaveToFavorites(true);
    setTimeout(() => setBouncing(null), 200);
  };

  const toggleChip = (chip) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  const handleDone = () => {
    setDone(true);
    setTimeout(() => {
      addToast(stars >= 4 ? '⭐ Saved to your favorites!' : 'Rating saved — thanks!', 'success');
      navigate('/');
    }, 1800);
  };

  if (!recipe) return null;

  const activeStars = hoveredStar || stars;

  // ── Success state ───────────────────────────────────────
  if (done) return (
    <div className="bg-bg min-h-full flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-7xl animate-bounce">🎉</div>
      <h2 className="font-serif text-2xl font-bold text-t1">Nice cook!</h2>
      <p className="text-t2 text-sm">
        {stars >= 4 ? `${recipe.title} is going in your favorites.` : 'Your feedback helps Little Chef improve.'}
      </p>
      <div className="flex gap-0.5 mt-1">
        {[1,2,3,4,5].map(s => (
          <span key={s} className="text-2xl" style={{ filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-bg min-h-full flex flex-col">
      {/* Recipe hero strip */}
      <div className="h-36 flex items-center justify-center relative flex-shrink-0" style={{ backgroundColor: recipe.color }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
        <span className="text-6xl drop-shadow-xl relative z-10">{recipe.emoji}</span>
        <div className="absolute bottom-3 left-5 right-5 z-10">
          <p className="text-white font-bold text-base leading-tight">{recipe.title}</p>
          <p className="text-white/70 text-xs mt-0.5">Just cooked · {recipe.prepTime + recipe.cookTime} min</p>
        </div>
        {/* Back button */}
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 flex flex-col gap-5">
        {/* Stars */}
        <div>
          <h2 className="font-serif text-xl font-bold text-t1 mb-1">How did it go?</h2>
          <p className="text-t3 text-xs mb-4">
            {activeStars > 0 ? STAR_LABELS[activeStars] : 'Tap a star to rate'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => handleStar(s)}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                className={`text-5xl transition-transform duration-150
                  ${bouncing === s ? 'scale-125' : 'scale-100'} active:scale-110`}
              >
                <span style={{ filter: s <= activeStars ? 'none' : 'grayscale(100%) opacity(0.3)' }}>⭐</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reaction chips */}
        {stars > 0 && (
          <div className="animate-fade-in">
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-3">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium border transition-all duration-150 active:scale-95
                    ${selected.has(chip)
                      ? 'bg-terra text-white border-terra'
                      : 'bg-s2 text-t1 border-s3'}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tweak note */}
        {selected.has('Tweaked it') && (
          <div className="animate-fade-in">
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">What did you change?</p>
            <textarea
              rows={3}
              value={tweakNote}
              onChange={e => setTweakNote(e.target.value)}
              placeholder="e.g. Added more garlic, reduced cook time..."
              className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm
                focus:border-terra outline-none resize-none placeholder-t3"
            />
          </div>
        )}

        {/* Save to favorites toggle */}
        {stars >= 4 && (
          <div className="animate-fade-in flex items-center justify-between bg-s1 border border-s3 rounded-xl px-4 py-3.5">
            <div>
              <p className="text-t1 text-sm font-semibold">Save to My Favorites</p>
              <p className="text-t3 text-xs mt-0.5">Add to your cookbook collection</p>
            </div>
            <button
              onClick={() => setSaveToFavorites(v => !v)}
              className={`w-12 h-7 rounded-full transition-colors duration-200 relative flex-shrink-0
                ${saveToFavorites ? 'bg-terra' : 'bg-s3'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200
                ${saveToFavorites ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}

        {/* Cook again nudge */}
        {stars >= 4 && (
          <button
            onClick={() => navigate(`/recipes/${id}`)}
            className="flex items-center justify-between bg-terra/8 border border-terra/25 rounded-xl px-4 py-3.5 animate-fade-in"
          >
            <div className="text-left">
              <p className="text-terra text-sm font-semibold">Cook it again</p>
              <p className="text-t3 text-xs mt-0.5">Jump back to the recipe</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4654A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-s3 bg-bg">
        <button
          onClick={handleDone}
          disabled={stars === 0}
          className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
            active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stars === 0 ? 'Tap a star to rate' : 'Done ✓'}
        </button>
      </div>
    </div>
  );
}
