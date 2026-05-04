import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy" description="Nexus Commerce Privacy Policy — how we collect, use, and protect your data." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Privacy Policy</h1>
        <p className="text-text-muted mb-10">Last updated: January 1, 2025</p>
        <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, payment information, and any other information you choose to provide.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to process transactions, send transactional and promotional communications, provide customer support, and improve our services. We do not sell your personal information to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures including 256-bit SSL encryption, secure data storage, and regular security audits to protect your personal information.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">4. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@nexuscommerce.com to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-3">5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at privacy@nexuscommerce.com.</p>
          </section>
        </div>
      </div>
    </>
  );
}
