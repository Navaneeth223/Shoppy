import React from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function About() {
  return (
    <>
      <SEOHead title="About Us" description="Learn about Nexus Commerce — the premium shopping destination." />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-display font-bold text-text-primary mb-6">About Nexus</h1>
          <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
            <p className="text-xl leading-relaxed">
              Nexus Commerce is the premium shopping destination for discerning buyers and ambitious sellers. We believe commerce should be beautiful, fast, and trustworthy.
            </p>
            <p>
              Founded in 2024, we've built a platform that combines the curation of a boutique with the scale of a marketplace. Every seller is verified, every product is quality-checked, and every transaction is protected.
            </p>
            <p>
              Our mission is simple: connect the world's best products with the people who want them, and give sellers the tools they need to build thriving businesses.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
