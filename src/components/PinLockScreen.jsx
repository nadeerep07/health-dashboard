import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

export default function PinLockScreen({ onUnlock, currentPin = '68356' }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const targetPin = currentPin || '68356';
  const PIN_LENGTH = targetPin.length; // 5 digits

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPinInput('');
    }, 600);
  };

  const handleKeyPress = (num) => {
    if (pinInput.length < PIN_LENGTH) {
      const next = pinInput + num;
      setPinInput(next);
      setErrorMsg('');
      if (next.length === PIN_LENGTH) {
        if (next === targetPin) {
          setTimeout(() => onUnlock(rememberDevice), 150);
        } else {
          triggerError('Incorrect Passcode. Try again.');
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  // Keyboard listener for desktop typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold-primary)',
          marginBottom: '1.25rem',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
        }}>
          <Lock size={30} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-white)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem'
        }}>
          Enter Passcode
        </h1>

        <p style={{
          fontSize: '0.82rem',
          color: errorMsg ? '#f87171' : 'var(--text-muted)',
          marginBottom: '1.75rem',
          fontWeight: errorMsg ? 700 : 400,
          minHeight: '1.2rem'
        }}>
          {errorMsg || 'Personal Transformation Dashboard'}
        </p>

        {/* 5 Digit PIN Dots */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
            const isFilled = idx < pinInput.length;
            return (
              <div
                key={idx}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isFilled ? 'var(--gold-primary)' : 'transparent',
                  border: isFilled ? '2px solid var(--gold-primary)' : '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: isFilled ? '0 0 12px rgba(255, 215, 0, 0.6)' : 'none',
                  transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}
        </div>

        {/* Numeric Keypad (1 to 9, 0) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          marginBottom: '1.5rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              style={{
                aspectRatio: '1/1',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-white)',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.12s ease',
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.25)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {num}
            </button>
          ))}

          {/* Empty Space for Grid alignment */}
          <div />

          {/* 0 Button */}
          <button
            onClick={() => handleKeyPress('0')}
            style={{
              aspectRatio: '1/1',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-white)',
              fontSize: '1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.12s ease',
              outline: 'none'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.25)';
              e.currentTarget.style.borderColor = 'var(--gold-primary)';
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            onClick={handleDelete}
            style={{
              aspectRatio: '1/1',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
            title="Delete last digit"
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Remember this device toggle */}
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
          <span>Remember on this device for 30 days</span>
        </label>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
