import React from 'react';
import { Flame, Shield, Compass, HeartPulse, Laptop, Moon, Droplets, Move } from 'lucide-react';

export default function MotivationAndRules() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* High Impact Motivational Banner Cards */}
      <section id="motivation-section" className="fitness-card" style={{
        background: 'linear-gradient(135deg, rgba(22, 25, 36, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 1.25rem',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.08)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 1.85rem)',
              fontWeight: 800,
              color: 'var(--text-white)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase'
            }}>
              "YOU DON'T NEED MOTIVATION. <br />
              <span style={{ color: 'var(--gold-primary)' }}>YOU NEED A ROUTINE YOU WON'T QUIT."</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-secondary)', fontFamily: 'var(--font-mono)' }}>
                "5 KM TODAY. BETTER TOMORROW."
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                "NEVER MISS TWICE."
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Daily Lifestyle & Ergonomics Section */}
      <section className="fitness-card">
        <div className="card-header-clean">
          <div className="card-title-group">
            <div className="card-icon-pill">
              <HeartPulse size={20} />
            </div>
            <div>
              <h2 className="card-title">Daily Lifestyle Rules</h2>
              <p className="card-subtitle">Non-exercise activity & daily posture habits</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* WORK */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Laptop size={15} color="var(--gold-primary)" /> WORK SETUP
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginTop: '0.3rem' }}>
              Mostly sitting at laptop
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Keep spine neutral, screen at eye level.
            </p>
          </div>

          {/* MOVEMENT RULE */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Move size={15} color="var(--gold-primary)" /> MOVEMENT RULE
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-primary)', marginTop: '0.3rem' }}>
              Stand every 60–90 min
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Move for 3–5 minutes to keep circulation active.
            </p>
          </div>

          {/* SLEEP */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Moon size={15} color="var(--gold-primary)" /> SLEEP
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginTop: '0.3rem' }}>
              Aim for 7–8 Hours
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              In bed by 11:30 PM, wake ~8:00 AM.
            </p>
          </div>

          {/* WATER */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Droplets size={15} color="var(--gold-primary)" /> HYDRATION
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginTop: '0.3rem' }}>
              3–4 Liters / day
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Keep a 1L water bottle at desk.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
