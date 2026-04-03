import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#6D6D72',
    badge: null,
    features: [
      '5 recipes per month',
      'Basic pantry tracking',
      'Step-by-step cooking mode',
      'Community recipes',
    ],
    limitations: [
      'No AI recipe tweaks',
      'No voice assistant',
      'No chef recipes',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$4.99',
    period: 'per month',
    color: '#D4654A',
    badge: 'Popular',
    features: [
      'Unlimited recipes',
      'Full pantry management',
      'AI recipe tweaks',
      'Voice assistant (limited)',
      'Community recipes + ratings',
      'Expiry notifications',
    ],
    limitations: [
      'No chef recipes',
      'No hands-free navigation',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    color: '#B8860B',
    badge: '✨ Pro',
    features: [
      'Everything in Basic',
      'Full voice + hands-free nav',
      'Chef recipe collection',
      'Upload unlimited recipes',
      'Priority AI responses',
      'Remy Pro badge',
      'Early access to new features',
    ],
    limitations: [],
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useApp();
  const currentTier = user.isPro ? 'premium' : 'free';
  const [selected, setSelected] = useState(currentTier);
  const [confirming, setConfirming] = useState(false);

  const handleAction = () => {
    if (selected === currentTier) return;
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      navigate('/profile');
    }, 1500);
  };

  const actionLabel = () => {
    const sel = TIERS.find(t => t.id === selected);
    if (selected === currentTier) return 'Current plan';
    if (selected === 'free') return 'Downgrade to Free';
    return `Upgrade to ${sel.name} — ${sel.price}/mo`;
  };

  return (
    <div className="bg-bg min-h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-4 border-b border-s3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-t1">Choose Your Plan</h1>
          <p className="text-t3 text-xs">Cook smarter with Remy Pro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 pb-24 flex flex-col gap-4">
        {TIERS.map(tier => {
          const isCurrent = tier.id === currentTier;
          const isSelected = tier.id === selected;
          return (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 active:scale-98
                ${isSelected
                  ? 'border-terra bg-terra/8 shadow-[0_0_20px_rgba(212,101,74,0.2)]'
                  : 'border-s3 bg-s1'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-t1 font-bold text-base">{tier.name}</p>
                    {tier.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${tier.color}25`, color: tier.color, border: `1px solid ${tier.color}40` }}>
                        {tier.badge}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="bg-success/15 text-success border border-success/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-t3 text-xs mt-0.5">{tier.period}</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-t1 font-bold text-2xl" style={{ color: isSelected ? tier.color : undefined }}>
                    {tier.price}
                  </span>
                  {tier.id !== 'free' && <span className="text-t3 text-xs mb-1">/mo</span>}
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-1.5 mb-3">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="text-success text-xs">✓</span>
                    <span className="text-t2 text-xs">{f}</span>
                  </div>
                ))}
              </div>

              {/* Limitations */}
              {tier.limitations.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-s3">
                  {tier.limitations.map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <span className="text-t3 text-xs">✕</span>
                      <span className="text-t3 text-xs">{l}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Select indicator */}
              {isSelected && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-terra flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-terra" />
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {/* Action button */}
        <button
          onClick={handleAction}
          disabled={selected === currentTier || confirming}
          className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
            active:scale-95 transition-transform disabled:opacity-50 shadow-[0_0_20px_rgba(212,101,74,0.3)]"
        >
          {confirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : actionLabel()}
        </button>

        {/* Cancel note */}
        {currentTier !== 'free' && (
          <button
            onClick={() => { setSelected('free'); }}
            className="text-center text-t3 text-xs underline py-1 active:text-t2 transition-colors"
          >
            Cancel subscription
          </button>
        )}

        <p className="text-t3 text-[10px] text-center mt-1">
          Cancel anytime. No hidden fees. Billed monthly.
        </p>
      </div>
    </div>
  );
}
