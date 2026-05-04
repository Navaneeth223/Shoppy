import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function TermsOfService() {
  return (
    <>
      <SEOHead title="Terms of Service" description="Nexus Commerce Terms of Service — the rules governing use of our platform." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Terms of Service</h1>
        <p className="text-text-muted mb-10">Last updated: January 1, 2025</p>
        <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Nexus Commerce, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">2. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">3. Prohibited Activities</h2>
            <p>You may not use our platform for any illegal purpose, to sell counterfeit goods, to engage in fraud, or to violate any applicable laws or regulations.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">4. Limitation of Liability</h2>
            <p>Nexus Commerce shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">5. Contact</h2>
            <p>For questions about these Terms, contact us at legal@nexuscommerce.com.</p>
          </section>
        </div>
      </div>
    </>
  );
}
