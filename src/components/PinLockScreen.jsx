import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, ArrowRight, Shield } from 'lucide-react';

export default function PinLockScreen({ onUnlock, currentPin = '68356' }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const targetPin = String(currentPin || '68356');
  const PIN_LENGTH = targetPin.length;

  const triggerError = useCallback((msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPinInput('');
    }, 600);
  }, []);

  const handleKeyPress = useCallback((num) => {
    setPinInput(prev => {
      if (prev.length >= PIN_LENGTH) return prev;
      const next = prev + num;
      setErrorMsg('');
      if (next.length === PIN_LENGTH) {
        if (next === targetPin) {
          setTimeout(() => onUnlock(rememberDevice), 100);
        } else {
          setTimeout(() => triggerError('Incorrect Passcode. Try again.'), 50);
        }
      }
      return next;
    });
  }, [PIN_LENGTH, targetPin, onUnlock, rememberDevice, triggerError]);

  const handleDelete = useCallback(() => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  }, []);

  // Keyboard listener for desktop typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter' && pinInput === targetPin) {
        onUnlock(rememberDevice);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, pinInput, targetPin, onUnlock, rememberDevice]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      background: 'radial-gradient(circle at 50% 30%, #151824 0%, #08090c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      userSelect: 'none'
    }}>
      <div style={{
        maxWidth: '340px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: isShaking ? 'shake 0.4s ease' : 'none'
      }}>
        
        {/* Lock Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold-primary)',
          marginBottom: '1rem',
          boxShadow: '0 0 25px rgba(255, 215, 0, 0.15)'
        }}>
          <Lock size={26} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-white)',
          letterSpacing: '0.03em',
          marginBottom: '0.2rem'
        }}>
          TRANSFORMATION VAULT
        </h1>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem'
        }}>
          Enter {PIN_LENGTH}-digit passcode to unlock
        </p>

        {/* PIN Indicators (Dots) */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '1.25rem',
          justifyContent: 'center'
        }}>
          {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
            const isFilled = idx < pinInput.length;
            return (
              <div
                key={idx}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid var(--gold-primary)',
                  background: isFilled ? 'var(--gold-gradient)' : 'transparent',
                  boxShadow: isFilled ? '0 0 10px rgba(255, 215, 0, 0.6)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div style={{
          minHeight: '22px',
          marginBottom: '0.75rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--accent-red)'
        }}>
          {errorMsg}
        </div>

        {/* Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          width: '100%',
          maxWidth: '280px',
          marginBottom: '1.25rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(String(num))}
              style={{
                height: '62px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-white)',
                fontSize: '1.45rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                touchAction: 'manipulation'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              {num}
            </button>
          ))}

          {/* Quick Unlock for Demo/Master */}
          <button
            onClick={() => onUnlock(rememberDevice)}
            style={{
              height: '62px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--gold-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}
            title="Quick unlock with Master PIN"
          >
            <Shield size={16} />
            <span style={{ fontSize: '0.65rem' }}>Master</span>
          </button>

          {/* Zero button */}
          <button
            onClick={() => handleKeyPress('0')}
            style={{
              height: '62px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-white)',
              fontSize: '1.45rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              touchAction: 'manipulation'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            0
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            style={{
              height: '62px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete digit"
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Remember this device checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            style={{ accentColor: 'var(--gold-primary)' }}
          />
          <span>Remember for 30 days</span>
        </label>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
