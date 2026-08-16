import React, { useState } from 'react';
import { TrendingDown, Plus, Target, Award, Calendar, Trash2 } from 'lucide-react';

export default function WeightProgressChart({ weightLogs, onAddWeightLog, onDeleteWeightLog, targetWeight = 100 }) {
  const [showModal, setShowModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);

  // Sort logs chronologically
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : 110.25;
  const startWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : 110.25;
  const lowestWeight = Math.min(...sortedLogs.map(l => l.weight), currentWeight);
  const totalLost = (startWeight - currentWeight).toFixed(2);
  const remainingToTarget = (currentWeight - targetWeight).toFixed(2);
  
  // Weekly average calculation
  const recentLogs = sortedLogs.slice(-7);
  const weeklyAvg = (recentLogs.reduce((acc, curr) => acc + curr.weight, 0) / (recentLogs.length || 1)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    if (w > 0) {
      onAddWeightLog({ date: inputDate, weight: w });
      setInputWeight('');
      setShowModal(false);
    }
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingRatio = 40;

  const weights = sortedLogs.map(l => l.weight);
  const minW = Math.min(...weights, targetWeight - 2);
  const maxW = Math.max(...weights, startWeight + 2);

  const getY = (val) => {
    const range = maxW - minW || 1;
    return chartHeight - paddingRatio - ((val - minW) / range) * (chartHeight - paddingRatio * 2);
  };

  const getX = (index) => {
    if (sortedLogs.length <= 1) return chartWidth / 2;
    return paddingRatio + (index / (sortedLogs.length - 1)) * (chartWidth - paddingRatio * 2);
  };

  // Build SVG Path
  const points = sortedLogs.map((log, idx) => `${getX(idx)},${getY(log.weight)}`).join(' ');
  const targetY = getY(targetWeight);

  return (
    <section id="weight-chart" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <TrendingDown size={20} />
          </div>
          <div>
            <h2 className="card-title">Weight Progress Chart</h2>
            <p className="card-subtitle">Track your official weight trends over time</p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
          <Plus size={14} /> Log Weight
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Weight</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {currentWeight.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lowest Recorded</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {lowestWeight.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Lost</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {totalLost > 0 ? `-${totalLost}` : '0.00'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>To First Target</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {remainingToTarget > 0 ? remainingToTarget : 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weekly Average</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {weeklyAvg} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <span>Weight (kg)</span>
          <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Phase 1 Goal: 100 kg</span>
        </div>

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="30" y1={targetY} x2={chartWidth - 30} y2={targetY} stroke="rgba(255, 215, 0, 0.4)" strokeDasharray="5,5" strokeWidth="1.5" />
          <text x={chartWidth - 25} y={targetY + 4} fill="var(--gold-primary)" fontSize="10" fontWeight="bold">100 kg Target</text>

          {/* Area fill */}
          {sortedLogs.length > 1 && (
            <polygon
              points={`${getX(0)},${chartHeight - 30} ${points} ${getX(sortedLogs.length - 1)},${chartHeight - 30}`}
              fill="url(#goldAreaGrad)"
            />
          )}

          {/* Line Path */}
          {sortedLogs.length > 1 && (
            <polyline
              fill="none"
              stroke="var(--gold-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}

          {/* Data Points */}
          {sortedLogs.map((log, idx) => {
            const cx = getX(idx);
            const cy = getY(log.weight);
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="6" fill="#000" stroke="var(--gold-primary)" strokeWidth="3" />
                <text x={cx} y={cy - 12} fill="var(--text-white)" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="var(--font-mono)">
                  {log.weight} kg
                </text>
                <text x={cx} y={chartHeight - 10} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                  {log.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Log Weight Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '1rem' }}>
              Log Weight Entry
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Weight (KG)</label>
                <input 
                  type="number" 
                  step="0.05"
                  className="form-input"
                  placeholder="e.g. 109.80"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
