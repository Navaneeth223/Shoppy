import React from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Nexus Commerce — our mission, values, and the team behind the platform."
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-display font-bold text-text-primary mb-6">
            About <span className="text-gradient-gold">Nexus</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            Nexus Commerce is a premium marketplace connecting discerning buyers with verified sellers worldwide.
            We believe shopping should be an experience — not just a transaction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Our Mission', desc: 'To create the most trusted and enjoyable commerce platform on the internet.' },
              { title: 'Our Vision', desc: 'A world where every seller can reach global customers and every buyer finds exactly what they need.' },
              { title: 'Our Values', desc: 'Trust, quality, transparency, and relentless focus on customer experience.' },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <h2 className="font-display font-semibold text-accent-gold mb-3">{item.title}</h2>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Our Story</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Founded in 2024, Nexus Commerce was born from a simple frustration: existing marketplaces were either too
              cluttered, too expensive for sellers, or too untrustworthy for buyers. We set out to build something better.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              Today, we serve over 2 million customers and 10,000 verified sellers across 50+ countries. Every product
              on our platform is reviewed, every seller is verified, and every transaction is protected.
            </p>
            <p className="text-text-secondary leading-relaxed">
              We're just getting started. Our team of 200+ engineers, designers, and commerce experts work every day
              to make Nexus the best place to buy and sell online.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
