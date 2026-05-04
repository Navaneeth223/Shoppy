import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, TrendingUp, Shield, DollarSign, ArrowRight, Check } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import axiosInstance from '../services/api/axiosInstance';
import toast from 'react-hot-toast';

const schema = z.object({
  storeName: z.string().min(3, 'Store name must be at least 3 characters').max(100),
  description: z.string().min(20, 'Please provide a brief description (min 20 chars)').max(500),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(7, 'Valid phone number required'),
});

const BENEFITS = [
  { icon: TrendingUp, title: 'Reach Millions', desc: 'Access our 2M+ active shoppers from day one.' },
  { icon: DollarSign, title: 'Low Commission', desc: 'Only 10% commission — keep 90% of every sale.' },
  { icon: Shield, title: 'Seller Protection', desc: 'Fraud protection and dispute resolution built in.' },
  { icon: Store, title: 'Your Own Storefront', desc: 'Branded store page with custom URL and branding.' },
];

const STEPS = [
  { num: '01', title: 'Apply', desc: 'Fill out the seller application form.' },
  { num: '02', title: 'Get Approved', desc: 'Our team reviews your application within 2-3 days.' },
  { num: '03', title: 'List Products', desc: 'Upload your products with our easy listing tool.' },
  { num: '04', title: 'Start Selling', desc: 'Receive orders and grow your business.' },
];

export default function BecomeASeller() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to apply as a seller.');
      navigate('/login?redirect=/become-a-seller');
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post('/sellers/apply', data);
      toast.success('Application submitted! We\'ll review it within 2-3 business days.');
      navigate('/seller-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead
        title="Become a Seller"
        description="Join 10,000+ sellers on Nexus Commerce. Low commission, powerful tools, and millions of customers waiting."
      />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-gold/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-gold mb-4 inline-block">🚀 Seller Program</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary mb-6">
              Sell on <span className="text-gradient-gold">Nexus</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
              Join thousands of successful sellers and reach millions of customers. Start your journey today.
            </p>
            <a href="#apply" className="btn-primary text-lg px-10 py-4">
              Apply Now <ArrowRight size={20} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-12">Why Sell on Nexus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon size={24} className="text-accent-gold" />
                </div>
                <h3 className="font-display font-semibold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-secondary">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-display font-bold text-gradient-gold mb-3">{step.num}</div>
              <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-16 bg-surface border-t border-border">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-text-primary mb-2">Apply to Sell</h2>
            <p className="text-text-secondary">Fill out the form below and we'll get back to you within 2-3 business days.</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Store Name"
                placeholder="Your Brand or Business Name"
                error={errors.storeName?.message}
                required
                {...register('storeName')}
              />
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                  Store Description <span className="text-error">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your products and business..."
                  className="input-field resize-none"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-error mt-1">{errors.description.message}</p>
                )}
              </div>
              <Input
                label="Contact Email"
                type="email"
                placeholder="business@example.com"
                error={errors.contactEmail?.message}
                required
                {...register('contactEmail')}
              />
              <Input
                label="Contact Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                error={errors.contactPhone?.message}
                required
                {...register('contactPhone')}
              />

              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-2 border border-border">
                <Check size={16} className="text-success mt-0.5 shrink-0" />
                <p className="text-xs text-text-secondary">
                  By applying, you agree to our{' '}
                  <a href="/terms" className="text-accent-cyan hover:underline">Seller Terms</a> and{' '}
                  <a href="/privacy-policy" className="text-accent-cyan hover:underline">Privacy Policy</a>.
                </p>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} size="lg">
                Submit Application <ArrowRight size={18} />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
