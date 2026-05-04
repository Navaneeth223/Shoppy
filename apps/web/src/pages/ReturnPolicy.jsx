import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { RotateCcw, Package, Clock, CheckCircle } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead title="Return Policy" description="Nexus Commerce 30-day return policy — hassle-free returns on most items." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={28} className="text-accent-gold" />
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Return Policy</h1>
          <p className="text-text-secondary">30-day hassle-free returns on most items.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Clock, title: '30 Days', desc: 'Return window from delivery date' },
            { icon: Package, title: 'Free Returns', desc: 'Prepaid return label provided' },
            { icon: CheckCircle, title: 'Fast Refunds', desc: '5-7 business days processing' },
          ].map((item) => (
            <div key={item.title} className="card p-5 text-center">
              <item.icon size={24} className="text-accent-gold mx-auto mb-3" />
              <p className="font-semibold text-text-primary">{item.title}</p>
              <p className="text-xs text-text-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          {[
            { title: 'Eligible Items', content: 'Most items purchased on Nexus Commerce are eligible for return within 30 days of delivery, provided they are in original condition with all tags and packaging intact.' },
            { title: 'Non-Returnable Items', content: 'Digital downloads, gift cards, perishable goods, intimate apparel, and items marked "Final Sale" cannot be returned. Customized or personalized items are also non-returnable.' },
            { title: 'How to Return', content: 'Go to My Orders, select the order, click "Request Return", choose the items and reason, and submit. You\'ll receive a prepaid return label within 24 hours.' },
            { title: 'Refund Processing', content: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 business days. Refunds are issued to the original payment method.' },
            { title: 'Damaged or Wrong Items', content: 'If you received a damaged or incorrect item, contact us immediately with photos. We\'ll arrange a replacement or full refund at no cost to you.' },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
