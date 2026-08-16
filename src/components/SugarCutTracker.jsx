import React, { useState } from 'react';
import { Ban, CheckCircle2, Info, Sparkles, Apple } from 'lucide-react';

export default function SugarCutTracker() {
  const [items, setItems] = useState([
    { id: 1, text: 'No sugary drinks (soda, sweetened juices, energy drinks)', checked: true },
    { id: 2, text: 'No added sugar in tea, coffee, or snacks', checked: true },
    { id: 3, text: 'No regular bakery foods (puffs, pastries, sweet buns)', checked: true },
    { id: 4, text: 'No sugary desserts or candy', checked: true },
  ]);

  const toggleItem = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <section id="sugar-cut-tracker" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Ban size={20} />
          </div>
          <div>
            <h2 className="card-title">ADDED SUGAR: CUT</h2>
            <p className="card-subtitle">Eliminate empty calories to reduce belly fat & love handles</p>
          </div>
        </div>
        <span style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '0.75rem',
          fontWeight: 800,
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          ZERO ADDED SUGAR
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: item.checked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: item.checked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className={`custom-checkbox ${item.checked ? 'checked' : ''}`} style={{ background: item.checked ? 'var(--accent-green)' : 'transparent', border: item.checked ? '1px solid var(--accent-green)' : '' }}>
                <CheckCircle2 size={16} strokeWidth={3} color={item.checked ? '#fff' : 'transparent'} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: item.checked ? 'var(--text-white)' : 'var(--text-muted)' }}>
                {item.text}
              </span>
            </div>
            {item.checked && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                ELIMINATED
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Important Fruit Clarification Note */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <Apple size={20} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Fruit Clarification
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
            <strong>Fruit is fully allowed!</strong> Natural sugar in whole fruit comes packed with essential fiber, vitamins, and minerals. You do NOT need to eliminate fruit.
          </p>
        </div>
      </div>
    </section>
  );
}
