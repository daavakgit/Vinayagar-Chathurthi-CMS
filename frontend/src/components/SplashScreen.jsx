import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // 1. Hold full opacity for 2500ms, then trigger 500ms fade-out (total 3000ms)
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2500);

    // 2. Navigate to existing portal/login page at exact 3000ms mark
    const navTimer = setTimeout(() => {
      navigate('/portal', { replace: true });
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white px-4 select-none transition-opacity duration-500 ease-in-out ${fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Background Devotional Soft Radial Glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/25 to-yellow-400/20 blur-3xl animate-pulse pointer-events-none" />

      {/* Main Centered Visual & Text Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm sm:max-w-md animate-splash-fade-in">
        {/* Vinayagar Aura Ring & Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Outer Glowing Halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 blur-md opacity-40 animate-pulse" />

          {/* Inner Emblem Container */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-600/30 to-amber-900/40 border border-amber-400/30 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transform transition-transform duration-700 hover:scale-105">
            <span className="text-4xl sm:text-6xl drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              🪔
            </span>
            <span className="text-[10px] sm:text-xs mt-1 font-bold text-amber-200 tracking-widest uppercase">
              Lord Ganesha
            </span>
          </div>
        </div>

        {/* Tamil Devotional Title */}
        <div className="space-y-2 pt-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 tracking-wide drop-shadow-md">
            விநாயகர் சதுர்த்தி விழா
          </h1>
          <p className="text-xs sm:text-sm font-medium text-amber-200/80 tracking-widest uppercase">
            Vinayagar Chathurthi Celebration 2026
          </p>
        </div>

        {/* Minimal Smooth Loading Indicator */}
        <div className="w-36 sm:w-48 h-1 bg-white/10 rounded-full overflow-hidden relative mt-4 border border-amber-400/20">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full animate-splash-progress" />
        </div>

        <div className="text-[11px] text-amber-200/60 font-medium tracking-wider pt-1">
          Loading Official Portal...
        </div>
      </div>
    </div>
  );
};
