import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy" description="Nexus Commerce Privacy Policy — how we collect, use, and protect your data." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: January 1, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: 'We collect information you provide directly (name, email, address, payment info), information from your use of our services (browsing history, purchase history, device info), and information from third parties (social login providers, payment processors).',
            },
            {
              title: '2. How We Use Your Information',
              content: 'We use your information to process orders and payments, provide customer support, personalize your experience, send transactional and promotional emails (with your consent), improve our platform, and comply with legal obligations.',
            },
            {
              title: '3. Information Sharing',
              content: 'We share your information with sellers to fulfill orders, payment processors (Stripe) to process payments, shipping carriers to deliver orders, and service providers who help us operate our platform. We do not sell your personal information.',
            },
            {
              title: '4. Data Security',
              content: 'We implement industry-standard security measures including 256-bit SSL encryption, bcrypt password hashing, and regular security audits. However, no method of transmission over the internet is 100% secure.',
            },
            {
              title: '5. Cookies',
              content: 'We use cookies for authentication, preferences, analytics, and advertising. You can control cookie settings in your browser. Disabling cookies may affect platform functionality.',
            },
            {
              title: '6. Your Rights',
              content: 'You have the right to access, correct, or delete your personal data. You can export your data from your account settings. To exercise these rights, contact us at privacy@nexuscommerce.com.',
            },
            {
              title: '7. Contact Us',
              content: 'For privacy-related questions, contact our Data Protection Officer at privacy@nexuscommerce.com or write to us at 123 Commerce St, San Francisco, CA 94105.',
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-3">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
