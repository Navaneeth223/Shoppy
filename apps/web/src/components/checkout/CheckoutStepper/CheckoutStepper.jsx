import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const STEPS = [
  { id: 1, label: 'Contact & Delivery' },
  { id: 2, label: 'Shipping' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Review' },
];

/**
 * Multi-step checkout progress indicator.
 */
export default function CheckoutStepper({ currentStep, className }) {
  return (
    <nav
      aria-label="Checkout progress"
      className={clsx('flex items-center', className)}
    >
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              {/* Step circle */}
              <motion.div
                animate={{
                  backgroundColor: isCompleted
                    ? '#00C896'
                    : isActive
                    ? '#C9A84C'
                    : 'transparent',
                  borderColor: isCompleted
                    ? '#00C896'
                    : isActive
                    ? '#C9A84C'
                    : 'rgba(255,255,255,0.12)',
                }}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-300'
                )}
              >
                {isCompleted ? (
                  <Check size={14} className="text-bg" strokeWidth={3} />
                ) : (
                  <span className={isActive ? 'text-bg' : 'text-text-muted'}>
                    {step.id}
                  </span>
                )}
              </motion.div>

              {/* Step label */}
              <span
                className={clsx(
                  'text-sm font-medium hidden sm:block transition-colors duration-300',
                  isActive
                    ? 'text-text-primary'
                    : isCompleted
                    ? 'text-success'
                    : 'text-text-muted'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-3 h-px relative overflow-hidden">
                <div className="absolute inset-0 bg-border" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-success"
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
