import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CHIPS = [
  'Perfect as-is', 'Will make again', 'Too complex',
  'Too long', 'Tweaked it', 'Family loved it',
];

export default function PostCookRating() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addToast } = useApp();
  const recipe = recipes.find(r => r.id === id);

  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [tweakNote, setTweakNote] = useState('Added chili flakes for extra heat');
  const [saveToFavorites, setSaveToFavorites] = useState(false);
  const [bouncing, setBouncing] = useState(null);

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
    addToast('Got it — this goes in your top recipes ✓', 'success');
    setTimeout(() => navigate('/'), 300);
  };

  if (!recipe) return null;

  return (
    <div className="bg-bg min-h-full px-5 py-6 flex flex-col">
      {/* Header */}
      <div className="mb-8 mt-2">
        <h1 className="font-serif text-2xl font-bold text-t1 mb-1">How did it go?</h1>
        <p className="text-t2 text-sm">{recipe.title}</p>
      </div>

      {/* Stars */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => handleStar(s)}
            onMouseEnter={() => setHoveredStar(s)}
            onMouseLeave={() => setHoveredStar(0)}
            className={`text-5xl transition-transform duration-150
              ${bouncing === s ? 'scale-125' : 'scale-100'}
              active:scale-110`}
          >
            <span style={{ filter: s <= (hoveredStar || stars) ? 'none' : 'grayscale(100%) opacity(0.3)' }}>
              {s <= (hoveredStar || stars) ? '⭐' : '☆'}
            </span>
          </button>
        ))}
      </div>

      {/* Reaction chips */}
      {stars > 0 && (
        <div className="animate-fade-in mb-6">
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-3">How was it?</p>
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
        <div className="animate-fade-in mb-6">
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">What did you change?</p>
          <textarea
            rows={3}
            value={tweakNote}
            onChange={e => setTweakNote(e.target.value)}
            className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm
              focus:border-terra outline-none resize-none placeholder-t3"
          />
        </div>
      )}

      {/* Save toggle */}
      {stars >= 4 && (
        <div className="animate-fade-in flex items-center justify-between bg-s1 border border-s3 rounded-xl px-4 py-3.5 mb-6">
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

      <div className="flex-1" />

      {/* Done CTA */}
      <button
        onClick={handleDone}
        disabled={stars === 0}
        className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
          active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Done ✓
      </button>

      {stars === 0 && (
        <p className="text-center text-t3 text-xs mt-2">Tap a star to rate first</p>
      )}
    </div>
  );
}
