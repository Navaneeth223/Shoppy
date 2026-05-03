import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'New Arrivals', to: '/new-arrivals' },
    { label: 'Flash Deals', to: '/deals' },
    { label: 'Best Sellers', to: '/shop?sort=bestseller' },
    { label: 'Brands', to: '/shop?view=brands' },
  ],
  Account: [
    { label: 'My Account', to: '/profile' },
    { label: 'My Orders', to: '/profile/orders' },
    { label: 'Wishlist', to: '/profile/wishlist' },
    { label: 'Loyalty Points', to: '/profile/loyalty' },
    { label: 'Become a Seller', to: '/become-a-seller' },
  ],
  Support: [
    { label: 'Help Center', to: '/faq' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Return Policy', to: '/return-policy' },
    { label: 'Shipping Info', to: '/faq#shipping' },
    { label: 'Track Order', to: '/order/track' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/privacy-policy#cookies' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-display font-bold text-gradient-gold">NEXUS</span>
              <span className="text-accent-cyan text-3xl font-bold">.</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              The premium shopping destination for discerning buyers. Curated products, verified sellers, and an unmatched shopping experience.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:support@nexuscommerce.com" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
                <Mail size={14} />
                support@nexuscommerce.com
              </a>
              <a href="tel:+18005551234" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
                <Phone size={14} />
                1-800-555-1234
              </a>
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <MapPin size={14} />
                San Francisco, CA 94105
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-secondary transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} Nexus Commerce, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted mr-2">Secure payments:</span>
              {['Visa', 'MC', 'Amex', 'PayPal', 'Apple Pay'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 rounded bg-surface-2 border border-border text-[10px] text-text-muted font-mono"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
