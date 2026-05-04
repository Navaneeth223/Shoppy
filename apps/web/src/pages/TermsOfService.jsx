import React from 'react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function TermsOfService() {
  return (
    <>
      <SEOHead title="Terms of Service" description="Nexus Commerce Terms of Service — the rules governing use of our platform." />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">Terms of Service</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: January 1, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {[
            { title: '1. Acceptance of Terms', content: 'By accessing or using Nexus Commerce, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.' },
            { title: '2. User Accounts', content: 'You must be 18 or older to create an account. You are responsible for maintaining the security of your account credentials and for all activities under your account.' },
            { title: '3. Prohibited Activities', content: 'You may not use our platform for illegal activities, fraud, harassment, spam, or to sell prohibited items. Violations may result in immediate account termination.' },
            { title: '4. Seller Obligations', content: 'Sellers must accurately describe their products, fulfill orders promptly, and comply with all applicable laws. Nexus Commerce is not responsible for seller conduct.' },
            { title: '5. Intellectual Property', content: 'All content on Nexus Commerce is protected by copyright. You may not reproduce, distribute, or create derivative works without our written permission.' },
            { title: '6. Limitation of Liability', content: 'Nexus Commerce is not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the 12 months preceding the claim.' },
            { title: '7. Governing Law', content: 'These terms are governed by the laws of the State of California. Disputes will be resolved through binding arbitration in San Francisco, CA.' },
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
