import React from 'react';
import { Home, Footprints, Dumbbell, Utensils, TrendingUp } from 'lucide-react';

export default function MobileNavigation({ activeTab, onTabSelect }) {
  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'walk', label: 'WALK', icon: Footprints },
    { id: 'workout', label: 'WORKOUT', icon: Dumbbell },
    { id: 'nutrition', label: 'FOOD', icon: Utensils },
    { id: 'progress', label: 'PROGRESS', icon: TrendingUp },
  ];

  const handleClick = (id) => {
    onTabSelect(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <IconComponent size={20} color={isActive ? 'var(--gold-primary)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
