import React, { useState, useRef, useEffect } from 'react';
import { Camera, Ruler, Weight, Sparkles, Plus, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';

// Built-in Demo SVG Graphics for Day 1 vs Goal
const DEMO_BEFORE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%231a1505" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="%23090a0f" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="goldLine1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%23e5b539"/>
      <stop offset="100%" stop-color="%23b8860b"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(%23bgGrad1)"/>
  <circle cx="250" cy="90" r="32" fill="%23222736" stroke="url(%23goldLine1)" stroke-width="4"/>
  <!-- Torso (Broader baseline) -->
  <path d="M 190 140 Q 250 135 310 140 Q 330 200 335 270 Q 320 340 300 360 L 200 360 Q 180 340 165 270 Q 170 200 190 140 Z" fill="%231c2130" stroke="url(%23goldLine1)" stroke-width="4"/>
  <!-- Chest Line -->
  <path d="M 210 190 Q 250 205 290 190" fill="none" stroke="%23e5b539" stroke-width="3" opacity="0.6"/>
  <!-- Belly Curve -->
  <path d="M 185 275 Q 250 310 315 275" fill="none" stroke="%23e5b539" stroke-width="4"/>
  <!-- Legs -->
  <path d="M 205 360 L 195 470 M 295 360 L 305 470" stroke="url(%23goldLine1)" stroke-width="12" stroke-linecap="round"/>
  <!-- Arms -->
  <path d="M 185 150 Q 150 230 145 310 M 315 150 Q 350 230 355 310" stroke="url(%23goldLine1)" stroke-width="12" stroke-linecap="round"/>
  
  <text x="250" y="420" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">DAY 1 BASELINE</text>
  <text x="250" y="445" fill="%23e5b539" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">110.25 KG • WAIST 108 CM</text>
</svg>`;

const DEMO_AFTER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23062817" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="%23090a0f" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="greenLine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%2310b981"/>
      <stop offset="100%" stop-color="%23ffd700"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(%23bgGrad2)"/>
  <circle cx="250" cy="90" r="30" fill="%23153026" stroke="url(%23greenLine)" stroke-width="4"/>
  <!-- Torso (Tapered V-Taper) -->
  <path d="M 180 135 Q 250 130 320 135 Q 315 200 290 270 Q 280 340 275 360 L 225 360 Q 220 340 210 270 Q 185 200 180 135 Z" fill="%2313261f" stroke="url(%23greenLine)" stroke-width="4"/>
  <!-- Defined Chest -->
  <path d="M 205 180 Q 250 195 295 180" fill="none" stroke="%2310b981" stroke-width="4"/>
  <!-- Toned Core -->
  <path d="M 225 240 Q 250 250 275 240 M 230 280 Q 250 290 270 280" fill="none" stroke="%2310b981" stroke-width="3" opacity="0.8"/>
  <!-- Athletic Legs -->
  <path d="M 225 360 L 210 470 M 275 360 L 290 470" stroke="url(%23greenLine)" stroke-width="12" stroke-linecap="round"/>
  <!-- Defined Arms -->
  <path d="M 175 145 Q 140 220 135 295 M 325 145 Q 360 220 365 295" stroke="url(%23greenLine)" stroke-width="12" stroke-linecap="round"/>
  
  <text x="250" y="420" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">TARGET PHYSIQUE</text>
  <text x="250" y="445" fill="%2310b981" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">100.00 KG • LEAN & DEFINED</text>
</svg>`;

export default function BodyTransformationTracker({ measurements, onAddMeasurement }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [showLogModal, setShowLogModal] = useState(false);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' or 'sideBySide'
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);

  // Stored / Uploaded photos state
  const [beforePhoto, setBeforePhoto] = useState(() => localStorage.getItem('transformation_before_photo') || null);
  const [afterPhoto, setAfterPhoto] = useState(() => localStorage.getItem('transformation_after_photo') || null);

  const [newWeight, setNewWeight] = useState('110.25');
  const [newWaist, setNewWaist] = useState('106.5');
  const [newChest, setNewChest] = useState('113.0');

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : { weight: 110.25, waist: 106.5, chest: 113.0 };
  const initial = measurements.length > 0 ? measurements[0] : { weight: 110.25, waist: 108.0, chest: 114.0 };

  const waistChange = (latest.waist - initial.waist).toFixed(1);
  const chestChange = (latest.chest - initial.chest).toFixed(1);

  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  const beforeSrc = beforePhoto || DEMO_BEFORE_SVG;
  const afterSrc = afterPhoto || DEMO_AFTER_SVG;

  // Handle direct pointer drag on the comparison container
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setIsDragging(false);
  };

  const updateSliderFromClientX = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        if (type === 'before') {
          setBeforePhoto(base64Data);
          localStorage.setItem('transformation_before_photo', base64Data);
        } else {
          setAfterPhoto(base64Data);
          localStorage.setItem('transformation_after_photo', base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhotos = () => {
    setBeforePhoto(null);
    setAfterPhoto(null);
    localStorage.removeItem('transformation_before_photo');
    localStorage.removeItem('transformation_after_photo');
  };

  const handleSave = (e) => {
    e.preventDefault();
    onAddMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      waist: parseFloat(newWaist),
      chest: parseFloat(newChest),
    });
    setShowLogModal(false);
  };

  return (
    <section id="body-transformation" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Ruler size={20} />
          </div>
          <div>
            <h2 className="card-title">Body Transformation & Photos</h2>
            <p className="card-subtitle">Track chest, waist, and visual physique evolution</p>
          </div>
        </div>

        <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
          <Plus size={14} /> Log Measurements
        </button>
      </div>

      {/* Mindset Quote Box */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.08)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <AlertCircle size={22} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
            "Don't judge progress from the scale alone."
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Muscle preservation, waist reduction, and clothing fit are far more accurate indicators of fat loss than daily water weight fluctuations.
          </p>
        </div>
      </div>

      {/* 3 Key Measurement Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* WEIGHT */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Weight size={15} color="var(--gold-primary)" /> WEIGHT
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
            {latest.weight} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        {/* WAIST */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Ruler size={15} color="var(--gold-primary)" /> WAIST
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
            {latest.waist} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: waistChange < 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 700, marginTop: '0.2rem' }}>
            {waistChange < 0 ? `${waistChange} cm overall` : 'Baseline'}
          </div>
        </div>

        {/* CHEST */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Ruler size={15} color="var(--gold-secondary)" /> CHEST
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
            {latest.chest} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: chestChange < 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 700, marginTop: '0.2rem' }}>
            {chestChange < 0 ? `${chestChange} cm overall` : 'Baseline'}
          </div>
        </div>
      </div>

      {/* Before / After Photo Comparison Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-white)' }}>
            <Camera size={18} color="var(--gold-primary)" /> Monthly Photo Visualizer
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(beforePhoto || afterPhoto) && (
              <button
                onClick={handleClearPhotos}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                title="Reset to demo silhouettes"
              >
                <RefreshCw size={11} /> Reset Demo
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.2rem', borderRadius: 'var(--radius-pill)' }}>
              <button
                onClick={() => setViewMode('slider')}
                style={{
                  background: viewMode === 'slider' ? 'var(--gold-gradient)' : 'transparent',
                  color: viewMode === 'slider' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Split Slider
              </button>
              <button
                onClick={() => setViewMode('sideBySide')}
                style={{
                  background: viewMode === 'sideBySide' ? 'var(--gold-gradient)' : 'transparent',
                  color: viewMode === 'sideBySide' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Side by Side
              </button>
            </div>
          </div>
        </div>

        {/* Upload Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <label style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 215, 0, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.82rem',
            color: 'var(--text-white)',
            minWidth: '180px'
          }}>
            <ImageIcon size={16} color="var(--gold-primary)" />
            <span>{beforePhoto ? 'Change Day 1 Photo' : 'Upload Day 1 (Before)'}</span>
            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} style={{ display: 'none' }} />
          </label>

          <label style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.82rem',
            color: 'var(--text-white)',
            minWidth: '180px'
          }}>
            <ImageIcon size={16} color="var(--accent-green)" />
            <span>{afterPhoto ? 'Change Current Photo' : 'Upload Latest (Current)'}</span>
            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Visualizer Display */}
        {viewMode === 'slider' ? (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              position: 'relative',
              width: '100%',
              height: '360px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 215, 0, 0.25)',
              background: '#07090e',
              cursor: 'ew-resize',
              userSelect: 'none',
              touchAction: 'none'
            }}
          >
            {/* Background Image (After / Target Photo - FULL WIDTH) */}
            <img
              src={afterSrc}
              alt="After / Target Progress"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />

            {/* Foreground Image Wrapper (Before Photo - Clipped by slider width) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2px solid var(--gold-primary)',
                boxShadow: '4px 0 20px rgba(255, 215, 0, 0.6)',
                pointerEvents: 'none'
              }}
            >
              {/* Inner Image anchored to container width so it aligns with background image */}
              <img
                src={beforeSrc}
                alt="Before Progress"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${containerWidth}px`,
                  maxWidth: 'none',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            </div>

            {/* Top Badges */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 15, background: 'rgba(0,0,0,0.8)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-primary)', border: '1px solid rgba(255,215,0,0.3)' }}>
              DAY 1 (110.25 KG)
            </div>

            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 15, background: 'rgba(16, 185, 129, 0.9)', color: '#000', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800 }}>
              GOAL / LATEST
            </div>

            {/* Floating Drag Handle Button */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--gold-gradient)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.9rem',
              boxShadow: '0 0 25px rgba(255,215,0,0.8)',
              pointerEvents: 'none',
              zIndex: 25
            }}>
              ↔
            </div>

            {/* Helper Caption at Bottom */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              padding: '0.2rem 0.8rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.72rem',
              color: '#cbd5e1',
              pointerEvents: 'none',
              zIndex: 15
            }}>
              Drag handle left/right to compare
            </div>
          </div>
        ) : (
          /* Side by Side Mode */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Before Box */}
            <div style={{
              height: '320px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: '#07090e',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src={beforeSrc} alt="Day 1" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.85)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 800, border: '1px solid rgba(255,215,0,0.3)' }}>
                DAY 1 (110.25 KG)
              </div>
            </div>

            {/* After Box */}
            <div style={{
              height: '320px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: '#07090e',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src={afterSrc} alt="Goal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(16, 185, 129, 0.9)', color: '#000', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800 }}>
                GOAL / LATEST
              </div>
            </div>
          </div>
        )}

        {/* Progress Photo Guidelines */}
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="var(--gold-primary)" />
          <span><strong>Tips for accurate tracking:</strong> Take photos once a month in the morning (fasted), wearing the same clothes, under identical lighting and camera distance.</span>
        </div>
      </div>

      {/* Modal to log measurements */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '1rem' }}>
              Log Monthly Body Measurements
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Weight (kg)</label>
                <input type="number" step="0.1" className="form-input" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Waist (cm)</label>
                <input type="number" step="0.5" className="form-input" value={newWaist} onChange={(e) => setNewWaist(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Chest (cm)</label>
                <input type="number" step="0.5" className="form-input" value={newChest} onChange={(e) => setNewChest(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save Measurements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
