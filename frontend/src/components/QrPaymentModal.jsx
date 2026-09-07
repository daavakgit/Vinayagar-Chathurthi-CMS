import React, { useState, useEffect, useCallback } from 'react';

/**
 * Premium Animated QR Payment Modal
 * Features smooth micro-interactions, staggered entrance sequence,
 * mobile bottom-sheet positioning, and keyboard/reduced-motion accessibility.
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

  // Handle Close with smooth exit animation (220ms)
  const handleClose = useCallback(() => {
    if (animateState === 'closing' || animateState === 'closed') return;
    setAnimateState('closing');

    const exitTimer = setTimeout(() => {
      setAnimateState('closed');
      setIsRendered(false);
      setStage(0);
      if (onClose) onClose();
    }, 220);

    return () => clearTimeout(exitTimer);
  }, [animateState, onClose]);

  // Listen for Escape key to trigger smooth close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (animateState === 'visible' || animateState === 'opening')) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animateState, handleClose]);

  // Entrance animation trigger and staggered steps
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);

      // Initiate backdrop & container open transition
      const timer0 = setTimeout(() => {
        setAnimateState('opening');
      }, 20);

      // Stage 1: Header badge entrance (~70ms)
      const timer1 = setTimeout(() => {
        setStage(1);
      }, 70);

      // Stage 2: QR code entrance (~160ms)
      const timer2 = setTimeout(() => {
        setStage(2);
      }, 160);

      // Stage 3: Payment details & action buttons entrance (~270ms)
      const timer3 = setTimeout(() => {
        setStage(3);
        setAnimateState('visible');
      }, 270);

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      {/* 1 & 8. BACKDROP OVERLAY: Fade 0 -> 60% opacity on enter, 60% -> 0 on exit */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 ease-out transform-gpu motion-reduce:transition-none ${
          isVisibleOrOpening && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 1 & 2. MODAL CONTAINER: Desktop scale/fade (95% -> 100%), Mobile bottom sheet slide-up */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-full sm:max-w-md bg-gradient-to-b from-gray-900 via-slate-900 to-black border-t-2 sm:border-2 border-purple-500/70 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(147,51,234,0.45)] text-center space-y-4 max-h-[90vh] overflow-y-auto transform-gpu will-change-transform transition-all duration-300 ease-out motion-reduce:transition-none ${
          isVisibleOrOpening && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8 sm:translate-y-4 pointer-events-none'
        }`}
      >
        {/* Mobile Bottom-Sheet Handle Bar */}
        <div className="w-12 h-1 bg-white/25 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* 6. CLOSE (X) BUTTON: Hover rotate + active scale */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white bg-white/10 hover:bg-purple-600/80 p-2 rounded-full transition-all duration-200 ease-out active:scale-90 hover:rotate-90 focus:outline-none z-10 motion-reduce:transition-none"
          title="Close QR Modal"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-lg block">close</span>
        </button>

        {/* 4. HEADER BADGE: Delayed subtle fade/slide down (~70ms) */}
        <div 
          className={`inline-flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/50 px-3.5 py-1 rounded-full text-purple-200 text-xs font-bold shadow-inner transition-all duration-250 ease-out motion-reduce:transition-none ${
            stage >= 1 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <span className="text-amber-400">🪔</span>
          <span id="qr-modal-title">Vinayagar Chathurthi Contribution</span>
        </div>

        {/* 3. QR CODE CONTAINER: Subtle fade + scale (95% -> 100%, 250ms), static thereafter */}
        <div 
          className={`bg-slate-950 p-2 sm:p-2.5 rounded-2xl shadow-2xl border-2 border-purple-500/60 inline-block relative mx-auto max-w-[250px] sm:max-w-[270px] w-full group transition-all duration-250 ease-out motion-reduce:transition-none ${
            stage >= 2 && !isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <img 
            src={qrImageUrl} 
            alt={`PhonePe QR Code - ${accountName}`} 
            className="w-full h-auto max-h-[360px] rounded-xl object-contain mx-auto shadow-md select-none"
          />
          {/* Floating download button inside QR frame */}
          <button
            onClick={handleDownloadQr}
            className="absolute bottom-3 right-3 bg-purple-950/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 p-2 rounded-xl border border-amber-400/40 shadow-lg transition-all duration-200 ease-out active:scale-95 hover:shadow-amber-500/30 flex items-center justify-center gap-1 text-xs font-bold motion-reduce:transition-none"
            title="Download QR Image"
          >
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>

        {/* 5. PAYMENT DETAILS: Subtle fade & slide up (~270ms delay) */}
        <div 
          className={`space-y-1 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 transition-all duration-250 ease-out motion-reduce:transition-none ${
            stage >= 3 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="font-bold text-sm sm:text-base text-white flex items-center justify-center gap-1.5">
            <span className="text-purple-400">Account:</span> 
            <span className="text-amber-300 font-extrabold">{accountName}</span>
          </div>
          <p className="text-xs text-purple-200/80 leading-relaxed">
            Scan & Pay using PhonePe or any UPI Payment App
          </p>
        </div>

        {/* 6. ACTION BUTTONS: Hover elevation & active tap scale */}
        <div 
          className={`flex gap-2.5 pt-1 transition-all duration-250 ease-out motion-reduce:transition-none ${
            stage >= 3 && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <button
            onClick={handleDownloadQr}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 ease-out shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center gap-2 border border-amber-400/40 motion-reduce:transition-none"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download QR
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-purple-600/90 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 ease-out shadow-lg hover:shadow-purple-500/40 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 border border-purple-400/40 motion-reduce:transition-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
