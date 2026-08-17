import React, { useState, useRef, useEffect } from 'react';
import { Camera, Ruler, Weight, Sparkles, Plus, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Eye, Trash2, List } from 'lucide-react';

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

export default function BodyTransformationTracker({ measurements = [], onAddMeasurement, onDeleteMeasurement }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [showLogModal, setShowLogModal] = useState(false);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' or 'sideBySide'
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);

  // Stored / Uploaded photos state
  const [beforePhoto, setBeforePhoto] = useState(() => localStorage.getItem('transformation_before_photo') || null);
  const [afterPhoto, setAfterPhoto] = useState(() => localStorage.getItem('transformation_after_photo') || null);

  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState('110.25');
  const [newWaist, setNewWaist] = useState('106.5');
  const [newChest, setNewChest] = useState('113.0');
  const [notes, setNotes] = useState('');

  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));

  const latest = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1] : { weight: 110.25, waist: 106.5, chest: 113.0 };
  const initial = sortedMeasurements.length > 0 ? sortedMeasurements[0] : { weight: 110.25, waist: 108.0, chest: 114.0 };

  const waistChange = (Number(latest.waist) - Number(initial.waist)).toFixed(1);
  const chestChange = (Number(latest.chest) - Number(initial.chest)).toFixed(1);

  const [containerWidth, setContainerWidth] = useState(600);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogModal) {
        setShowLogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogModal]);

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

  // Handle pointer drag
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

  const compressImage = (file, maxWidth = 800, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 800, 0.75);
        if (type === 'before') {
          setBeforePhoto(compressedBase64);
          localStorage.setItem('transformation_before_photo', compressedBase64);
        } else {
          setAfterPhoto(compressedBase64);
          localStorage.setItem('transformation_after_photo', compressedBase64);
        }
      } catch (err) {
        console.error('Image compression error', err);
      }
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
    const w = parseFloat(newWeight);
    const wst = parseFloat(newWaist);
    const chst = parseFloat(newChest);
    if (w > 0 && wst > 0) {
      onAddMeasurement({
        id: `bm-${Date.now()}`,
        date: inputDate,
        weight: w,
        waist: wst,
        chest: chst || 0,
        notes: notes.trim() || 'Monthly check-in'
      });
      setShowLogModal(false);
      setNotes('');
    }
  };

  const handleDelete = (idOrIdx, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this measurement entry?')) {
      if (onDeleteMeasurement) {
        onDeleteMeasurement(idOrIdx);
      }
    }
  };

  return (
    <section id="body-transformation" className="fitness-card">
      <div className="card-header-clean" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Camera size={20} />
          </div>
          <div>
            <h2 className="card-title">Body Transformation & Measurements</h2>
            <p className="card-subtitle">Visual progress & tape measurement tracking</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setInputDate(new Date().toISOString().split('T')[0]);
            setShowLogModal(true);
          }} 
          className="btn-gold"
        >
          <Plus size={16} /> Log Measurement
        </button>
      </div>

      {/* Measurement Overview Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waist Circumference</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {latest.waist} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: Number(waistChange) <= 0 ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 700 }}>
            {Number(waistChange) <= 0 ? `${waistChange} cm from start` : `+${waistChange} cm`}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chest Circumference</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {latest.chest} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {chestChange} cm from start
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest Weigh-in</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {Number(latest.weight).toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginTop: '0.2rem', fontWeight: 700 }}>
            Active on plan
          </div>
        </div>
      </div>

      {/* Visual Comparison Section */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Eye size={16} color="var(--gold-primary)" /> Visual Physique Comparison
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setViewMode('slider')}
              className={viewMode === 'slider' ? 'btn-gold' : 'btn-secondary'}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
            >
              Interactive Slider
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              className={viewMode === 'sideBySide' ? 'btn-gold' : 'btn-secondary'}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Upload Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <label className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer' }}>
            <Camera size={12} /> Upload Day 1 Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, 'before')} />
          </label>
          <label className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer' }}>
            <Camera size={12} /> Upload Latest Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, 'after')} />
          </label>
          {(beforePhoto || afterPhoto) && (
            <button onClick={handleClearPhotos} className="btn-danger-subtle">
              <RefreshCw size={11} /> Reset to Demo
            </button>
          )}
        </div>

        {/* Comparison Box */}
        {viewMode === 'slider' ? (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              userSelect: 'none',
              touchAction: 'pan-y',
              cursor: 'ew-resize',
              border: '1px solid var(--border-subtle)',
              background: '#07090e'
            }}
          >
            {/* After/Goal image (Bottom Layer) */}
            <img
              src={afterSrc}
              alt="Goal Physique"
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

            {/* Before image (Top Layer with clip-path) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '3px solid var(--gold-primary)',
                boxShadow: '4px 0 20px rgba(0,0,0,0.8)'
              }}
            >
              <img
                src={beforeSrc}
                alt="Baseline Physique"
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
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 15, background: 'rgba(0,0,0,0.85)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-primary)', border: '1px solid rgba(255,215,0,0.3)' }}>
              DAY 1 (110.25 KG)
            </div>

            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 15, background: 'rgba(16, 185, 129, 0.9)', color: '#000', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800 }}>
              GOAL / LATEST
            </div>

            {/* Floating Drag Handle Button */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--gold-gradient)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              boxShadow: '0 0 20px rgba(255,215,0,0.8)',
              pointerEvents: 'none',
              zIndex: 25
            }}>
              ↔
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            <div style={{
              height: '280px',
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
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.85)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 800 }}>
                DAY 1 (110.25 KG)
              </div>
            </div>

            <div style={{
              height: '280px',
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
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(16, 185, 129, 0.9)', color: '#000', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800 }}>
                GOAL / LATEST
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MEASUREMENT HISTORY TABLE */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <List size={16} color="var(--gold-primary)" /> Measurement History ({sortedMeasurements.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bi-weekly checks</span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="clean-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Waist</th>
                <th>Chest</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...sortedMeasurements].reverse().map((item, idx) => (
                <tr key={item.id || `bm-${idx}`}>
                  <td style={{ fontWeight: 700, color: 'var(--text-white)' }}>{item.date}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-primary)', fontWeight: 700 }}>
                    {Number(item.weight).toFixed(2)} kg
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.waist} cm</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.chest ? `${item.chest} cm` : '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.notes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleDelete(item.id || (sortedMeasurements.length - 1 - idx), e)}
                      className="btn-danger-subtle"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to log measurements */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Ruler size={20} color="var(--gold-primary)" /> Log Body Measurements
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Date</label>
                <input type="date" className="form-input" value={inputDate} onChange={(e) => setInputDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Weight (kg)</label>
                <input type="number" step="0.05" className="form-input" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Waist (cm)</label>
                  <input type="number" step="0.5" className="form-input" value={newWaist} onChange={(e) => setNewWaist(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Chest (cm)</label>
                  <input type="number" step="0.5" className="form-input" value={newChest} onChange={(e) => setNewChest(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Notes</label>
                <input type="text" className="form-input" placeholder="e.g. Morning fasted tape check" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
