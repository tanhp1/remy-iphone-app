import { useState } from 'react';
import { useApp } from '../context/AppContext';

const SKILL_LEVELS = [
  { id: 'Beginner',       emoji: '🌱', desc: 'I can boil water and follow simple instructions' },
  { id: 'Home cook',      emoji: '🍳', desc: 'I cook regularly and know my way around the kitchen' },
  { id: 'Confident cook', emoji: '👨‍🍳', desc: 'I experiment freely and rarely follow recipes exactly' },
];

const DIETS = [
  { id: 'None',           emoji: '🍽️' },
  { id: 'Keto',           emoji: '🥩' },
  { id: 'Vegetarian',     emoji: '🥦' },
  { id: 'Vegan',          emoji: '🌿' },
  { id: 'Gluten-free',    emoji: '🌾' },
  { id: 'Dairy-free',     emoji: '🥛' },
  { id: 'Paleo',          emoji: '🍖' },
  { id: 'Mediterranean',  emoji: '🫒' },
];

const QUICK_PANTRY = [
  'Olive oil', 'Garlic', 'Onion', 'Salt & pepper', 'Butter',
  'Eggs', 'Flour', 'Soy sauce', 'Chicken broth', 'Canned tomatoes',
  'Rice', 'Pasta', 'Lemon', 'Chili flakes', 'Cumin',
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0); // 0=welcome, 1=skill, 2=diet
  const [skill, setSkill] = useState('');
  const [diet, setDiet] = useState('');

  const finish = () => {
    completeOnboarding({
      skillLevel: skill || 'Home cook',
      dietaryLifestyle: diet || 'None',
    });
  };

  // ── Step 0: Welcome ──────────────────────────────────────
  if (step === 0) return (
    <div className="bg-bg min-h-full flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 relative">
        <div className="w-24 h-24 rounded-full bg-terra/15 flex items-center justify-center mb-1
          shadow-[0_0_40px_rgba(212,101,74,0.25)]">
          <span className="text-5xl">👨‍🍳</span>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-terra rounded-full flex items-center justify-center
          shadow-[0_0_12px_rgba(212,101,74,0.5)]">
          <span className="text-white text-sm">✨</span>
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold text-t1 mb-3 leading-tight">
        Meet Little Chef
      </h1>
      <p className="text-t2 text-base leading-relaxed mb-2">
        Your personal AI cooking assistant.
      </p>
      <p className="text-t3 text-sm leading-relaxed mb-10 max-w-xs">
        Inspired by the belief that <span className="text-terra font-semibold">anyone can cook</span> — Little Chef helps you make amazing meals with what you already have.
      </p>

      <button
        onClick={() => setStep(1)}
        className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base
          active:scale-95 transition-transform shadow-[0_0_24px_rgba(212,101,74,0.4)] mb-3"
      >
        Let's get started →
      </button>
      <p className="text-t3 text-xs">Takes about 30 seconds</p>
    </div>
  );

  // ── Step 1: Skill level ──────────────────────────────────
  if (step === 1) return (
    <div className="bg-bg min-h-full flex flex-col px-6 pt-12 pb-8">
      <div className="mb-2">
        <div className="flex gap-1 mb-6">
          {[1,2].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= 1 ? 'bg-terra' : 'bg-s3'}`} />
          ))}
        </div>
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">Step 1 of 2</p>
        <h2 className="font-serif text-2xl font-bold text-t1 mb-2">What's your cooking level?</h2>
        <p className="text-t2 text-sm">Little Chef adjusts its guidance based on your experience.</p>
      </div>

      <div className="flex flex-col gap-3 mt-8 flex-1">
        {SKILL_LEVELS.map(s => (
          <button
            key={s.id}
            onClick={() => setSkill(s.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-98
              ${skill === s.id
                ? 'border-terra bg-terra/8 shadow-[0_0_16px_rgba(212,101,74,0.15)]'
                : 'border-s3 bg-s1'}`}
          >
            <span className="text-3xl w-10 text-center flex-shrink-0">{s.emoji}</span>
            <div>
              <p className={`font-bold text-base ${skill === s.id ? 'text-terra' : 'text-t1'}`}>{s.id}</p>
              <p className="text-t3 text-xs mt-0.5 leading-snug">{s.desc}</p>
            </div>
            {skill === s.id && (
              <div className="ml-auto w-5 h-5 rounded-full bg-terra flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!skill}
        className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base mt-6
          active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)] disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  );

  // ── Step 2: Dietary preference ───────────────────────────
  if (step === 2) return (
    <div className="bg-bg min-h-full flex flex-col px-6 pt-12 pb-8">
      <div className="mb-2">
        <div className="flex gap-1 mb-6">
          {[1,2].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= 2 ? 'bg-terra' : 'bg-s3'}`} />
          ))}
        </div>
        <p className="text-t3 text-xs font-semibold uppercase tracking-wider mb-2">Step 2 of 2</p>
        <h2 className="font-serif text-2xl font-bold text-t1 mb-2">Any dietary preferences?</h2>
        <p className="text-t2 text-sm">Little Chef will filter and personalize every recipe to match.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8 flex-1">
        {DIETS.map(d => (
          <button
            key={d.id}
            onClick={() => setDiet(d.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-95
              ${diet === d.id
                ? 'border-terra bg-terra/8 shadow-[0_0_12px_rgba(212,101,74,0.15)]'
                : 'border-s3 bg-s1'}`}
          >
            <span className="text-2xl">{d.emoji}</span>
            <span className={`font-semibold text-sm ${diet === d.id ? 'text-terra' : 'text-t1'}`}>{d.id}</span>
          </button>
        ))}
      </div>

      <button
        onClick={finish}
        disabled={!diet}
        className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base mt-6
          active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)] disabled:opacity-40"
      >
        Let's cook! →
      </button>
    </div>
  );
}
