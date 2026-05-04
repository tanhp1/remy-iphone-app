import { useLocation, useNavigate } from 'react-router-dom';

const HIDDEN_ON = ['/cook', '/voice', '/rating'];

const tabs = [
  {
    id: 'home', label: 'Home', path: '/',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#D4654A' : 'none'}
        stroke={active ? '#D4654A' : '#6D6D72'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'recipes', label: 'Recipes', path: '/recipes',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#D4654A' : '#6D6D72'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 'import', label: 'Import', path: '/import',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#D4654A' : '#6D6D72'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Profile', path: '/profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#D4654A' : '#6D6D72'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hide = HIDDEN_ON.some(p => location.pathname.includes(p));
  if (hide) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex-shrink-0 bg-s1/95 border-t border-s3 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 active:scale-90 transition-transform duration-100"
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-semibold ${active ? 'text-terra' : 'text-t3'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
