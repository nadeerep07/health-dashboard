import React from 'react';
import { Info, ShieldCheck, Heart } from 'lucide-react';

export default function DisclaimerFooter() {
  return (
    <footer style={{ marginTop: '1rem', marginBottom: '2rem' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <Info size={20} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-white)' }}>
            IMPORTANT MEDICAL & PHYSIOLOGY DISCLAIMER
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
            "Weight loss cannot be targeted specifically to the belly, love handles or chest. Overall fat loss reduces these areas over time. Strength training helps build muscle and improve body shape."
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <p>Personal Body Transformation Dashboard • Designed for Long-term Sustainable Success</p>
        <p style={{ marginTop: '0.25rem' }}>Dec 31, 2026 Phase 1 Benchmark Target</p>
      </div>
    </footer>
  );
}
