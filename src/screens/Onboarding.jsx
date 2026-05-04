import { useState } from 'react';
import { useApp } from '../context/AppContext';

const COOKBOOK_SUGGESTIONS = [
  { emoji: '👨‍👩‍👧', name: 'Family Recipes' },
  { emoji: '🌍', name: 'World Kitchen' },
  { emoji: '🥗', name: 'Healthy Eats' },
  { emoji: '🍰', name: 'Baking & Sweets' },
  { emoji: '⚡', name: 'Quick Weeknights' },
  { emoji: '🎉', name: 'Dinner Party' },
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cookbookName, setCookbookName] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const finish = () => {
    const finalName = selectedSuggestion ? selectedSuggestion.name : (cookbookName.trim() || 'My Recipes');
    completeOnboarding({ name: name.trim() || 'Chef', firstCookbookName: finalName });
  };

  const pickSuggestion = (s) => {
    setSelectedSuggestion(s);
    setCookbookName(s.name);
  };

  // ── Step 0: Welcome ──────────────────────────────────────
  if (step === 0) return (
    <div className="bg-bg min-h-full flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-3xl bg-terra/15 flex items-center justify-center
          shadow-[0_0_40px_rgba(212,101,74,0.25)]">
          <span className="text-5xl">📖</span>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-terra rounded-full flex items-center justify-center
          shadow-[0_0_12px_rgba(212,101,74,0.5)]">
          <span className="text-white text-sm">✨</span>
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold text-t1 mb-3 leading-tight">
        Your virtual cookbook,<br/>powered by AI
      </h1>
      <p className="text-t2 text-sm leading-relaxed mb-2">
        Import, organize, and cook from your personal recipe collection.
      </p>
      <p className="text-t3 text-sm leading-relaxed mb-10 max-w-xs">
        Little Chef helps you <span className="text-terra font-semibold">capture any recipe</span> — from a photo, a URL, or your own memory — and guides you through cooking it.
      </p>

      <button
        onClick={() => setStep(1)}
        className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base
          active:scale-95 transition-transform shadow-[0_0_24px_rgba(212,101,74,0.4)] mb-3"
      >
        Get started →
      </button>
      <p className="text-t3 text-xs">Takes about 20 seconds</p>
    </div>
  );

  // ── Step 1: Name + first cookbook ───────────────────────
  if (step === 1) return (
    <div className="bg-bg min-h-full flex flex-col px-6 pt-12 pb-8">
      <div className="mb-6">
        <div className="h-1 w-full bg-terra rounded-full mb-6" />
        <h2 className="font-serif text-2xl font-bold text-t1 mb-1">Set up your cookbook</h2>
        <p className="text-t2 text-sm">This takes 20 seconds.</p>
      </div>

      {/* Name */}
      <div className="mb-5">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">Your name</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Alex"
          className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3.5 text-t1 text-base
            placeholder-t3 focus:border-terra outline-none"
          autoFocus
        />
      </div>

      {/* First cookbook */}
      <div className="mb-4">
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">Name your first cookbook</p>
        <input
          value={cookbookName}
          onChange={e => { setCookbookName(e.target.value); setSelectedSuggestion(null); }}
          placeholder="e.g. Family Recipes"
          className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3.5 text-t1 text-base
            placeholder-t3 focus:border-terra outline-none mb-3"
        />
        <div className="grid grid-cols-2 gap-2">
          {COOKBOOK_SUGGESTIONS.map(s => (
            <button
              key={s.name}
              onClick={() => pickSuggestion(s)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-95
                ${selectedSuggestion?.name === s.name
                  ? 'border-terra bg-terra/8 text-terra'
                  : 'border-s3 bg-s1 text-t2'}`}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-xs font-semibold leading-tight">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={finish}
        disabled={!name.trim()}
        className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base
          active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)] disabled:opacity-40"
      >
        Create my cookbook →
      </button>
    </div>
  );
}
