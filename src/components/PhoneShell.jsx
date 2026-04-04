import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import Toast from './Toast';
import BottomSheet from './BottomSheet';
import { useApp } from '../context/AppContext';

function StatusBar() {
  return (
    <div className="flex-shrink-0 h-14 flex items-end pb-2 px-8 relative z-20 pointer-events-none">
      {/* Time */}
      <span className="text-white text-[15px] font-semibold flex-1">9:41</span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-3 w-[126px] h-[37px] bg-black rounded-full z-30
        flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] border border-[#2a2a2a]" />
        <div className="w-[12px] h-[12px] rounded-full bg-[#111] border border-[#333]" />
      </div>

      {/* Status icons */}
      <div className="flex items-center gap-1.5 pointer-events-none">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
          <rect x="0"    y="6" width="3" height="6" rx="0.5"/>
          <rect x="4.5"  y="4" width="3" height="8" rx="0.5"/>
          <rect x="9"    y="2" width="3" height="10" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
          <circle cx="8" cy="11" r="1"/>
          <path d="M5.5 8.8C6.3 8 7.1 7.5 8 7.5s1.7.5 2.5 1.3" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M3.3 6.6C4.7 5.2 6.3 4.4 8 4.4s3.3.8 4.7 2.2" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7"/>
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-[1px]">
          <div className="w-[25px] h-[12px] rounded-[3px] border border-white/50 p-[2px] flex items-center">
            <div className="h-full w-[17px] bg-white rounded-[1px]" />
          </div>
          <div className="w-[2px] h-[5px] bg-white/40 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}

function SplashScreen() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { setTimeout(() => setVisible(false), 1900); }, []);
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-bg rounded-[47px] splash-fade">
      <div className="relative mb-5">
        <div className="w-24 h-24 rounded-3xl bg-terra/15 flex items-center justify-center
          shadow-[0_0_48px_rgba(212,101,74,0.35)]">
          <span className="text-5xl">👨‍🍳</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-terra rounded-xl flex items-center justify-center
          shadow-[0_0_12px_rgba(212,101,74,0.5)]">
          <span className="text-white text-sm font-bold">✨</span>
        </div>
      </div>
      <p className="font-serif text-3xl font-bold text-t1 tracking-tight mb-1">Little Chef</p>
      <p className="text-t3 text-xs font-medium">AI Cooking Assistant</p>
      <div className="absolute bottom-12 flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-terra/40"
            style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite alternate` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { from { opacity:0.3; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

export default function PhoneShell() {
  const location = useLocation();
  const { sheet, closeSheet } = useApp();

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center py-8">
      {/* iPhone 15 Pro body */}
      <div className="relative" style={{ width: 393, height: 852 }}>

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[172px] w-[3px] h-8   bg-[#4A4A4A] rounded-l-sm" />
        <div className="absolute -left-[3px] top-[222px] w-[3px] h-14  bg-[#4A4A4A] rounded-l-sm" />
        <div className="absolute -left-[3px] top-[296px] w-[3px] h-14  bg-[#4A4A4A] rounded-l-sm" />
        <div className="absolute -right-[3px] top-[240px] w-[3px] h-20 bg-[#4A4A4A] rounded-r-sm" />

        {/* Outer shell */}
        <div
          className="absolute inset-0 rounded-[50px]"
          style={{
            background: '#1A1A1A',
            boxShadow: `
              0 0 0 1px #3A3A3A,
              0 0 0 3px #2A2A2A,
              0 40px 100px rgba(0,0,0,0.85),
              0 20px 40px rgba(0,0,0,0.6),
              inset 0 0 0 1px rgba(255,255,255,0.05)
            `,
          }}
        />

        {/* Screen glass */}
        <div
          className="absolute inset-[3px] rounded-[47px] overflow-hidden bg-bg flex flex-col"
          style={{ position: 'absolute' }}
        >
          <SplashScreen />
          <StatusBar />

          {/* Page content */}
          <div
            key={location.pathname}
            className="flex-1 overflow-y-auto scrollbar-none animate-page-enter"
          >
            <Outlet />
          </div>

          <BottomNav />

          {/* Home indicator */}
          <div className="flex-shrink-0 flex justify-center pb-2 pt-1">
            <div className="w-32 h-[5px] bg-white/20 rounded-full" />
          </div>

          {/* Overlays */}
          <Toast />
          <BottomSheet isOpen={sheet.open} onClose={closeSheet} title={sheet.title}>
            {sheet.content}
          </BottomSheet>
        </div>
      </div>
    </div>
  );
}
