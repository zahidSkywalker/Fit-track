import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'pill' | 'underline' | 'neu';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pill',
  className = '',
}) => {
  if (variant === 'underline') {
    return <UnderlineTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />;
  }
  if (variant === 'neu') {
    return <NeuTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />;
  }
  return <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />;
};

/* ===== Pill Tabs ===== */
const PillTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => (
  <div className={`flex items-center gap-1.5 p-1 neu-pressed-sm ${className}`}>
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-neu-sm text-xs font-semibold transition-colors z-0"
        >
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-neu-sm bg-neu-bg"
              layoutId="pill-tab-active"
              style={{
                boxShadow: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-neu-blue-tint text-neu-blue' : 'text-neu-text-tertiary'
                }`}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

/* ===== Underline Tabs ===== */
const UnderlineTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => (
  <div className={`flex items-center gap-0 border-b border-neu-bg-dark/20 ${className}`}>
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors"
        >
          <span className={isActive ? 'text-neu-blue' : 'text-neu-text-secondary'}>
            {tab.icon}
          </span>
          <span className={isActive ? 'text-neu-blue' : 'text-neu-text-secondary'}>
            {tab.label}
          </span>
          {tab.count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neu-bg-dark/20 text-neu-text-secondary font-bold">
              {tab.count}
            </span>
          )}
          {isActive && (
            <motion.span
              className="absolute bottom-0 left-2 right-2 h-0.5 bg-neu-blue rounded-full"
              layoutId="underline-tab-active"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

/* ===== Neumorphic Toggle Tabs ===== */
const NeuTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => (
  <div className={`flex gap-2 ${className}`}>
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-neu text-xs font-semibold
            ${isActive ? 'text-white' : 'text-neu-text-secondary neu-pressable'}
          `}
          style={
            isActive
              ? {
                  background: 'linear-gradient(145deg, #8AB3D5, #6C99BD)',
                  boxShadow: '4px 4px 8px #C8BFB5, -4px -4px 8px #F5EDE5',
                }
              : undefined
          }
          whileTap={!isActive ? { scale: 0.97 } : undefined}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'text-neu-text-tertiary'
              }`}
            >
              {tab.count}
            </span>
          )}
        </motion.button>
      );
    })}
  </div>
);
