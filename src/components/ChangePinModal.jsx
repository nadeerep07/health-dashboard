import React, { useState, useEffect } from 'react';
import { KeyRound, Check, X, ShieldCheck, AlertCircle, Lock } from 'lucide-react';

export default function ChangePinModal({ isOpen, onClose, currentPin, onChangePin }) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (oldPin !== currentPin) {
      setErrorMsg('Current passcode is incorrect.');
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setErrorMsg('New passcode must be between 4 and 8 digits.');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setErrorMsg('Passcode must contain only numbers.');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('New passcodes do not match.');
      return;
    }

    onChangePin(newPin);
    setSuccessMsg('✓ Passcode changed successfully!');
    setTimeout(() => {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleCancel = () => {
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.15)', color: 'var(--gold-primary)', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Change Passcode
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Update your dashboard access PIN
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleCancel} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Check size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Current Passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter current PIN"
              className="form-input"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              New Passcode (4–8 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter new PIN"
              className="form-input"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Confirm New Passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Confirm new PIN"
              className="form-input"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={handleCancel} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ flex: 1 }}>
              Update PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
