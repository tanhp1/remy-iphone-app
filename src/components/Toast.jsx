import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  return (
    <div className="absolute bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="animate-toast-in bg-s2 border border-s3 rounded-2xl px-4 py-3 shadow-xl
            flex items-center gap-3 max-w-[320px] w-full"
        >
          {toast.type === 'success' && <span className="text-success text-base flex-shrink-0">✓</span>}
          {toast.type === 'warning' && <span className="text-amber text-base flex-shrink-0">⚡</span>}
          {toast.type === 'default' && <span className="text-terra text-base flex-shrink-0">✨</span>}
          <span className="text-t1 text-sm font-medium leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
