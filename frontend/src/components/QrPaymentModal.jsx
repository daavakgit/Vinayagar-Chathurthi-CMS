import React, { useState, useEffect, useCallback } from 'react';

/**
 * Responsive Mobile Bottom-Sheet & Desktop Centered QR Payment Modal
 * Features safe-area awareness, viewport height constraints, non-scrollable background lock,
 * and responsive QR sizing for mobile screens (360px, 390px, 430px) & desktop.
 */
export const QrPaymentModal = ({
  isOpen,
  onClose,
  qrImageUrl = '/phonepe-qr.jpg',
  accountName = 'Harish C'
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [animateState, setAnimateState] = useState('closed'); // 'closed' | 'opening' | 'visible' | 'closing'
  const [stage, setStage] = useState(0); // 0: init, 1: header, 2: qr, 3: details & buttons

  // Smooth exit animation (250ms)
  const handleClose = useCallback(() => {
    if (animateState === 'closing' || animateState === 'closed') return;
    setAnimateState('closing');

    const exitTimer = setTimeout(() => {
      setAnimateState('closed');
      setIsRendered(false);
      setStage(0);
      if (onClose) onClose();
    }, 250);

    return () => clearTimeout(exitTimer);
  }, [animateState, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (animateState === 'visible' || animateState === 'opening')) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animateState, handleClose]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Entrance animation trigger and staggered steps
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);

      const timer0 = setTimeout(() => setAnimateState('opening'), 20);
      const timer1 = setTimeout(() => setStage(1), 50);
      const timer2 = setTimeout(() => setStage(2), 120);
      const timer3 = setTimeout(() => {
        setStage(3);
        setAnimateState('visible');
      }, 220);

      return () => {
        clearTimeout(timer0);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (animateState === 'visible' || animateState === 'opening') {
      handleClose();
    }
  }, [isOpen]);

  const handleDownloadQr = (e) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = 'Vinayagar-Chathurthi-PhonePe-QR.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isRendered && !isOpen) return null;

  const isVisibleOrOpening = animateState === 'opening' || animateState === 'visible';
  const isClosing = animateState === 'closing';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:p-4 overflow-hidden ${
        isRendered ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      {/* 8. BACKDROP OVERLAY: Fade in/out, covers bottom navigation (z-[100]) */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-out transform-gpu ${
          isVisibleOrOpening && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 1, 2 & 7. MODAL SHEET CONTAINER: Max 80vh height, responsive bottom positioning, internal scroll if needed */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[380px] sm:max-w-md bg-gradient-to-b from-slate-900 via-gray-900 to-black border border-purple-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(147,51,234,0.4)] text-center max-h-[80vh] sm:max-h-[85vh] overflow-y-auto transform-gpu will-change-transform transition-all duration-300 ease-out z-10 flex flex-col justify-between ${
          isVisibleOrOpening && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-12 sm:translate-y-4 pointer-events-none'
        }`}
      >
        {/* Mobile Handle Bar */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto sm:hidden mb-1 flex-shrink-0" />

        {/* 9. CLOSE (X) BUTTON: Top right, 44px touch target */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white bg-white/10 hover:bg-purple-600/80 w-11 h-11 rounded-full transition-all duration-200 ease-out active:scale-90 flex items-center justify-center focus:outline-none z-20"
          title="Close QR Modal"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl block">close</span>
        </button>

        {/* HEADER BADGE */}
        <div className="pt-0.5 pb-1.5 flex-shrink-0">
          <div 
            className={`inline-flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/50 px-3 py-1 rounded-full text-purple-200 text-xs font-bold shadow-inner transition-all duration-250 ease-out ${
              stage >= 1 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <span className="text-amber-400">🪔</span>
            <span id="qr-modal-title">Vinayagar Chathurthi Contribution</span>
          </div>
        </div>

        {/* 4 & 5. QR CODE CONTAINER & IMAGE */}
        <div 
          className={`my-1 sm:my-2 flex-shrink-0 transition-all duration-250 ease-out ${
            stage >= 2 && !isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="bg-slate-950 p-2 rounded-2xl shadow-xl border-2 border-purple-500/60 inline-block relative mx-auto group">
            <img 
              src={qrImageUrl} 
              alt={`PhonePe QR Code - ${accountName}`} 
              className="w-[195px] min-[380px]:w-[215px] min-[420px]:w-[235px] sm:w-[290px] aspect-square rounded-xl object-contain mx-auto shadow-md select-none block"
            />
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div 
          className={`my-1 sm:my-2 bg-purple-950/40 py-2 px-3 rounded-xl border border-purple-500/30 flex-shrink-0 transition-all duration-250 ease-out ${
            stage >= 3 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5">
            <span className="text-purple-400">Account:</span> 
            <span className="text-amber-300 font-extrabold">{accountName}</span>
          </div>
          <p className="text-[11px] sm:text-xs text-purple-200/80 leading-tight mt-0.5">
            Scan & Pay using PhonePe or any UPI Payment App
          </p>
        </div>

        {/* 6. ACTION BUTTONS: Stacked vertically on mobile, side-by-side on desktop */}
        <div 
          className={`flex flex-col sm:flex-row gap-2 pt-1 flex-shrink-0 transition-all duration-250 ease-out ${
            stage >= 3 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <button
            onClick={handleDownloadQr}
            className="w-full sm:flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 ease-out shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-amber-400/40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Download QR</span>
          </button>
          <button
            onClick={handleClose}
            className="w-full sm:flex-1 h-12 bg-purple-600/90 hover:bg-purple-500 text-white font-bold px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 ease-out shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-purple-400/40 cursor-pointer"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
