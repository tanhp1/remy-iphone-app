import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ASK_REMY_RESPONSES, getStepContextResponse } from '../data/mockResponses';
import TimerBanner from '../components/TimerBanner';
import BottomSheet from '../components/BottomSheet';

function fmt(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function ConfirmDialog({ onCancel, onConfirm }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
      <div className="bg-s1 border border-s3 rounded-2xl p-6 w-full max-w-[280px]">
        <h3 className="text-t1 font-semibold text-base text-center mb-2">Stop cooking?</h3>
        <p className="text-t2 text-sm text-center mb-5">Your progress will not be saved.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-s3 rounded-xl py-3 text-t2 text-sm font-medium active:bg-s2 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-danger/15 border border-danger/30 rounded-xl py-3 text-danger text-sm font-semibold active:bg-danger/25 transition-colors">
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRecipes, user, tweakedRecipes, markRecentlyCooked, addToast } = useApp();

  const recipe = allRecipes.find(r => r.id === id);
  const [stepIdx, setStepIdx] = useState(0);
  const [timers, setTimers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [remyListening, setRemyListening] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState('');
  const intervalRef = useRef(null);

  const isTweaked = tweakedRecipes.has(id);

  // Tick timers
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(k => {
          const t = next[k];
          if (t.running && t.remaining > 0) {
            next[k] = { ...t, remaining: t.remaining - 1 };
            changed = true;
          } else if (t.running && t.remaining === 0) {
            next[k] = { ...t, running: false, done: true };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (!recipe) return null;

  const step = recipe.steps[stepIdx];
  const isLast = stepIdx === recipe.steps.length - 1;

  const startTimer = (s) => {
    setTimers(prev => ({
      ...prev,
      [s.timerLabel]: { label: s.timerLabel, total: s.timerSeconds, remaining: s.timerSeconds, running: true, done: false },
    }));
  };

  const hasActiveTimers = Object.values(timers).some(t => t.running || t.done);

  const handleAsk = () => {
    setAskLoading(true);
    setTimeout(() => {
      const lower = askInput.trim().toLowerCase();
      // 1. If empty, give a contextual response about this specific step
      if (!lower) {
        setAskResponse(getStepContextResponse(step.beginner, stepIdx));
      } else {
        // 2. Keyword match against freeform responses
        const key = Object.keys(ASK_REMY_RESPONSES).find(k => k !== 'default' && lower.includes(k));
        if (key) {
          setAskResponse(ASK_REMY_RESPONSES[key]);
        } else {
          // 3. Fall back to step-aware contextual response
          setAskResponse(getStepContextResponse(step.beginner, stepIdx));
        }
      }
      setAskLoading(false);
    }, 800);
  };

  const handleFinish = () => {
    markRecentlyCooked(id);
    navigate(`/recipes/${id}/rating`);
  };

  const stepText = step.beginner;

  return (
    <div className="bg-bg min-h-full flex flex-col">
      {/* Remy listening indicator */}
      <button
        onClick={() => setRemyListening(v => !v)}
        className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 transition-colors duration-200
          ${remyListening ? 'bg-terra/10 border-b border-terra/20' : 'bg-bg border-b border-s3'}`}
      >
        {remyListening ? (
          <>
            <span className="flex gap-0.5 items-end h-4">
              {[1,2,3,4,3,2,1].map((h, i) => (
                <span key={i} className="w-0.5 bg-terra rounded-full animate-pulse"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms` }} />
              ))}
            </span>
            <span className="text-terra text-xs font-semibold">Remy is listening · tap to mute</span>
          </>
        ) : (
          <span className="text-t3 text-xs font-semibold">Remy is muted · tap to unmute</span>
        )}
      </button>

      {/* Top bar */}
      <div className="flex-shrink-0 bg-bg border-b border-s3 px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowConfirm(true)}
            className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="text-t2 text-sm font-semibold">
            Step {stepIdx + 1} of {recipe.steps.length}
          </span>
          <div className="w-8" />
        </div>
        {/* Dot progress */}
        <div className="flex items-center justify-center gap-2">
          {recipe.steps.map((_, i) => (
            <button key={i} onClick={() => setStepIdx(i)}
              className={`rounded-full transition-all duration-200 active:scale-90
                ${i < stepIdx  ? 'w-2 h-2 bg-terra' :
                  i === stepIdx ? 'w-3 h-3 bg-terra ring-2 ring-terra/30' :
                                  'w-2 h-2 bg-s3'}`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto scrollbar-none" style={{ paddingBottom: hasActiveTimers ? 180 : 120 }}>
        {/* Tweaked banner */}
        {step.isTweaked && isTweaked && (
          <div className="bg-[rgba(255,159,10,0.1)] border border-amber/25 rounded-xl px-4 py-2.5 mb-4 animate-fade-in">
            <p className="text-amber text-xs font-semibold">✨ Tweaked by Remy — chili flakes added for heat</p>
          </div>
        )}

        <p className="font-serif text-terra text-5xl font-bold mb-6 leading-none">{step.number}</p>
        <p className="text-t1 text-xl leading-relaxed mb-6">{stepText}</p>

        {step.timerSeconds && !timers[step.timerLabel] && (
          <button
            onClick={() => startTimer(step)}
            className="flex items-center gap-2 bg-terra/15 border border-terra/30 rounded-xl px-4 py-2.5
              text-terra text-sm font-semibold active:scale-95 transition-transform mb-6"
          >
            <span>⏱</span>
            Start {step.timerLabel} timer — {fmt(step.timerSeconds)}
          </button>
        )}
        {step.timerSeconds && timers[step.timerLabel] && (
          <div className="flex items-center gap-2 bg-s2 border border-s3 rounded-xl px-4 py-2.5 mb-6">
            <span className="text-terra text-sm">⏱ {step.timerLabel}</span>
            <span className="text-t2 text-sm">
              {timers[step.timerLabel].done ? '✓ Done!' : fmt(timers[step.timerLabel].remaining)}
            </span>
          </div>
        )}

        {/* Ask Remy */}
        <button
          onClick={() => { setAskOpen(true); setAskResponse(''); setAskInput(''); }}
          className="w-full border border-s3 rounded-xl py-3 text-t2 text-sm font-medium
            active:bg-s2 transition-colors mb-4"
        >
          🤔 Ask Remy about this step
        </button>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setStepIdx(s => Math.max(0, s - 1))}
            disabled={stepIdx === 0}
            className="flex-1 bg-s2 border border-s3 rounded-xl py-3.5 text-t1 font-semibold text-sm
              active:scale-95 transition-transform disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            onClick={() => isLast ? handleFinish() : setStepIdx(s => s + 1)}
            className="flex-[2] bg-terra text-white rounded-xl py-3.5 font-semibold text-base
              active:scale-95 transition-transform shadow-[0_0_16px_rgba(212,101,74,0.35)]"
          >
            {isLast ? '✓ Finish cooking' : 'Next step →'}
          </button>
        </div>
      </div>

      {/* Timer banner */}
      {hasActiveTimers && <TimerBanner timers={timers} />}

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => navigate(-1)}
        />
      )}

      {/* Ask Remy sheet */}
      <BottomSheet isOpen={askOpen} onClose={() => setAskOpen(false)} title="Ask Remy">
        <div className="p-4 flex flex-col gap-3">
          <input
            value={askInput}
            onChange={e => setAskInput(e.target.value)}
            placeholder={`Ask about this step, or leave blank for a tip`}
            className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3
              focus:border-terra outline-none"
          />
          <button
            onClick={handleAsk}
            disabled={askLoading}
            className="bg-terra text-white rounded-xl py-3 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {askLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking...
              </span>
            ) : 'Ask'}
          </button>
          {askResponse && (
            <div className="bg-s2 border border-s3 rounded-2xl rounded-tl-sm px-4 py-3 animate-fade-in">
              <p className="text-terra text-xs font-bold mb-1">🤖 Remy</p>
              <p className="text-t1 text-sm leading-relaxed">{askResponse}</p>
            </div>
          )}
          <div className="h-4" />
        </div>
      </BottomSheet>
    </div>
  );
}
