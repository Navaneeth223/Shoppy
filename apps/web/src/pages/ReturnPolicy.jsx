import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead title="Return Policy" description="Nexus Commerce 30-day return policy — hassle-free returns and refunds." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Return Policy</h1>
        <p className="text-text-muted mb-10">Last updated: January 1, 2025</p>
        <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">30-Day Return Window</h2>
            <p>We accept returns within 30 days of the delivery date. Items must be in their original condition, unworn, unwashed, and with all original tags and packaging intact.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">How to Return</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to My Orders and select the order you want to return</li>
              <li>Click "Request Return" and select the items and reason</li>
              <li>Print the prepaid return label we email you</li>
              <li>Drop off the package at any authorized carrier location</li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">Refund Timeline</h2>
            <p>Once we receive and inspect your return, we'll process your refund within 3-5 business days. The refund will appear on your original payment method within 5-10 business days.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">Non-Returnable Items</h2>
            <p>The following items cannot be returned: digital downloads, personalized/custom items, perishable goods, intimate apparel, and items marked as final sale.</p>
          </section>
        </div>
      </div>
    </>
  );
}
