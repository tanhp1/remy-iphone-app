import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="bg-bg min-h-full px-5 py-6 pb-24 overflow-y-auto scrollbar-none">
      <h1 className="font-serif text-2xl font-bold text-t1 mb-5">Profile</h1>

      {/* Avatar card */}
      <div className="bg-s1 border border-s3 rounded-2xl p-5 flex flex-col items-center mb-5">
        <div className="w-16 h-16 rounded-full bg-terra flex items-center justify-center mb-3
          shadow-[0_0_16px_rgba(212,101,74,0.4)]">
          <span className="text-white text-2xl font-bold">{user.name[0]}</span>
        </div>
        <p className="text-t1 font-bold text-lg">{user.name}</p>
        <p className="text-t2 text-sm">{user.skillLevel} · {user.dietaryLifestyle}</p>
        {user.isPro ? (
          <span className="mt-2 bg-terra/20 text-terra text-xs font-bold px-3 py-1 rounded-full border border-terra/30">
            ✨ Little Chef Pro
          </span>
        ) : (
          <span className="mt-2 bg-s2 text-t3 text-xs font-bold px-3 py-1 rounded-full border border-s3">
            Free Plan
          </span>
        )}
      </div>

      {/* Subscription card */}
      <div className="bg-s1 border border-s3 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-t1 font-bold text-sm">Subscription</p>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border
            ${user.isPro
              ? 'bg-terra/15 text-terra border-terra/30'
              : 'bg-s2 text-t3 border-s3'}`}>
            {user.isPro ? 'Little Chef Pro' : 'Little Chef Starter'}
          </span>
        </div>
        {!user.isPro && (
          <p className="text-t3 text-xs mb-3 leading-relaxed">
            Unlock AI tweaks, voice navigation, chef recipes and more with Little Chef Pro.
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/subscription')}
            className="flex-1 bg-terra text-white rounded-xl py-2.5 text-sm font-semibold
              active:scale-95 transition-transform shadow-[0_0_12px_rgba(212,101,74,0.3)]"
          >
            {user.isPro ? 'Manage Plan' : '⬆ Upgrade'}
          </button>
          {user.isPro && (
            <button
              onClick={() => navigate('/subscription')}
              className="flex-1 bg-s2 border border-s3 text-danger rounded-xl py-2.5 text-sm font-medium
                active:scale-95 transition-transform"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-s1 border border-s3 rounded-2xl px-4 mb-5 overflow-hidden">
        {[
          { label: 'Dietary lifestyle', value: user.dietaryLifestyle },
          { label: 'Skill level', value: user.skillLevel },
          { label: 'Favorite cuisines', value: user.favoriteCuisines.join(', ') },
          { label: 'Time budget', value: `${user.timeBudget} min` },
        ].map((row, i, arr) => (
          <div key={row.label}
            className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? 'border-b border-s3' : ''}`}>
            <span className="text-t2 text-sm">{row.label}</span>
            <span className="text-t1 text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-s1 border border-s3 rounded-2xl px-4 overflow-hidden">
        {[
          { label: 'My Uploaded Recipes', icon: '📤', action: () => navigate('/upload-recipe') },
          { label: 'Discover New Recipes', icon: '🔍', action: () => navigate('/discover') },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 py-3.5 text-left active:bg-s2 transition-colors
              ${i < arr.length - 1 ? 'border-b border-s3' : ''}`}
          >
            <span className="text-base w-6 text-center">{item.icon}</span>
            <span className="text-t1 text-sm flex-1">{item.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
