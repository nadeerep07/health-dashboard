import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressRing from '../ui/ProgressRing';
import ProgressBar from '../ui/ProgressBar';
import Modal from '../ui/Modal';
import {
  Utensils,
  Plus,
  Sparkles,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Sun,
  Coffee,
  Moon,
  AlertCircle,
  Key,
} from 'lucide-react';
import { estimateNutrition, getStoredGeminiKey, setStoredGeminiKey } from '../../services/nutritionService';

/**
 * Screen 3: Nutrition Screen
 * Clean, fast, and deterministic macro tracking
 */
export default function NutritionScreen({
  foodLogs = {},
  selectedDate,
  onSelectDate,
  onAddFoodItem,
  onDeleteFoodItem,
  onResetFoodLogs,
}) {
  const activeDate = selectedDate || new Date().toISOString().split('T')[0];
  const activeDayMeals = foodLogs[activeDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };

  const [showLogModal, setShowLogModal] = useState(false);
  const [modalCategory, setModalCategory] = useState('lunch');
  const [foodQuery, setFoodQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customName, setCustomName] = useState('');

  // Key Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiKey());

  const mealCategories = [
    { key: 'breakfast', label: 'Breakfast', icon: Sun, color: 'var(--brand-primary-soft)', desc: '08:00 AM – 09:30 AM' },
    { key: 'lunch', label: 'Lunch', icon: Utensils, color: 'var(--brand-primary)', desc: '01:00 PM – 02:30 PM' },
    { key: 'snack', label: 'Evening Snack', icon: Coffee, color: 'var(--brand-secondary)', desc: '04:30 PM – 05:30 PM' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: 'var(--accent-purple)', desc: '08:00 PM – 09:00 PM' },
  ];

  const allItems = [
    ...(activeDayMeals.breakfast || []),
    ...(activeDayMeals.lunch || []),
    ...(activeMealsOrEmpty(activeDayMeals.snack)),
    ...(activeMealsOrEmpty(activeDayMeals.dinner)),
  ];

  function activeMealsOrEmpty(arr) {
    return Array.isArray(arr) ? arr : [];
  }

  const totalCalories = allItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = allItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const totalCarbs = allItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const totalFat = allItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

  const calorieBudget = 2100;
  const proteinTarget = 130;
  const caloriesRemaining = Math.max(calorieBudget - totalCalories, 0);
  const proteinRemaining = Math.max(proteinTarget - totalProtein, 0);
  const caloriePct = Math.min(Math.round((totalCalories / calorieBudget) * 100), 120);
  const proteinPct = Math.min(Math.round((totalProtein / proteinTarget) * 100), 100);

  const handleOpenAddModal = (cat = 'lunch') => {
    setModalCategory(cat);
    setFoodQuery('');
    setAiResult(null);
    setShowLogModal(true);
  };

  const handleAnalyzeFood = async (queryText) => {
    const query = (queryText || foodQuery).trim();
    if (!query) return;

    setIsAnalyzing(true);
    try {
      const parsed = await estimateNutrition(query);
      setAiResult(parsed);
      setCustomName(parsed.name || query);
      setCustomCal(String(parsed.calories || 0));
      setCustomProtein(String(parsed.protein || 0));
      setCustomCarbs(String(parsed.carbs || 0));
      setCustomFat(String(parsed.fat || 0));
    } catch (err) {
      console.error('Nutrition estimation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAddFood = (e) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newItem = {
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customName.trim() || foodQuery.trim(),
      calories: Math.max(0, parseInt(customCal) || 0),
      protein: Math.max(0, parseFloat(customProtein) || 0),
      carbs: Math.max(0, parseFloat(customCarbs) || 0),
      fat: Math.max(0, parseFloat(customFat) || 0),
      weightGrams: aiResult?.weightGrams || null,
      weightType: aiResult?.weightType || 'cooked',
      confidence: aiResult?.confidence || 'verified',
      time: timeStr,
    };

    if (onAddFoodItem) {
      onAddFoodItem(activeDate, modalCategory, newItem);
    }
    setShowLogModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Nutrition & Macros
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Exact kitchen-scale gram calculations with 100g database accuracy
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-white)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
            }}
          />
          <Button variant="primary" size="sm" onClick={() => handleOpenAddModal('lunch')} icon={Sparkles}>
            + Log Meal
          </Button>
        </div>
      </div>

      {/* Primary Macro Overview Card */}
      <Card variant="gradient" padding="1.25rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Calorie Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ProgressRing size={68} strokeWidth={6} progress={caloriePct} color="var(--brand-primary)">
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalCalories}
              </span>
            </ProgressRing>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Calories
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {caloriesRemaining}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>kcal remaining</span>
            </div>
          </div>

          {/* Protein Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ProgressRing size={68} strokeWidth={6} progress={proteinPct} color="#38bdf8">
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalProtein.toFixed(0)}g
              </span>
            </ProgressRing>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Protein
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {proteinRemaining > 0 ? `${proteinRemaining.toFixed(0)}g` : 'Goal Hit!'}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>target: 130g</span>
            </div>
          </div>

          {/* Carbs & Fats Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Carbohydrates</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totalCarbs.toFixed(1)}g</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fats</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totalFat.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Categorized Meal Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mealCategories.map((cat) => {
          const Icon = cat.icon;
          const items = activeDayMeals[cat.key] || [];
          const mealCal = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);
          const mealProt = items.reduce((s, i) => s + (Number(i.protein) || 0), 0);

          return (
            <Card key={cat.key} variant="default" padding="1rem">
              {/* Category Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: cat.color, padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {items.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {mealCal} kcal • {mealProt.toFixed(1)}g P
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenAddModal(cat.key)}
                    icon={Plus}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.35rem 0' }}>
                  No items logged for {cat.label.toLowerCase()}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.55rem 0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)' }}>
                            {item.name}
                          </span>
                          {item.weightType && (
                            <Badge variant={item.weightType} size="sm">
                              {item.weightType}
                            </Badge>
                          )}
                          {item.confidence === 'verified' && (
                            <span style={{ fontSize: '0.62rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.15rem' }} title="Verified Database">
                              <ShieldCheck size={11} /> Verified
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', marginTop: '0.15rem' }}>
                          <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{item.calories} kcal</span>
                          <span style={{ color: '#38bdf8' }}>{item.protein}g protein</span>
                          {item.weightGrams ? <span>({item.weightGrams}g)</span> : null}
                          {item.time ? <span style={{ color: 'var(--text-dim)' }}>• {item.time}</span> : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteFoodItem && onDeleteFoodItem(activeDate, cat.key, item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '0.3rem',
                          display: 'flex',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Log Food Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Add Food Entry"
        subtitle="Natural language & exact gram scale parser"
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmAddFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Meal Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
              {mealCategories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setModalCategory(c.key)}
                  style={{
                    padding: '0.4rem 0.2rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xs)',
                    border: modalCategory === c.key ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    background: modalCategory === c.key ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface-secondary)',
                    color: modalCategory === c.key ? 'var(--brand-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Food & Quantity (e.g. "190g cooked white rice + 60g fish fry")
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type meal description..."
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                autoFocus
                required
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-white)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <Button
                type="button"
                variant="primary"
                onClick={() => handleAnalyzeFood(foodQuery)}
                disabled={!foodQuery.trim() || isAnalyzing}
                icon={Sparkles}
              >
                {isAnalyzing ? '...' : 'Parse'}
              </Button>
            </div>
          </div>

          {/* Parsed Result Preview */}
          {aiResult && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  Detected Nutrition Breakdown
                </span>
                <Badge variant={aiResult.confidence === 'verified' ? 'success' : 'gold'} size="sm">
                  {aiResult.confidence === 'verified' ? 'Verified Database' : 'AI Estimated'}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Calories</label>
                  <input
                    type="number"
                    value={customCal}
                    onChange={(e) => setCustomCal(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--brand-primary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#38bdf8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-white)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-white)' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.3rem' }}>
            <Button variant="secondary" onClick={() => setShowLogModal(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }}>
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
