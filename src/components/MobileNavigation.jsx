import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, Moon } from 'lucide-react';

export default function MobileNavigation({ activeTab, onTabSelect }) {
  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, targetId: 'hero-section' },
    { id: 'workout', label: 'WORKOUT', icon: Dumbbell, targetId: 'weekly-plan' },
    { id: 'nutrition', label: 'NUTRITION', icon: Utensils, targetId: 'nutrition-dashboard' },
    { id: 'progress', label: 'PROGRESS', icon: TrendingUp, targetId: 'weight-chart' },
    { id: 'sleep', label: 'SLEEP', icon: Moon, targetId: 'sleep-recovery' },
  ];

  const handleClick = (item) => {
    onTabSelect(item.id);
    const element = document.getElementById(item.targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <IconComponent size={20} color={isActive ? 'var(--gold-primary)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
