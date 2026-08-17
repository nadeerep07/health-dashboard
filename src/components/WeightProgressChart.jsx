import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus, Target, Award, Calendar, Trash2, List, BarChart2, Info } from 'lucide-react';

export default function WeightProgressChart({ weightLogs = [], onAddWeightLog, onDeleteWeightLog, targetWeight = 100 }) {
  const [showModal, setShowModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Sort logs chronologically
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : 110.25;
  const startWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : 110.25;
  const lowestWeight = Math.min(...sortedLogs.map(l => l.weight), currentWeight);
  const totalLost = (startWeight - currentWeight).toFixed(2);
  const remainingToTarget = (currentWeight - targetWeight).toFixed(2);
  
  // Weekly average calculation
  const recentLogs = sortedLogs.slice(-7);
  const weeklyAvg = (recentLogs.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0) / (recentLogs.length || 1)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    if (w > 0) {
      const newEntry = {
        id: `wt-${Date.now()}`,
        date: inputDate,
        weight: parseFloat(w.toFixed(2)),
        notes: notes.trim() || 'Fasted weigh-in'
      };
      onAddWeightLog(newEntry);
      setInputWeight('');
      setNotes('');
      setShowModal(false);
    }
  };

  const handleDelete = (idOrIdx, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this weight entry?')) {
      if (onDeleteWeightLog) {
        onDeleteWeightLog(idOrIdx);
      }
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
      <div className="card-header-clean" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <div className="card-icon-pill">
            <TrendingDown size={20} />
          </div>
          <div>
            <h2 className="card-title">Weight Progress Chart & History</h2>
            <p className="card-subtitle">Official weight tracking towards 100 kg goal</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setInputDate(new Date().toISOString().split('T')[0]);
            setShowModal(true);
          }} 
          className="btn-gold"
        >
          <Plus size={16} /> Log Weight
        </button>
      </div>

      {/* Analytics Summary - Mobile Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Weight</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {currentWeight.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Lowest Recorded</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {lowestWeight.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Lost</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {totalLost > 0 ? `-${totalLost}` : '0.00'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>To 100 kg Goal</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {remainingToTarget > 0 ? remainingToTarget : 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>7-Day Average</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
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
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Weight Trendline (kg)</span>
          <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Phase 1 Goal: 100.00 kg</span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', minWidth: '320px', height: 'auto', display: 'block' }}
          >
            <defs>
              <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffd700" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="30" y1={targetY} x2={chartWidth - 30} y2={targetY} stroke="rgba(255, 215, 0, 0.4)" strokeDasharray="5,5" strokeWidth="1.5" />
            <text x={chartWidth - 25} y={targetY + 4} fill="var(--gold-primary)" fontSize="10" fontWeight="bold">100 kg Goal</text>

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
                <g key={log.id || idx}>
                  <circle cx={cx} cy={cy} r="6" fill="#08090c" stroke="var(--gold-primary)" strokeWidth="3" />
                  <text x={cx} y={cy - 10} fill="var(--text-white)" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="var(--font-mono)">
                    {Number(log.weight).toFixed(2)} kg
                  </text>
                  <text x={cx} y={chartHeight - 10} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                    {log.date ? log.date.slice(5) : `Entry ${idx + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* WEIGHT LOG HISTORY TABLE / CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <List size={16} color="var(--gold-primary)" /> Weight Log History ({sortedLogs.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chronological record</span>
        </div>

        {sortedLogs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No weight entries logged yet. Click <strong>"Log Weight"</strong> above to record your current weight!
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Total Change</th>
                  <th>Weigh-in Delta</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...sortedLogs].reverse().map((log, idx, arr) => {
                  const currWeight = Number(log.weight);
                  const totalDiff = (currWeight - startWeight).toFixed(2);
                  
                  // Delta from previously logged entry (next item in reverse array)
                  const prevLog = arr[idx + 1];
                  const prevDelta = prevLog ? (currWeight - Number(prevLog.weight)).toFixed(2) : '0.00';

                  return (
                    <tr key={log.id || `wt-${idx}`}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-white)' }}>{log.date}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                          {currWeight.toFixed(2)} kg
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 700, 
                          fontFamily: 'var(--font-mono)',
                          color: Number(totalDiff) <= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                        }}>
                          {Number(totalDiff) <= 0 ? totalDiff : `+${totalDiff}`} kg
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          color: Number(prevDelta) < 0 ? 'var(--accent-green)' : (Number(prevDelta) > 0 ? 'var(--accent-red)' : 'var(--text-muted)')
                        }}>
                          {Number(prevDelta) < 0 ? prevDelta : (Number(prevDelta) > 0 ? `+${prevDelta}` : '—')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.notes || 'Fasted morning weigh-in'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleDelete(log.id || (sortedLogs.length - 1 - idx), e)}
                          className="btn-danger-subtle"
                          title="Delete this weigh-in entry"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingDown size={20} color="var(--gold-primary)" /> Log Weight Entry
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Weight (KG)</label>
                <input 
                  type="number" 
                  step="0.05"
                  className="form-input"
                  placeholder="e.g. 109.80"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  autoFocus
                  required 
                />
                {inputWeight && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '0.35rem' }}>
                    {parseFloat(inputWeight) < startWeight 
                      ? `Great job! Total -${(startWeight - parseFloat(inputWeight)).toFixed(2)} kg lost from baseline.`
                      : `Progress to 100 kg: ${(parseFloat(inputWeight) - targetWeight).toFixed(2)} kg remaining.`}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Notes (Optional)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Fasted morning weigh-in"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
