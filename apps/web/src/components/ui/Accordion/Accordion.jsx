import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * Accordion item component.
 */
function AccordionItem({ title, children, defaultOpen = false, className }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={clsx('border-b border-border last:border-0', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-text-primary pr-4">{title}</span>
        <ChevronDown
          size={16}
          className={clsx(
            'text-text-muted shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Accordion container component.
 */
export default function Accordion({ items = [], className }) {
  return (
    <div className={clsx('divide-y divide-border', className)}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          title={item.title}
          defaultOpen={item.defaultOpen}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

export { AccordionItem };
