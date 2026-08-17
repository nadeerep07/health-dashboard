import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Flame, 
  Beef, 
  Droplets, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  ChevronRight, 
  Coffee, 
  Sun, 
  Moon, 
  Info,
  Zap,
  Check
} from 'lucide-react';
import { estimateNutritionWithAI } from '../utils/nutritionAi';

export default function NutritionDashboard({ 
  foodLogs = { breakfast: [], lunch: [], snack: [], dinner: [] }, 
  onAddFoodItem, 
  onDeleteFoodItem, 
  onResetFoodLogs 
}) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [targetCategory, setTargetCategory] = useState('breakfast');
  
  // AI Modal input state
  const [foodQuery, setFoodQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Manual adjustment fields
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Escape key listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAiModal) {
        setShowAiModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAiModal]);

  // Aggregate all logged foods across 4 meals
  const allItems = [
    ...(foodLogs.breakfast || []),
    ...(foodLogs.lunch || []),
    ...(foodLogs.snack || []),
    ...(foodLogs.dinner || [])
  ];

  const totalCalories = allItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = allItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const totalCarbs = allItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const totalFat = allItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

  const CALORIE_BUDGET = 2100;
  const PROTEIN_GOAL = 130;

  const remainingCalories = CALORIE_BUDGET - totalCalories;
  const caloriePercent = Math.min(Math.round((totalCalories / CALORIE_BUDGET) * 100), 150);
  const proteinPercent = Math.min(Math.round((totalProtein / PROTEIN_GOAL) * 100), 150);

  const openLogModal = (category = 'breakfast', initialText = '') => {
    setTargetCategory(category);
    setFoodQuery(initialText);
    setAiResult(null);
    setCustomCal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setShowAiModal(true);

    if (initialText) {
      handleAnalyzeQuery(initialText);
    }
  };

  const handleAnalyzeQuery = (queryText) => {
    const q = queryText || foodQuery;
    if (!q.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = estimateNutritionWithAI(q);
      setAiResult(result);
      setCustomCal(String(result.calories));
      setCustomProtein(String(result.protein));
      setCustomCarbs(String(result.carbs));
      setCustomFat(String(result.fat));
      setIsAnalyzing(false);
    }, 200);
  };

  const handleSaveFood = (e) => {
    e.preventDefault();
    if (!foodQuery.trim()) return;

    const cal = parseInt(customCal) || (aiResult?.calories || 150);
    const p = parseFloat(customProtein) || (aiResult?.protein || 5);
    const c = parseFloat(customCarbs) || (aiResult?.carbs || 20);
    const f = parseFloat(customFat) || (aiResult?.fat || 5);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newItem = {
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: foodQuery.trim(),
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      time: timeStr
    };

    if (onAddFoodItem) {
      onAddFoodItem(targetCategory, newItem);
    }

    setShowAiModal(false);
    setFoodQuery('');
    setAiResult(null);
  };

  const handleDelete = (category, itemId) => {
    if (onDeleteFoodItem) {
      onDeleteFoodItem(category, itemId);
    }
  };

  const handleQuickAdd = (category, name, cal, p, c, f) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem = {
      id: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      time: timeStr
    };
    if (onAddFoodItem) {
      onAddFoodItem(category, newItem);
    }
  };

  const mealCategories = [
    { key: 'breakfast', label: 'Breakfast', icon: Sun, color: '#f59e0b', desc: '08:00 AM – 09:30 AM' },
    { key: 'lunch', label: 'Lunch', icon: Utensils, color: '#10b981', desc: '01:00 PM – 02:30 PM' },
    { key: 'snack', label: 'Evening Snack', icon: Coffee, color: '#38bdf8', desc: '04:30 PM – 05:30 PM' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: '#a78bfa', desc: '08:00 PM – 09:00 PM' },
  ];

  return (
    <section id="nutrition-dashboard" className="fitness-card">
      {/* Header */}
      <div className="card-header-clean" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Utensils size={20} />
          </div>
          <div>
            <h2 className="card-title">AI Food & Calorie Tracker</h2>
            <p className="card-subtitle">Track custom meals, calculate kcal using AI, & hit your protein goal</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {allItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset today's food entries?")) {
                  if (onResetFoodLogs) onResetFoodLogs();
                }
              }}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
              title="Reset day"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button 
            type="button"
            onClick={() => openLogModal('lunch')} 
            className="btn-gold"
          >
            <Sparkles size={15} /> AI Log Food
          </button>
        </div>
      </div>

      {/* Real-time Macro & Calorie Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(22, 25, 36, 0.95) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Top Summary Bars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Calorie Budget Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Flame size={14} /> Calories Budget
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalCalories} / {CALORIE_BUDGET} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal</span>
              </span>
            </div>
            <div className="progress-track" style={{ height: '14px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>
              <div 
                className="progress-fill-gold" 
                style={{ 
                  width: `${Math.min(caloriePercent, 100)}%`,
                  background: totalCalories > CALORIE_BUDGET ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--gold-gradient)'
                }} 
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: remainingCalories >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '0.3rem', fontWeight: 600 }}>
              {remainingCalories >= 0 ? `${remainingCalories} kcal remaining today` : `+${Math.abs(remainingCalories)} kcal over budget`}
            </div>
          </div>

          {/* Protein Goal Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Beef size={14} /> Daily Protein Goal
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalProtein.toFixed(1)} / {PROTEIN_GOAL} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>g</span>
              </span>
            </div>
            <div className="progress-track" style={{ height: '14px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>
              <div 
                style={{ 
                  width: `${Math.min(proteinPercent, 100)}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
                  transition: 'width 0.6s ease'
                }} 
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: totalProtein >= PROTEIN_GOAL ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>
              {totalProtein >= PROTEIN_GOAL ? '✓ Protein Target Achieved!' : `${(PROTEIN_GOAL - totalProtein).toFixed(1)}g needed for muscle retention`}
            </div>
          </div>
        </div>

        {/* Macro breakdown pills */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '0.75rem'
        }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Protein: </span>
            <strong style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{totalProtein.toFixed(1)}g</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Carbs: </span>
            <strong style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>{totalCarbs.toFixed(1)}g</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Fats: </span>
            <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>{totalFat.toFixed(1)}g</strong>
          </div>
        </div>
      </div>

      {/* 1-Tap Quick Staples for Fast Logging */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Zap size={14} color="var(--gold-primary)" /> 1-Tap Kerala Staples (Fast Add)
        </div>
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
          <button 
            type="button"
            onClick={() => handleQuickAdd('breakfast', '2 Dosa + 2 Boiled Eggs', 388, 18.2, 44.8, 15.0)}
            className="category-pill"
          >
            + 2 Dosa & 2 Eggs (388 kcal • 18g P)
          </button>
          <button 
            type="button"
            onClick={() => handleQuickAdd('breakfast', '1 Puttu + Kadala Curry', 325, 10.7, 57.0, 6.3)}
            className="category-pill"
          >
            + Puttu & Kadala (325 kcal • 11g P)
          </button>
          <button 
            type="button"
            onClick={() => handleQuickAdd('lunch', '180g Matta Rice + 140g Fish Curry', 425, 32.2, 52.0, 8.2)}
            className="category-pill"
          >
            + Rice & Fish Curry (425 kcal • 32g P)
          </button>
          <button 
            type="button"
            onClick={() => handleQuickAdd('dinner', '2 Chapati + 180g Chicken Curry', 487, 48.4, 40.0, 15.0)}
            className="category-pill"
          >
            + Chapati & Chicken (487 kcal • 48g P)
          </button>
          <button 
            type="button"
            onClick={() => handleQuickAdd('lunch', 'Chicken Mandi Portion (250g)', 480, 32.0, 55.0, 15.0)}
            className="category-pill"
          >
            + Chicken Mandi (480 kcal • 32g P)
          </button>
          <button 
            type="button"
            onClick={() => handleQuickAdd('snack', 'Pomegranate & Grapes (200g)', 152, 2.4, 37.0, 1.4)}
            className="category-pill"
          >
            + Fresh Fruits (152 kcal)
          </button>
        </div>
      </div>

      {/* Daily Meals Breakdown (Live Logged Categories) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)' }}>
          Today's Meals Log
        </h3>

        {mealCategories.map(cat => {
          const Icon = cat.icon;
          const items = foodLogs[cat.key] || [];
          const mealCalories = items.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
          const mealProtein = items.reduce((sum, i) => sum + (Number(i.protein) || 0), 0);

          return (
            <div 
              key={cat.key} 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem' 
              }}
            >
              {/* Category Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', color: cat.color, padding: '0.35rem', borderRadius: '8px', display: 'flex' }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--text-white)', fontSize: '0.92rem' }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      {cat.desc}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {items.length > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {mealCalories} kcal • {mealProtein.toFixed(1)}g P
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => openLogModal(cat.key)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', borderRadius: 'var(--radius-pill)' }}
                  >
                    <Plus size={12} /> Add Food
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                  No items logged yet for {cat.label.toLowerCase()}. Click "+ Add Food" to calculate with AI.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {items.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', marginTop: '0.1rem' }}>
                          <span style={{ color: 'var(--gold-primary)' }}>{item.calories} kcal</span>
                          <span style={{ color: '#60a5fa' }}>{item.protein}g protein</span>
                          {item.carbs ? <span>{item.carbs}g carbs</span> : null}
                          {item.time ? <span style={{ color: 'var(--text-dim)' }}>• {item.time}</span> : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(cat.key, item.id)}
                        className="btn-danger-subtle"
                        style={{ padding: '0.2rem 0.4rem' }}
                        title="Delete item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Social Dining Strategy Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 25, 36, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="var(--gold-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Real Life Meals & Social Dining
          </h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
          Occasional foods like <strong>Chicken Biryani</strong> and <strong>Chicken Mandi</strong> can fit comfortably into your plan:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.85rem' }}>
              Chicken Mandi Strategy
            </div>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', paddingLeft: '1rem', lineHeight: 1.4 }}>
              <li>Eat full chicken portion for protein</li>
              <li>Limit rice portion to ~200g</li>
              <li>Skip calorie-heavy mayonnaise</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.85rem' }}>
              Chicken Biryani Strategy
            </div>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', paddingLeft: '1rem', lineHeight: 1.4 }}>
              <li>Portion ~250–300g biryani rice</li>
              <li>Include 100–150g chicken</li>
              <li>Pair with onion raita</li>
            </ul>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 215, 0, 0.08)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '0.85rem',
          color: 'var(--gold-primary)'
        }}>
          "One meal doesn't ruin your progress. Consistency over time is what builds results."
        </div>
      </div>

      {/* AI Log Food Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(255, 215, 0, 0.15)', color: 'var(--gold-primary)', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)' }}>
                    AI Food & Calorie Estimator
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Type whatever you ate and AI will calculate the exact calories & macros
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setShowAiModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category Selector */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Select Meal Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {mealCategories.map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setTargetCategory(cat.key)}
                      style={{
                        padding: '0.4rem 0.2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        border: targetCategory === cat.key ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                        background: targetCategory === cat.key ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.04)',
                        color: targetCategory === cat.key ? '#000' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural language query input */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
                  What did you eat? (with quantity)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. 2 Dosa and 2 boiled eggs, or 200g Mandi"
                    className="form-input"
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleAnalyzeQuery(foodQuery)}
                    className="btn-gold"
                    style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    disabled={!foodQuery.trim()}
                  >
                    <Sparkles size={14} /> Calculate
                  </button>
                </div>
              </div>

              {/* AI Calculation Result Card */}
              {isAnalyzing && (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>
                  Analyzing ingredients & macros with AI...
                </div>
              )}

              {aiResult && !isAnalyzing && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.06)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                      AI Nutrition Estimate
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fine-tune below if needed</span>
                  </div>

                  {/* Estimated Macros Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calories</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)' }}
                        value={customCal} 
                        onChange={(e) => setCustomCal(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Protein (g)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-input" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa' }}
                        value={customProtein} 
                        onChange={(e) => setCustomProtein(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbs (g)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-input" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        value={customCarbs} 
                        onChange={(e) => setCustomCarbs(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Fats (g)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-input" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        value={customFat} 
                        onChange={(e) => setCustomFat(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* AI Diet Tip */}
                  {aiResult.healthTip && (
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.75rem', borderRadius: '6px', lineHeight: 1.3 }}>
                      {aiResult.healthTip}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowAiModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save to {mealCategories.find(c => c.key === targetCategory)?.label}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
