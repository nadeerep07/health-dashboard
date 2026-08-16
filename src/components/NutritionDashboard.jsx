import React, { useState } from 'react';
import { Utensils, Flame, Beef, Droplets, Heart, CheckCircle2, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';

export default function NutritionDashboard() {
  const [selectedBreakfast, setSelectedBreakfast] = useState(1);
  const [openMeal, setOpenMeal] = useState(null);

  const toggleMeal = (mealKey) => {
    setOpenMeal(openMeal === mealKey ? null : mealKey);
  };

  return (
    <section id="nutrition-dashboard" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Utensils size={20} />
          </div>
          <div>
            <h2 className="card-title">Nutrition & Meal Plan</h2>
            <p className="card-subtitle">Kerala & South Asian home foods — realistic & non-restrictive</p>
          </div>
        </div>
        <span className="gold-tag">Sustainable Caloric Deficit</span>
      </div>

      {/* Target Macros Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: 'rgba(255, 215, 0, 0.06)', border: '1px solid rgba(255, 215, 0, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Flame size={15} /> Calorie Target
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            2,000–2,200 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 215, 0, 0.06)', border: '1px solid rgba(255, 215, 0, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Beef size={15} /> Protein Goal
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            120–150 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>g</span>
          </div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Droplets size={15} /> Water Intake
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            3.0–4.0 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Liters</span>
          </div>
        </div>
      </div>

      {/* Sustainable Approach Notice */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.1rem',
        marginBottom: '1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <ShieldCheck size={20} color="var(--accent-green)" />
        <span><strong>No crash dieting.</strong> Eat whole foods, prioritize protein, stay hydrated, and enjoy traditional home meals while maintaining energy for daily walks.</span>
      </div>

      {/* Daily Meals Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)' }}>
          Daily Meals Schedule
        </h3>

        {/* BREAKFAST */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.95rem' }}>
              BREAKFAST
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '0.2rem', borderRadius: 'var(--radius-pill)' }}>
              <button 
                onClick={() => setSelectedBreakfast(1)}
                style={{
                  background: selectedBreakfast === 1 ? 'var(--gold-gradient)' : 'transparent',
                  color: selectedBreakfast === 1 ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Option 1 (Dosa)
              </button>
              <button 
                onClick={() => setSelectedBreakfast(2)}
                style={{
                  background: selectedBreakfast === 2 ? 'var(--gold-gradient)' : 'transparent',
                  color: selectedBreakfast === 2 ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Option 2 (Puttu)
              </button>
            </div>
          </div>

          {selectedBreakfast === 1 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 2 Dosa</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 2 Whole Eggs (Boiled or Omelette)</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 100–150 g Green-peas curry</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 1–2 tbsp Coconut chutney</li>
            </ul>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> ½–1 small Puttu</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 1 Banana</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 2 Whole Eggs</li>
            </ul>
          )}
        </div>

        {/* LUNCH */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            LUNCH
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 150–200 g Cooked Rice</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 120–150 g Fish (Grilled / Curry)</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 150–250 g Vegetables</li>
          </ul>
          <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Vegetable Examples:</strong> Beetroot, Long beans / yardlong beans, Bitter melon / bitter gourd, Cabbage, Carrot, Cucumber
          </div>
        </div>

        {/* EVENING SNACK */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            EVENING SNACK
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 150–200 g Fresh Fruit</li>
          </ul>
          <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Example: 100 g Pomegranate + 100 g Grapes
          </div>
        </div>

        {/* DINNER */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            DINNER
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 2 Chapati</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 150–200 g Cooked Chicken</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={15} color="var(--gold-primary)" /> 150–250 g Vegetables / Salad</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><CheckCircle2 size={15} color="var(--text-muted)" /> Optional: 100–150 g fruit</li>
          </ul>
        </div>
      </div>

      {/* FLEXIBLE FOOD SECTION — REAL LIFE MEALS */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 25, 36, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <Sparkles size={20} color="var(--gold-primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Real Life Meals & Social Dining
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Occasional foods like <strong>Chicken Biryani</strong> and <strong>Chicken Mandi</strong> can fit into your overall plan without destroying your progress.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Mandi Card */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.9rem' }}>
              Chicken Mandi Strategy
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', paddingLeft: '1rem', lineHeight: 1.5 }}>
              <li>Moderate rice portion</li>
              <li>Focus on chicken protein</li>
              <li>Use green chutney</li>
              <li>Avoid unnecessary mayonnaise & sugary sodas</li>
            </ul>
          </div>

          {/* Biryani Card */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.9rem' }}>
              Chicken Biryani Strategy
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', paddingLeft: '1rem', lineHeight: 1.5 }}>
              <li>Portion ~250–300 g biryani rice</li>
              <li>Include 100–150 g chicken</li>
              <li>Avoid turning it into an all-day cheat binge</li>
            </ul>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '0.95rem',
          color: 'var(--gold-primary)'
        }}>
          "One meal doesn't ruin your progress. Consistency matters."
        </div>
      </div>
    </section>
  );
}
