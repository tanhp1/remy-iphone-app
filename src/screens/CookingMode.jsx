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

function getPhase(step) {
  if (step.phase) return step.phase;
  if (step.timerSeconds > 600) return 'long';
  return 'cook';
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

function SectionHeader({ icon, title, count, done }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{icon}</span>
      <p className="text-t3 text-xs font-semibold uppercase tracking-wider flex-1">{title}</p>
      {count > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
          ${done === count ? 'bg-sage/20 text-sage' : 'bg-s3 text-t3'}`}>
          {done}/{count}
        </span>
      )}
    </div>
  );
}

function IngredientRow({ ing, checked, onToggle, ratio, scaleQty }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 bg-s1 border rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]
        ${checked ? 'border-sage/40 opacity-60' : 'border-s3'}`}
    >
      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors
        ${checked ? 'bg-sage' : 'border-2 border-s3'}`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="1 4 3.5 6.5 9 1"/>
          </svg>
        )}
      </div>
      <span className={`text-sm ${checked ? 'line-through text-t3' : 'text-t1'}`}>
        {scaleQty(ing.qty, ratio)} {ing.unit} {ing.item}
      </span>
    </button>
  );
}

function StepCard({ step, expanded, done, onExpand, onDone, onStartTimer, onAsk, timers, isTweaked }) {
  const phase = getPhase(step);
  const timer = step.timerSeconds ? timers[step.timerLabel] : null;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200
      ${done ? 'border-sage/30 opacity-60' : expanded ? 'border-terra/40' : 'border-s3'}
      ${done ? 'bg-s1' : expanded ? 'bg-s1' : 'bg-s1'}`}>

      {/* Step header — always visible */}
      <button
        onClick={onExpand}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-s2 transition-colors"
      >
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
          ${done ? 'bg-sage' : expanded ? 'bg-terra/15' : 'bg-s2'}`}>
          {done ? (
            <svg width="12" height="10" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="1 4 3.5 6.5 9 1"/>
            </svg>
          ) : (
            <span className={`font-serif font-bold text-sm ${expanded ? 'text-terra' : 'text-t2'}`}>{step.number}</span>
          )}
        </div>
        <p className={`flex-1 text-sm leading-snug line-clamp-2
          ${done ? 'line-through text-t3' : expanded ? 'text-t1 font-medium' : 'text-t2'}`}>
          {step.beginner}
        </p>
        {step.timerSeconds && !done && (
          <span className="flex-shrink-0 text-[10px] text-terra font-semibold bg-terra/10 px-2 py-0.5 rounded-full">
            ⏱ {Math.ceil(step.timerSeconds / 60)}m
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 animate-fade-in">
          {/* Tweaked banner */}
          {step.isTweaked && isTweaked && (
            <div className="bg-[rgba(255,159,10,0.1)] border border-amber/25 rounded-lg px-3 py-2">
              <p className="text-amber text-xs font-semibold">✨ Tweaked by Little Chef — chili flakes added for heat</p>
            </div>
          )}

          <p className="text-t1 text-base leading-relaxed">{step.beginner}</p>

          {/* Timer */}
          {step.timerSeconds && !timer && (
            <button onClick={() => onStartTimer(step)}
              className="flex items-center gap-2 bg-terra/15 border border-terra/30 rounded-xl px-4 py-2.5
                text-terra text-sm font-semibold active:scale-95 transition-transform self-start">
              ⏱ Start {step.timerLabel} — {fmt(step.timerSeconds)}
            </button>
          )}
          {step.timerSeconds && timer && (
            <div className="flex items-center gap-2 bg-s2 border border-s3 rounded-xl px-4 py-2.5 self-start">
              <span className="text-terra text-sm">⏱ {step.timerLabel}</span>
              <span className="text-t1 font-bold text-sm">
                {timer.done ? '✓ Done!' : fmt(timer.remaining)}
              </span>
            </div>
          )}

          {/* Actions row */}
          <div className="flex gap-2">
            <button onClick={onAsk}
              className="flex-1 border border-s3 rounded-xl py-2.5 text-t2 text-xs font-semibold
                active:bg-s2 transition-colors">
              🤔 Ask Little Chef
            </button>
            <button onClick={onDone}
              className="flex-1 bg-terra text-white rounded-xl py-2.5 text-sm font-semibold
                active:scale-95 transition-transform shadow-[0_0_12px_rgba(212,101,74,0.3)]">
              Done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Scale a qty string by a ratio
function scaleQty(qtyStr, ratio) {
  if (!qtyStr || ratio === 1) return qtyStr;
  const match = String(qtyStr).match(/^([\d.\/]+)(.*)/);
  if (!match) return qtyStr;
  let num;
  if (match[1].includes('/')) {
    const [n, d] = match[1].split('/');
    num = parseFloat(n) / parseFloat(d);
  } else {
    num = parseFloat(match[1]);
  }
  if (isNaN(num)) return qtyStr;
  const scaled = num * ratio;
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
  return formatted + match[2];
}

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRecipes, user, tweakedRecipes, servingsOverride, markRecentlyCooked, addToast } = useApp();

  const recipe = allRecipes.find(r => r.id === id);
  const servings = servingsOverride?.[id] ?? recipe?.servings ?? 2;
  const ratio = recipe ? servings / recipe.servings : 1;

  const [donePrep, setDonePrep] = useState(new Set()); // ingredient indices
  const [doneSteps, setDoneSteps] = useState(new Set()); // step numbers
  const [expandedStep, setExpandedStep] = useState(null); // step number
  const [timers, setTimers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [remyListening, setRemyListening] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [askContextStep, setAskContextStep] = useState(null); // step object
  const [askInput, setAskInput] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const remyListeningRef = useRef(true);

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

  // Group steps by phase
  const prepSteps  = recipe.steps.filter(s => getPhase(s) === 'prep' || getPhase(s) === 'long');
  const cookSteps  = recipe.steps.filter(s => getPhase(s) === 'cook');
  const finishSteps = recipe.steps.filter(s => getPhase(s) === 'finish');

  const totalSteps = recipe.steps.length;
  const progress = totalSteps > 0 ? doneSteps.size / totalSteps : 0;
  const allDone = doneSteps.size === totalSteps;

  const hasActiveTimers = Object.values(timers).some(t => t.running || t.done);

  // Keep ref in sync
  remyListeningRef.current = remyListening;

  // Voice recognition for listening banner
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
      setVoiceTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setVoiceTranscript('');
        setAskInput(t);
        setAskOpen(true);
        setAskResponse('');
        handleAskWithText(t, null);
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (remyListeningRef.current) {
        try { rec.start(); } catch (err) {}
      }
    };
    if (remyListeningRef.current) {
      try { rec.start(); } catch (err) {}
    }
    return () => {
      remyListeningRef.current = false;
      try { rec.abort(); } catch (err) {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (remyListening) {
      try { rec.start(); } catch (err) {}
    } else {
      try { rec.abort(); } catch (err) {}
      setVoiceTranscript('');
    }
  }, [remyListening]);

  const handleAskWithText = (text, contextStep) => {
    setAskLoading(true);
    setTimeout(() => {
      const lower = text.trim().toLowerCase();
      const stepRef = contextStep || recipe.steps[0];
      if (!lower) {
        setAskResponse(getStepContextResponse(stepRef.beginner, stepRef.number - 1));
      } else {
        const key = Object.keys(ASK_REMY_RESPONSES).find(k => k !== 'default' && lower.includes(k));
        setAskResponse(key ? ASK_REMY_RESPONSES[key] : getStepContextResponse(stepRef.beginner, stepRef.number - 1));
      }
      setAskLoading(false);
    }, 800);
  };

  const handleAsk = () => {
    handleAskWithText(askInput, askContextStep);
  };

  const startTimer = (step) => {
    setTimers(prev => ({
      ...prev,
      [step.timerLabel]: { label: step.timerLabel, total: step.timerSeconds, remaining: step.timerSeconds, running: true, done: false },
    }));
  };

  const markStepDone = (stepNumber) => {
    setDoneSteps(prev => {
      const next = new Set(prev);
      next.add(stepNumber);
      return next;
    });
    setExpandedStep(null);
    // Auto-expand the next incomplete step in the same or next section
    const allSteps = [...prepSteps, ...cookSteps, ...finishSteps];
    const idx = allSteps.findIndex(s => s.number === stepNumber);
    for (let i = idx + 1; i < allSteps.length; i++) {
      if (!doneSteps.has(allSteps[i].number)) {
        setExpandedStep(allSteps[i].number);
        break;
      }
    }
  };

  const toggleIngredient = (idx) => {
    setDonePrep(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const openAsk = (step) => {
    setAskContextStep(step);
    setAskInput('');
    setAskResponse('');
    setAskOpen(true);
  };

  const handleFinish = () => {
    markRecentlyCooked(id);
    navigate(`/recipes/${id}/rating`);
  };

  const renderStepSection = (steps, icon, title) => {
    if (steps.length === 0) return null;
    const sectionDone = steps.filter(s => doneSteps.has(s.number)).length;
    return (
      <div className="mb-5">
        <SectionHeader icon={icon} title={title} count={steps.length} done={sectionDone} />
        <div className="flex flex-col gap-2">
          {steps.map(step => (
            <StepCard
              key={step.number}
              step={step}
              expanded={expandedStep === step.number}
              done={doneSteps.has(step.number)}
              isTweaked={isTweaked}
              timers={timers}
              onExpand={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
              onDone={() => markStepDone(step.number)}
              onStartTimer={startTimer}
              onAsk={() => openAsk(step)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg min-h-full flex flex-col">

      {/* Little Chef listening banner */}
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
            <span className="text-terra text-xs font-semibold">
              {voiceTranscript ? `"${voiceTranscript}"` : 'Little Chef is listening · tap to mute'}
            </span>
          </>
        ) : (
          <span className="text-t3 text-xs font-semibold">Little Chef is muted · tap to unmute</span>
        )}
      </button>

      {/* Top bar */}
      <div className="flex-shrink-0 bg-bg border-b border-s3 px-5 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <button onClick={() => setShowConfirm(true)}
            className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="text-center">
            <p className="text-t1 font-semibold text-sm leading-tight truncate max-w-[180px]">{recipe.title}</p>
            <p className="text-t3 text-xs">{doneSteps.size} of {totalSteps} steps done</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-s3 rounded-full overflow-hidden">
          <div
            className="h-full bg-terra rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pt-4"
        style={{ paddingBottom: hasActiveTimers ? 180 : 120 }}>

        {/* Section 1: Gather & Prep (ingredients) */}
        <div className="mb-5">
          <SectionHeader
            icon="🛒"
            title="Gather & Prep"
            count={recipe.ingredients.filter(i => !i.isNew || isTweaked).length}
            done={donePrep.size}
          />
          <div className="flex flex-col gap-2">
            {recipe.ingredients.map((ing, i) => {
              if (ing.isNew && !isTweaked) return null;
              return (
                <IngredientRow
                  key={i}
                  ing={ing}
                  checked={donePrep.has(i)}
                  onToggle={() => toggleIngredient(i)}
                  ratio={ratio}
                  scaleQty={scaleQty}
                />
              );
            })}
          </div>
        </div>

        {/* Section 2: Start These First (prep + long) */}
        {renderStepSection(prepSteps, '⏱', 'Start These First')}

        {/* Section 3: Cooking Steps (cook) */}
        {renderStepSection(cookSteps, '🍳', 'Cooking Steps')}

        {/* Section 4: Final Touches (finish) */}
        {renderStepSection(finishSteps, '✨', 'Final Touches')}

        {/* Tips */}
        {recipe.tips && (
          <div className="mb-4 bg-s1 border border-s3 rounded-xl px-4 py-3">
            <p className="text-terra text-xs font-bold mb-1">💡 Chef's Tip</p>
            <p className="text-t2 text-sm">{recipe.tips}</p>
          </div>
        )}

        {/* Finish button */}
        <button
          onClick={handleFinish}
          className={`w-full rounded-2xl py-4 font-semibold text-base mb-4 transition-all
            ${allDone
              ? 'bg-terra text-white shadow-[0_0_24px_rgba(212,101,74,0.45)] active:scale-95'
              : 'bg-s2 border border-s3 text-t2 active:scale-95'}`}
        >
          {allDone ? '🎉 Finish & Rate' : `Finish Cooking (${doneSteps.size}/${totalSteps} done)`}
        </button>
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

      {/* Ask Little Chef sheet */}
      <BottomSheet isOpen={askOpen} onClose={() => setAskOpen(false)} title="Ask Little Chef">
        <div className="p-4 flex flex-col gap-3">
          {askContextStep && (
            <div className="bg-s2 border border-s3 rounded-xl px-3 py-2">
              <p className="text-t3 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Step {askContextStep.number}</p>
              <p className="text-t2 text-xs line-clamp-2">{askContextStep.beginner}</p>
            </div>
          )}
          <input
            value={askInput}
            onChange={e => setAskInput(e.target.value)}
            placeholder="Ask about this step, or leave blank for a tip"
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
              <p className="text-terra text-xs font-bold mb-1">🤖 Little Chef</p>
              <p className="text-t1 text-sm leading-relaxed">{askResponse}</p>
            </div>
          )}
          <div className="h-4" />
        </div>
      </BottomSheet>
    </div>
  );
}
