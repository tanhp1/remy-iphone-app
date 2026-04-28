import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CHIPS = ['Quick (<30m)', 'Beginner', 'Healthy', 'Asian', 'Italian', 'Comfort'];

const CHIP_FILTERS = {
  'Quick (<30m)': r => (r.prepTime + r.cookTime) < 30,
  'Beginner':     r => r.difficulty === 'Beginner',
  'Healthy':      r => r.dietaryTags.some(t => ['Gluten-free','Vegan','Vegetarian','Paleo'].includes(t)),
  'Asian':        r => r.cuisine === 'Asian',
  'Italian':      r => r.cuisine === 'Italian',
  'Comfort':      r => ['American','French'].includes(r.cuisine),
};

function RecipeResultCard({ recipe }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 bg-s1 border border-s3 rounded-2xl p-3 active:bg-s2 transition-colors">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: recipe.color }}>
        <span className="text-2xl">{recipe.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-t1 font-semibold text-sm leading-snug truncate">{recipe.title}</p>
        <p className="text-t3 text-xs mt-0.5">
          {recipe.prepTime + recipe.cookTime} min · {recipe.difficulty} · {recipe.cuisine}
        </p>
        <div className="flex gap-1 mt-1">
          {recipe.dietaryTags.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] bg-s2 text-t2 border border-s3 rounded-full px-1.5 py-0.5 font-medium">{t}</span>
          ))}
        </div>
      </div>
      <button
        onClick={() => navigate(`/recipes/${recipe.id}/cook`)}
        className="flex-shrink-0 bg-terra text-white text-xs font-bold px-3 py-2 rounded-xl
          active:scale-90 transition-transform shadow-[0_0_10px_rgba(212,101,74,0.35)]"
      >
        Cook →
      </button>
    </div>
  );
}

export default function StartCooking() {
  const navigate = useNavigate();
  const { allRecipes } = useApp();

  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  // Set up voice recognition
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setVoiceText(t);
      if (e.results[e.results.length - 1].isFinal) {
        setQuery(t);
        setVoiceText('');
        setListening(false);
        listeningRef.current = false;
      }
    };

    rec.onerror = () => {
      setListening(false);
      listeningRef.current = false;
    };

    rec.onend = () => {
      setListening(false);
      listeningRef.current = false;
    };

    return () => {
      listeningRef.current = false;
      try { rec.abort(); } catch (e) {}
    };
  }, []);

  const toggleVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      listeningRef.current = false;
      setListening(false);
      try { rec.abort(); } catch (e) {}
    } else {
      listeningRef.current = true;
      setListening(true);
      setQuery('');
      setVoiceText('');
      try { rec.start(); } catch (e) {}
    }
  };

  // Filter recipes
  const results = allRecipes.filter(r => {
    const chipMatch = activeChip ? CHIP_FILTERS[activeChip]?.(r) : true;
    const q = (query || voiceText).trim().toLowerCase();
    const textMatch = !q || [r.title, r.cuisine, r.difficulty, ...r.dietaryTags]
      .some(s => s.toLowerCase().includes(q));
    return chipMatch && textMatch;
  });

  const displayText = voiceText || query;

  return (
    <div className="bg-bg min-h-full flex flex-col pb-4">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="font-serif text-2xl font-bold text-t1 leading-tight mb-1">
          What do you want to cook?
        </h1>
        <p className="text-t3 text-xs">Search your library or speak it aloud</p>
      </div>

      {/* Search bar + mic */}
      <div className="px-5 mb-4">
        <div className={`flex items-center gap-2 bg-s2 border rounded-2xl px-4 py-3 transition-colors
          ${listening ? 'border-terra shadow-[0_0_16px_rgba(212,101,74,0.2)]' : 'border-s3'}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={listening ? '#D4654A' : '#6D6D72'} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={displayText}
            onChange={e => { setQuery(e.target.value); setActiveChip(''); }}
            placeholder={listening ? 'Listening...' : 'e.g. "spicy chicken", "quick pasta"'}
            className="flex-1 bg-transparent text-t1 text-sm placeholder-t3 outline-none"
          />
          {displayText ? (
            <button onClick={() => { setQuery(''); setVoiceText(''); }}
              className="text-t3 text-lg leading-none active:text-t1">×</button>
          ) : null}
          <button
            onClick={toggleVoice}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${listening
                ? 'bg-terra shadow-[0_0_12px_rgba(212,101,74,0.5)] animate-pulse'
                : 'bg-s3 active:scale-90'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={listening ? 'white' : '#AEAEB2'} strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 mb-4">
        {CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => { setActiveChip(activeChip === chip ? '' : chip); setQuery(''); setVoiceText(''); }}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all active:scale-95
              ${activeChip === chip ? 'bg-terra text-white border-terra' : 'bg-s2 text-t2 border-s3'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 px-5 flex flex-col gap-3 overflow-y-auto scrollbar-none">
        {results.length > 0 ? (
          <>
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider">
              {displayText || activeChip
                ? `${results.length} match${results.length !== 1 ? 'es' : ''}`
                : `All recipes (${results.length})`}
            </p>
            {results.map(r => <RecipeResultCard key={r.id} recipe={r} />)}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-5xl">🤔</span>
            <p className="text-t1 font-bold text-base text-center">
              Nothing matched "{displayText}"
            </p>
            <p className="text-t3 text-sm text-center">
              Import a new recipe to add it to your library
            </p>
            <button
              onClick={() => navigate('/import')}
              className="bg-terra text-white rounded-xl px-6 py-3 font-semibold text-sm
                active:scale-95 transition-transform shadow-[0_0_16px_rgba(212,101,74,0.35)]"
            >
              Import Recipe →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
