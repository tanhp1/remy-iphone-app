import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const VOICE_COMMANDS = [
  '"Next step"', '"Repeat that"', '"Set a timer"', '"What do I need?"', '"Stop cooking"',
];

export default function VoiceHandoff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRecipes } = useApp();
  const recipe = allRecipes.find(r => r.id === id);

  const [stepIdx, setStepIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [processing, setProcessing] = useState(false);
  const [waveBars, setWaveBars] = useState(Array(9).fill(6));
  const [showCommands, setShowCommands] = useState(false);
  const [noSupport, setNoSupport] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Refs to avoid stale closures in recognition callbacks
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const processingRef = useRef(false);
  const stateRef = useRef({ stepIdx: 0, recipe: null });

  // Keep stateRef in sync
  stateRef.current = { stepIdx, recipe };

  const isLast = stepIdx === (recipe?.steps.length ?? 1) - 1;

  // Waveform animation
  useEffect(() => {
    if (!listening) { setWaveBars(Array(9).fill(6)); return; }
    const id = setInterval(() => {
      setWaveBars(prev => prev.map(() => 6 + Math.floor(Math.random() * 22)));
    }, 150);
    return () => clearInterval(id);
  }, [listening]);

  const processCommand = (text) => {
    const { stepIdx: idx, recipe: rec } = stateRef.current;
    if (!rec) return;
    const currentStep = rec.steps[idx];
    const last = idx === rec.steps.length - 1;

    setTranscript(text);
    setListening(false);
    listeningRef.current = false;
    setProcessing(true);
    processingRef.current = true;

    setTimeout(() => {
      setProcessing(false);
      processingRef.current = false;
      setTranscript('');

      const lower = text.toLowerCase();

      if (lower.includes('next')) {
        if (!last) {
          const next = idx + 1;
          setStepIdx(next);
          setReply(`Step ${next + 1}. ${rec.steps[next].beginner}`);
        } else {
          setReply("That's the last step! Great job. Tap Finish when you're ready to rate your cook.");
        }
      } else if (lower.includes('repeat') || lower.includes('again')) {
        setReply(`Step ${idx + 1}. ${currentStep.beginner}`);
      } else if ((lower.includes('timer') || lower.includes('time')) && currentStep?.timerSeconds) {
        setReply(`Starting a ${Math.floor(currentStep.timerSeconds / 60)} minute timer for ${currentStep.timerLabel}.`);
      } else if (lower.includes('need') || lower.includes('ingredient')) {
        const items = rec.ingredients.slice(0, 4).map(i => `${i.qty} ${i.unit} ${i.item}`.trim()).join(', ');
        setReply(`For this recipe you need: ${items}, and more.`);
      } else if (lower.includes('stop') || lower.includes('exit') || lower.includes('quit')) {
        navigate(-1);
        return;
      } else {
        setReply(`I heard "${text}" — try saying Next step, Repeat that, or Set a timer.`);
      }

      // Restart listening after processing
      setListening(true);
      listeningRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }, 700);
  };

  // Set up SpeechRecognition once on mount
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { setNoSupport(true); return; }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        processCommand(t);
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setPermissionDenied(true);
        setListening(false);
        listeningRef.current = false;
      }
    };

    rec.onend = () => {
      // Auto-restart only if we're still in listening mode
      if (listeningRef.current && !processingRef.current) {
        try { rec.start(); } catch (e) {}
      }
    };

    try {
      rec.start();
      setListening(true);
      listeningRef.current = true;
    } catch (e) {}

    // Auto-read first step
    if (recipe) {
      setTimeout(() => {
        setReply(`Step 1. ${recipe.steps[0].beginner}`);
      }, 800);
    }

    return () => {
      listeningRef.current = false;
      try { rec.abort(); } catch (e) {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!recipe) return null;

  // Tap-button fallback (also usable as examples)
  const handleTapCommand = (cmd) => {
    setShowCommands(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    processCommand(cmd.replace(/"/g, ''));
  };

  const step = recipe.steps[stepIdx];

  return (
    <div className="min-h-full flex flex-col relative"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,101,74,0.12) 0%, transparent 65%), #0A0A0A' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={() => navigate(`/recipes/${id}/cook`)}
          className="w-9 h-9 bg-white/8 rounded-full flex items-center justify-center active:scale-90 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${listening ? 'bg-terra animate-pulse' : 'bg-s3'}`} />
          <span className="text-t2 text-xs font-semibold">
            {permissionDenied ? 'Mic blocked — use buttons below' :
             noSupport ? 'Voice not supported' :
             processing ? 'Processing...' :
             listening ? 'Listening...' : 'Paused'}
          </span>
        </div>
        <button onClick={() => navigate(`/recipes/${id}/rating`)}
          className="text-terra text-xs font-semibold active:opacity-70">
          Finish
        </button>
      </div>

      {/* Step progress */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex gap-1 mb-2">
          {recipe.steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300
              ${i < stepIdx ? 'bg-terra' : i === stepIdx ? 'bg-terra/70' : 'bg-s3'}`} />
          ))}
        </div>
        <p className="text-t3 text-xs">Step {stepIdx + 1} of {recipe.steps.length} · {recipe.title}</p>
      </div>

      {/* Avatar + waveform */}
      <div className="flex flex-col items-center py-5 flex-shrink-0">
        <div className="relative mb-4">
          {listening && (
            <>
              <div className="absolute inset-0 rounded-full bg-terra/10 animate-ping scale-125" />
              <div className="absolute inset-0 rounded-full bg-terra/8 animate-ping scale-150" style={{ animationDelay: '0.4s' }} />
            </>
          )}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${listening ? 'bg-terra shadow-[0_0_32px_rgba(212,101,74,0.6)]' : 'bg-s2 border border-s3'}`}>
            <span className="text-3xl">👨‍🍳</span>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-10">
          {waveBars.map((h, i) => (
            <div key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${listening ? 'bg-terra' : 'bg-s3'}`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {processing && (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3.5 h-3.5 border-2 border-s3 border-t-terra rounded-full animate-spin" />
            <span className="text-t3 text-xs">Processing...</span>
          </div>
        )}
        {transcript && !processing && (
          <p className="text-t3 text-xs mt-2 italic">"{transcript}"</p>
        )}
        {permissionDenied && (
          <p className="text-danger text-[10px] mt-2 text-center px-6">
            Microphone access was blocked. Enable it in your browser settings, or use the buttons below.
          </p>
        )}
      </div>

      {/* Reply card */}
      <div className="flex-1 px-5 overflow-y-auto scrollbar-none">
        {reply && (
          <div className="bg-s1 border border-s3 rounded-2xl rounded-tl-sm px-4 py-4 mb-4 animate-fade-in">
            <p className="text-terra text-xs font-bold mb-2 flex items-center gap-1.5">
              <span>👨‍🍳</span> Little Chef
            </p>
            <p className="text-t1 text-sm leading-relaxed">{reply}</p>
            {step?.timerSeconds && (
              <div className="mt-3 flex items-center gap-2 bg-terra/10 rounded-xl px-3 py-2">
                <span className="text-terra text-xs">⏱</span>
                <span className="text-terra text-xs font-semibold">
                  {step.timerLabel} — {Math.floor(step.timerSeconds / 60)} min
                </span>
                <button
                  onClick={() => handleTapCommand('"Set a timer"')}
                  className="ml-auto text-terra text-[10px] font-bold border border-terra/30 rounded-full px-2 py-0.5 active:bg-terra/20">
                  Start
                </button>
              </div>
            )}
          </div>
        )}

        {/* Voice commands (examples + tap fallback) */}
        <button
          onClick={() => setShowCommands(v => !v)}
          className="w-full flex items-center justify-between bg-s1 border border-s3 rounded-xl px-4 py-3 mb-3"
        >
          <span className="text-t2 text-xs font-semibold">
            {noSupport || permissionDenied ? 'Tap a command' : 'Voice commands (or tap)'}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: showCommands ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showCommands && (
          <div className="flex flex-col gap-2 mb-4 animate-fade-in">
            {VOICE_COMMANDS.map(cmd => (
              <button key={cmd} onClick={() => handleTapCommand(cmd)}
                className="flex items-center gap-3 bg-s1 border border-s3 rounded-xl px-4 py-3
                  active:bg-s2 transition-colors text-left">
                <span className="text-terra text-sm">🎙</span>
                <span className="text-t1 text-sm font-medium">{cmd}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-s3/50">
        <div className="flex gap-3">
          <button
            onClick={() => handleTapCommand('"Repeat that"')}
            className="flex-1 bg-s2 border border-s3 rounded-xl py-3.5 text-t2 text-sm font-semibold
              active:scale-95 transition-transform">
            ↩ Repeat
          </button>
          <button
            onClick={() => handleTapCommand(isLast ? '"Stop cooking"' : '"Next step"')}
            className="flex-[2] bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
              active:scale-95 transition-transform shadow-[0_0_16px_rgba(212,101,74,0.35)]">
            {isLast ? '✓ Finish' : 'Next step →'}
          </button>
        </div>
      </div>
    </div>
  );
}
