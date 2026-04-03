import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function VoiceHandoff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes } = useApp();
  const recipe = recipes.find(r => r.id === id);

  const [monitorVisible, setMonitorVisible] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [transcriptStep, setTranscriptStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [timerDisplay, setTimerDisplay] = useState('5:00');
  const transcriptRef = useRef(null);
  const intervalRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMonitorVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Typewriter for current transcript step
  useEffect(() => {
    if (!simOpen || !recipe) return;
    const text = recipe.steps[transcriptStep]?.beginner ?? '';
    setDisplayedText('');
    let i = 0;
    clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) clearInterval(typeRef.current);
    }, 18);
    return () => clearInterval(typeRef.current);
  }, [simOpen, transcriptStep, recipe]);

  // Auto-advance transcript
  useEffect(() => {
    if (!simOpen || !recipe) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTranscriptStep(s => {
        if (s < recipe.steps.length - 1) return s + 1;
        clearInterval(intervalRef.current);
        return s;
      });
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [simOpen, recipe]);

  // Fake timer countdown for monitor card
  useEffect(() => {
    let secs = 300;
    const t = setInterval(() => {
      secs = Math.max(0, secs - 1);
      const m = Math.floor(secs / 60);
      setTimerDisplay(`${m}:${String(secs % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const closeSimulator = () => {
    setSimOpen(false);
    setTranscriptStep(0);
    clearInterval(intervalRef.current);
  };

  if (!recipe) return null;

  return (
    <div className="min-h-full flex flex-col items-center px-5 py-6 relative"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(212,101,74,0.08) 0%, transparent 60%), #0A0A0A' }}>

      {/* Back */}
      <button onClick={() => navigate(`/recipes/${id}/cook`)}
        className="self-start mb-6 active:scale-90 transition-transform">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      {/* Pulse ring + speaker */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-32 h-32 bg-terra/10 rounded-full animate-ping" />
        <div className="absolute w-24 h-24 bg-terra/15 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
        <div className="relative w-20 h-20 bg-terra rounded-full flex items-center justify-center
          shadow-[0_0_32px_rgba(212,101,74,0.5)]">
          <span className="text-3xl">🔊</span>
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-serif text-2xl font-bold text-t1 text-center mb-2">
        Remy is on your Alexa
      </h1>
      <p className="text-t2 text-sm text-center leading-relaxed mb-5">
        You're good to go — your speaker will guide every step
      </p>

      {/* Device chip */}
      <div className="flex items-center gap-2 bg-s1 border border-s3 rounded-full px-4 py-2 mb-6">
        <span className="text-sm">🔊</span>
        <span className="text-t2 text-sm font-medium">Amazon Echo Kitchen</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2" strokeLinecap="round">
          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      </div>

      {/* Passive monitor card */}
      {monitorVisible && (
        <div className="w-full bg-s1 border border-s3 rounded-2xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider">
              Step 1 of {recipe.steps.length}
            </p>
            <span className="bg-terra text-white text-xs font-bold px-2.5 py-1 rounded-full">
              ⏱ {timerDisplay}
            </span>
          </div>
          <p className="text-t2 text-sm leading-relaxed line-clamp-2">
            {recipe.steps[0].beginner.slice(0, 90)}...
          </p>
          <p className="text-t3 text-[10px] mt-3">Your phone stays in sync while voice leads</p>
        </div>
      )}

      {/* Simulate Alexa */}
      <button
        onClick={() => { setSimOpen(true); setTranscriptStep(0); }}
        className="w-full border border-s3 rounded-xl py-3.5 text-t1 font-semibold text-sm
          active:scale-95 transition-transform mb-3"
      >
        🎙 Simulate Alexa
      </button>

      <button
        onClick={() => navigate(-1)}
        className="text-t3 text-xs underline active:text-t2"
      >
        Stop cooking
      </button>

      {/* Simulator panel */}
      <div className={`absolute bottom-0 left-0 right-0 bg-s1 border-t border-s3 rounded-t-3xl z-40
        transition-transform duration-300 ease-out ${simOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '80%' }}>

        <div className="flex justify-center pt-3 mb-1">
          <div className="w-10 h-1 bg-s3 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-s3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔊</span>
            <span className="text-t1 font-semibold text-sm">Remy via Alexa</span>
          </div>
          <button onClick={closeSimulator}
            className="w-7 h-7 bg-s2 rounded-full flex items-center justify-center text-t2 text-lg active:scale-90 transition-transform">
            ×
          </button>
        </div>

        <div ref={transcriptRef} className="overflow-y-auto scrollbar-none h-[calc(100%-80px)] px-5 py-4 space-y-4">
          {recipe.steps.map((s, i) => (
            <div key={i} className={`transition-opacity duration-300 ${i > transcriptStep ? 'opacity-20' : ''}`}>
              <p className="text-t3 text-[10px] font-semibold uppercase tracking-wider mb-1">Step {i + 1}</p>
              <div className={`flex gap-2 ${i < transcriptStep ? 'opacity-40' : ''}`}>
                <span className="text-terra text-xs font-bold flex-shrink-0 mt-0.5">🔊 Remy:</span>
                <p className={`text-sm leading-relaxed ${i === transcriptStep ? 'text-t1' : 'text-t2'}`}>
                  {i === transcriptStep ? displayedText : s.beginner}
                  {i === transcriptStep && displayedText.length < s.beginner.length && (
                    <span className="inline-block w-0.5 h-3.5 bg-terra ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </div>
              {i < transcriptStep && (
                <div className="h-px bg-s3 mt-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
