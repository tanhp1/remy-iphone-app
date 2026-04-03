function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function TimerBanner({ timers, onComplete }) {
  const active = Object.values(timers).filter(t => t.running || t.done);
  if (active.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-s1 border-t border-s3 rounded-t-2xl shadow-xl px-4 pt-3 pb-4">
      {/* Multiple timer pills */}
      {active.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3 pb-1">
          {active.map(t => (
            <div
              key={t.label}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                ${t.done ? 'bg-success/20 text-success' : 'bg-terra/20 text-terra'}`}
            >
              <span>{t.emoji ?? '⏱'}</span>
              <span>{t.label}</span>
              <span>{t.done ? '✓' : fmt(t.remaining)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary (most recent) timer */}
      {(() => {
        const primary = active[active.length - 1];
        return (
          <div className={`rounded-xl px-4 py-3 ${primary.done ? 'animate-flash-amber bg-amber/10' : 'bg-s2'}`}>
            <p className="text-t2 text-xs font-semibold mb-0.5">{primary.label}</p>
            <p className={`font-serif text-4xl font-bold tracking-tight ${primary.done ? 'text-amber' : 'text-terra'}`}>
              {primary.done ? `✓ ${primary.label} done!` : fmt(primary.remaining)}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
