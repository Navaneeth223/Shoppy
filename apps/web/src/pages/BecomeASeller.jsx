import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Shield, Zap, ArrowRight, Check } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';

const BENEFITS = [
  { icon: TrendingUp, title: 'Reach Millions', desc: 'Access our 2M+ active shoppers across all categories' },
  { icon: Shield, title: 'Seller Protection', desc: 'Fraud protection, dispute resolution, and secure payouts' },
  { icon: Zap, title: 'Fast Payouts', desc: 'Weekly payouts directly to your bank account or Stripe' },
  { icon: Store, title: 'Your Own Store', desc: 'Customizable storefront with your branding and policies' },
];

const STEPS = [
  { step: '01', title: 'Apply', desc: 'Fill out the seller application form with your business details' },
  { step: '02', title: 'Get Approved', desc: 'Our team reviews your application within 2-3 business days' },
  { step: '03', title: 'List Products', desc: 'Upload your products with our easy-to-use seller dashboard' },
  { step: '04', title: 'Start Selling', desc: 'Receive orders, ship products, and get paid automatically' },
];

export default function BecomeASeller() {
  return (
    <>
      <SEOHead
        title="Become a Seller"
        description="Join 10,000+ sellers on Nexus Commerce. Reach millions of customers and grow your business."
      />

      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-gold/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-gold mb-4 inline-block">🚀 Seller Program</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary mb-6">
              Sell on <span className="text-gradient-gold">Nexus</span>
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful sellers and reach millions of customers. Low fees, powerful tools, and dedicated support.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-10 py-4">
                Start Selling Today <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-10 py-4">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-20 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-12">Why Sell on Nexus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon size={24} className="text-accent-gold" />
                </div>
                <h3 className="font-display font-semibold text-text-primary mb-2">{b.title}</h3>
                <p className="text-sm text-text-secondary">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="py-20 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-display font-bold text-gradient-gold mb-4">{s.step}</div>
              <h3 className="font-display font-semibold text-text-primary mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-text-primary mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary mb-10">No monthly fees. Only pay when you sell.</p>
          <div className="card p-8">
            <div className="text-5xl font-display font-bold text-gradient-gold mb-2">10%</div>
            <p className="text-text-secondary mb-6">Commission per sale (negotiable for high-volume sellers)</p>
            <ul className="space-y-3 text-sm text-text-secondary text-left max-w-sm mx-auto mb-8">
              {[
                'No listing fees',
                'No monthly subscription',
                'Free seller dashboard',
                'Unlimited product listings',
                'Dedicated seller support',
                'Analytics and insights',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} className="text-success shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex">
              Apply Now — It's Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
