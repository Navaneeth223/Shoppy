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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">Get in Touch</h1>
          <p className="text-text-secondary mb-12">We're here to help. Send us a message and we'll respond within 24 hours.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'support@nexuscommerce.com', href: 'mailto:support@nexuscommerce.com' },
                { icon: Phone, label: 'Phone', value: '1-800-555-1234', href: 'tel:+18005551234' },
                { icon: MapPin, label: 'Address', value: '123 Commerce St, San Francisco, CA 94105' },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-text-primary hover:text-accent-gold transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm text-text-primary">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <Input
                  label="Subject"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  required
                />
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={5}
                    required
                    className="input-field resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" isLoading={isLoading} rightIcon={<Send size={16} />}>
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
