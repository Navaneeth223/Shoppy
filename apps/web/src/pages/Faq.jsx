import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import clsx from 'clsx';

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Overnight shipping is available for most locations.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Orders over $75 qualify for free standard shipping. Gold and Platinum loyalty members get free shipping on all orders.' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account under "My Orders".' },
      { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement if they haven\'t been processed yet. Contact support immediately if you need to make changes.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery. Items must be in original condition with all tags attached and original packaging.' },
      { q: 'How do I initiate a return?', a: 'Go to My Orders, select the order, and click "Request Return". You\'ll receive a prepaid return label within 24 hours.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3-5 business days after we receive the returned item. It may take an additional 5-7 days to appear on your statement.' },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a reset link within a few minutes.' },
      { q: 'Is my payment information secure?', a: 'Yes. We use Stripe for payment processing with 256-bit SSL encryption. We never store your full card details on our servers.' },
      { q: 'What is two-factor authentication?', a: '2FA adds an extra layer of security to your account. After enabling it, you\'ll need your password plus a code from your authenticator app to log in.' },
    ],
  },
  {
    category: 'Sellers',
    items: [
      { q: 'How do I become a seller?', a: 'Visit our "Become a Seller" page and submit an application. Our team reviews applications within 2-3 business days.' },
      { q: 'What are the seller fees?', a: 'We charge a 10% commission on each sale. There are no listing fees, monthly fees, or setup costs.' },
      { q: 'When do sellers get paid?', a: 'Sellers receive payouts on a weekly, bi-weekly, or monthly schedule (your choice). Minimum payout amount is $50.' },
    ],
  },
];

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-text-primary pr-4">{question}</span>
        <ChevronDown
          size={16}
          className={clsx('text-text-muted shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-text-secondary pb-4 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <>
      <SEOHead title="FAQ" description="Frequently asked questions about Nexus Commerce — orders, shipping, returns, and more." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Frequently Asked Questions</h1>
          <p className="text-text-secondary mb-12">Can't find what you're looking for? <a href="/contact" className="text-accent-cyan hover:underline">Contact us</a>.</p>

          <div className="space-y-8">
            {FAQS.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-display font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                  {section.category}
                </h2>
                <div className="card divide-y divide-border overflow-hidden">
                  {section.items.map((item) => (
                    <div key={item.q} className="px-5">
                      <FaqItem question={item.q} answer={item.a} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
