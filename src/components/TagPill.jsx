export default function TagPill({ label, active = false, onClick, className = '' }) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap
        transition-all duration-150 active:scale-95
        ${active
          ? 'bg-terra text-white'
          : 'bg-s2 text-t2 border border-s3'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {label}
    </span>
  );
}
