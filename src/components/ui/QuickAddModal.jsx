import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Utensils, TrendingDown, Footprints, Droplets, Dumbbell, Sparkles, Check } from 'lucide-react';

/**
 * Universal 4-in-1 Quick Add Modal
 * Supports tabs: 'food' | 'weight' | 'walk' | 'water' | 'workout'
 */
export default function QuickAddModal({
  isOpen,
  onClose,
  initialTab = 'food',
  onLogFood,
  onLogWeight,
  onLogWalk,
  onLogWater,
  onLogWorkout,
  currentWeight = 110.80,
  waterTargetMl = 3500,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Food state
  const [foodText, setFoodText] = useState('');
  const [foodCategory, setFoodCategory] = useState('lunch');

  // Weight state
  const [weightInput, setWeightInput] = useState(currentWeight.toFixed(2));
  const [weightDate, setWeightDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Walk state
  const [walkKm, setWalkKm] = useState('5.0');
  const [walkDuration, setWalkDuration] = useState('55');
  const [walkHr, setWalkHr] = useState('130');

  // Water state
  const [waterAmount, setWaterAmount] = useState(500);

  // Switch tabs when initialTab prop changes
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const handleFoodSubmit = (e) => {
    e.preventDefault();
    if (!foodText.trim()) return;
    if (onLogFood) {
      onLogFood(foodText.trim(), foodCategory);
    }
    setFoodText('');
    onClose();
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (w > 0 && onLogWeight) {
      onLogWeight({
        id: `wt-${Date.now()}`,
        date: weightDate,
        weight: parseFloat(w.toFixed(2)),
        notes: 'Fasted morning weigh-in'
      });
      onClose();
    }
  };

  const handleWalkSubmit = (e) => {
    e.preventDefault();
    const km = parseFloat(walkKm);
    if (km > 0 && onLogWalk) {
      onLogWalk({
        id: `walk-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        distance: km,
        duration: parseInt(walkDuration) || 50,
        avgPace: '11:00',
        avgHeartRate: parseInt(walkHr) || 130,
        timeOfDay: 'Evening Walk'
      });
      onClose();
    }
  };

  const handleWaterSubmit = (amount) => {
    if (onLogWater) {
      onLogWater(amount);
      onClose();
    }
  };

  const tabs = [
    { id: 'food', label: 'Food', icon: Utensils, key: 'F' },
    { id: 'weight', label: 'Weight', icon: TrendingDown, key: 'W' },
    { id: 'walk', label: 'Walk', icon: Footprints, key: 'A' },
    { id: 'water', label: 'Water', icon: Droplets, key: 'H' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Log"
      subtitle="Log your daily transformation activity"
      maxWidth="480px"
    >
      {/* Tabs Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.35rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.45rem 0.2rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: isActive ? 'var(--surface-tertiary)' : 'transparent',
                color: isActive ? 'var(--brand-primary-soft)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.74rem',
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Food Log */}
      {activeTab === 'food' && (
        <form onSubmit={handleFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Meal Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
              {['breakfast', 'lunch', 'snack', 'dinner'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFoodCategory(cat)}
                  style={{
                    padding: '0.4rem 0.2rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xs)',
                    border: foodCategory === cat ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    background: foodCategory === cat ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-secondary)',
                    color: foodCategory === cat ? 'var(--brand-primary-soft)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              What did you eat? (Exact grams supported)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 190g cooked white rice + 60g fish fry"
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-white)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
              ⚡ Exact scale weights are calculated with 100g deterministic accuracy.
            </span>
          </div>

          <Button type="submit" variant="primary" fullWidth icon={Sparkles}>
            Calculate & Log Food
          </Button>
        </form>
      )}

      {/* Tab 2: Weight Log */}
      {activeTab === 'weight' && (
        <form onSubmit={handleWeightSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Fasted Morning Weight (kg)
            </label>
            <input
              type="number"
              step="0.05"
              className="form-input"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--brand-primary)',
                fontSize: '1.25rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Date
            </label>
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-white)',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth icon={TrendingDown}>
            Save Weight Entry
          </Button>
        </form>
      )}

      {/* Tab 3: Walk Log */}
      {activeTab === 'walk' && (
        <form onSubmit={handleWalkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={walkKm}
                onChange={(e) => setWalkKm(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#34d399',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Duration (min)
              </label>
              <input
                type="number"
                value={walkDuration}
                onChange={(e) => setWalkDuration(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-white)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth icon={Footprints}>
            Log Walking Session
          </Button>
        </form>
      )}

      {/* Tab 4: Water Quick Add */}
      {activeTab === 'water' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Tap an amount to immediately log hydration:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {[
              { ml: 250, label: 'Glass (+250 ml)' },
              { ml: 500, label: 'Bottle (+500 ml)' },
              { ml: 750, label: 'Sipper (+750 ml)' },
              { ml: 1000, label: 'Flask (+1000 ml)' },
            ].map((item) => (
              <button
                key={item.ml}
                type="button"
                onClick={() => handleWaterSubmit(item.ml)}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 0.5rem',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Droplets size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
