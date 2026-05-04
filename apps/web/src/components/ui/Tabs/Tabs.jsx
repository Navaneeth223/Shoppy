import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Accessible tab component.
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { id: 'overview', label: 'Overview', content: <Overview /> },
 *     { id: 'reviews', label: 'Reviews', content: <Reviews /> },
 *   ]}
 * />
 */
export default function Tabs({ tabs = [], defaultTab, className }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan',
              activeTab === tab.id
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-2 badge-cyan text-[10px] px-1.5 py-0.5">{tab.badge}</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold rounded-full"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-6"
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeContent}
        </motion.div>
      </div>
    </div>
  );
}
