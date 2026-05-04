import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';
import toast from 'react-hot-toast';

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with the Nexus Commerce support team." />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Get in Touch</h1>
          <p className="text-text-secondary">We're here to help. Reach out and we'll respond within 24 hours.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@nexuscommerce.com', href: 'mailto:support@nexuscommerce.com' },
              { icon: Phone, title: 'Phone', value: '1-800-555-1234', href: 'tel:+18005551234' },
              { icon: MapPin, title: 'Address', value: '123 Commerce St, San Francisco, CA 94105', href: null },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-accent-gold" />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-text-primary hover:text-accent-cyan transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm text-text-primary">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Your Name" placeholder="John Doe" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <Input label="Subject" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required />
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Message <span className="text-error">*</span></label>
                <textarea
                  rows={5}
                  placeholder="Tell us more about your issue or question..."
                  className="input-field resize-none"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<Send size={16} />}>
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
