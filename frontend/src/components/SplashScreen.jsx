import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { warmUpBackend } from '../services/api';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    const splashStartTime = Date.now();
    const MIN_DISPLAY_TIME = 2500; // 2.5s display before starting 500ms transition into /portal

    // Trigger backend pre-warm asynchronously without blocking UI timing
    const prewarmPromise = warmUpBackend();

    let fadeTimer = null;
    let navTimer = null;

    const handleSplashTransition = async () => {
      // Wait for prewarm resolve or max safety timeout
      await prewarmPromise;

      if (isUnmounted.current) return;

      const elapsedTime = Date.now() - splashStartTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

      fadeTimer = setTimeout(() => {
        if (isUnmounted.current) return;
        setFadingOut(true);

        navTimer = setTimeout(() => {
          if (!isUnmounted.current) {
            navigate('/portal', { replace: true });
          }
        }, 500);
      }, remainingTime);
    };

    handleSplashTransition();

    return () => {
      isUnmounted.current = true;
      if (fadeTimer) clearTimeout(fadeTimer);
      if (navTimer) clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#090D16] via-[#141226] to-[#090D16] text-white px-4 select-none overflow-hidden min-h-[100dvh] transition-all duration-500 ease-in-out ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Devotional Ambient Glow */}
      <div className="absolute w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-amber-600/20 via-orange-500/25 to-yellow-500/15 blur-3xl animate-halo-glow pointer-events-none" />

      {/* Floating Golden Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80%] left-[20%] w-1.5 h-1.5 rounded-full bg-amber-300/70 shadow-[0_0_8px_#f59e0b] animate-particle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[85%] left-[50%] w-2 h-2 rounded-full bg-orange-300/80 shadow-[0_0_10px_#f97316] animate-particle" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[75%] left-[80%] w-1 h-1 rounded-full bg-yellow-200/90 shadow-[0_0_6px_#eab308] animate-particle" style={{ animationDelay: '2.1s' }} />
        <div className="absolute top-[90%] left-[35%] w-2.5 h-2.5 rounded-full bg-amber-400/60 shadow-[0_0_12px_#f59e0b] animate-particle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-[70%] left-[65%] w-1.5 h-1.5 rounded-full bg-amber-200/75 shadow-[0_0_8px_#fef08a] animate-particle" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Main Centered Motion Graphic Card */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-sm sm:max-w-md w-full px-2">
        {/* Lord Ganesha Visual Reveal */}
        <div className="relative flex items-center justify-center animate-ganesha-reveal">
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-3 sm:-inset-4 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/40 to-yellow-400/30 blur-xl animate-halo-glow" />

          {/* Ganesha Frame */}
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-amber-500/20 via-orange-600/30 to-amber-900/40 border border-amber-400/40 backdrop-blur-md shadow-[0_0_35px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src="/ganesha-splash.png"
                alt="Lord Ganesha"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-full transform transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-amber-300">
                <span className="text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">🪔</span>
                <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Lord Ganesha</span>
              </div>
            )}
          </div>
        </div>

        {/* Text Sequence */}
        <div className="space-y-2 pt-1 w-full">
          {/* Main Tamil Title */}
          <h1 className="animate-text-reveal-1 text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-100 tracking-wide drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
            விநாயகர் சதுர்த்தி விழா
          </h1>

          {/* Secondary Title */}
          <h2 className="animate-text-reveal-2 text-xl sm:text-2xl font-black text-amber-400 tracking-wider drop-shadow-md">
            PPP-VCMS
          </h2>

          {/* Small Subtitle */}
          <p className="animate-text-reveal-3 text-xs sm:text-sm font-medium text-amber-200/80 tracking-wide max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Vinayagar Chathurthi Contribution Management System
          </p>

          {/* Year Badge */}
          <div className="animate-text-reveal-4 pt-2">
            <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              2026
            </span>
          </div>
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-32 sm:w-44 h-1 bg-white/10 rounded-full overflow-hidden relative mt-2 border border-amber-400/20">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 rounded-full animate-splash-progress" />
        </div>
      </div>
    </div>
  );
};
