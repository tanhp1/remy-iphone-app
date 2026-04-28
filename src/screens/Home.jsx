import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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
          <p className="text-xs font-semibold text-terra">Little Chef is listening</p>
        </div>
      ) : (
        <p className="text-xs font-semibold text-t3">Ask Little Chef</p>
      )}
    </div>
  );
}

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="flex-shrink-0 w-[180px] bg-s1 border border-s3 rounded-2xl overflow-hidden
        active:scale-95 transition-transform duration-100 cursor-pointer"
    >
      <div className="h-28 flex items-center justify-center relative" style={{ backgroundColor: recipe.color }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
        <span className="text-5xl drop-shadow-lg relative z-10">{recipe.emoji}</span>
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-white font-bold text-xs leading-snug line-clamp-2">{recipe.title}</p>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-t3 text-[10px]">{recipe.prepTime + recipe.cookTime} min · {recipe.difficulty}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, allRecipes, recentlyCookedIds } = useApp();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const recentRecipes = recentlyCookedIds.length > 0
    ? recentlyCookedIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean)
    : allRecipes.slice(0, 6);

  const quickRecipes = allRecipes.filter(r => (r.prepTime + r.cookTime) <= 30).slice(0, 4);

  return (
    <div className="bg-bg min-h-full flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">👨‍🍳</span>
          <span className="font-serif text-t1 font-bold text-lg tracking-tight">Little Chef</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-terra flex items-center justify-center
          shadow-[0_0_12px_rgba(212,101,74,0.35)]">
          <span className="text-white font-bold text-sm">{user.name[0]}</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <h1 className="font-serif text-2xl font-bold text-t1 leading-tight">
          {greeting()}, {user.name}
        </h1>
        <p className="text-t2 text-sm mt-1">Ready to cook something great?</p>
      </div>

      {/* Big Cook CTA */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate('/cook')}
          className="w-full bg-terra rounded-2xl py-4 px-5 flex items-center justify-between
            shadow-[0_0_28px_rgba(212,101,74,0.4)] active:scale-98 transition-transform"
        >
          <div className="text-left">
            <p className="text-white font-bold text-base">Start Cooking</p>
            <p className="text-white/70 text-xs mt-0.5">Search or say what you want to make</p>
          </div>
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Quick meals */}
      {quickRecipes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-5 mb-3">
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider">⚡ Quick meals</p>
            <button onClick={() => navigate('/cook')} className="text-terra text-xs font-semibold active:opacity-70">
              See all
            </button>
          </div>
          <div className="relative overflow-hidden">
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none px-5">
              {quickRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
            <button onClick={() => scroll(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm
                flex items-center justify-center active:scale-90 transition-transform z-10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button onClick={() => scroll(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm
                flex items-center justify-center active:scale-90 transition-transform z-10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Recent / Library */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider">
            {recentlyCookedIds.length > 0 ? '🕐 Recently cooked' : '📖 Your library'}
          </p>
          <button onClick={() => navigate('/recipes')} className="text-terra text-xs font-semibold active:opacity-70">
            See all
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recentRecipes.slice(0, 3).map(r => (
            <button
              key={r.id}
              onClick={() => navigate(`/recipes/${r.id}`)}
              className="flex items-center gap-3 bg-s1 border border-s3 rounded-xl p-3 active:bg-s2 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: r.color }}>
                <span className="text-xl">{r.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-t1 font-semibold text-sm truncate">{r.title}</p>
                <p className="text-t3 text-xs">{r.prepTime + r.cookTime} min · {r.cuisine}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Ask Little Chef */}
      <div className="flex-shrink-0 px-5 mb-5">
        <div className="bg-s1 border border-s3 rounded-2xl p-4 flex items-center gap-4">
          <VoiceButton />
          <div className="w-px self-stretch bg-s3" />
          <div className="flex-1">
            <p className="text-t1 text-sm font-semibold">Ask Little Chef</p>
            <p className="text-t3 text-[10px] mt-0.5 leading-snug">
              "What can I make in 20 minutes?" · "How do I deglaze a pan?"
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
