import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

/**
 * Empty state component with icon, title, description, and optional action.
 */
export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'Nothing here yet',
  description,
  action,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className || ''}`}
    >
      <div className="w-20 h-20 rounded-full bg-surface-2 border border-border flex items-center justify-center mb-6">
        <Icon size={32} className="text-text-muted" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-display font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action && (
        action.onClick ? (
          <button onClick={action.onClick} className="btn-primary text-sm">
            {action.label}
          </button>
        ) : (
          <Link to={action.href} className="btn-primary text-sm">
            {action.label}
          </Link>
        )
      )}
    </motion.div>
  );
}
