import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const MEGA_MENU_DATA = {
  electronics: {
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
      { name: 'Laptops', slug: 'laptops', icon: '💻' },
      { name: 'Headphones', slug: 'headphones', icon: '🎧' },
      { name: 'Cameras', slug: 'cameras', icon: '📷' },
      { name: 'Smart Home', slug: 'smart-home', icon: '🏠' },
      { name: 'Gaming', slug: 'gaming', icon: '🎮' },
    ],
    featured: { title: 'New Arrivals', image: 'https://picsum.photos/seed/electronics/300/200', link: '/new-arrivals' },
  },
  fashion: {
    subcategories: [
      { name: "Men's Clothing", slug: 'mens-clothing', icon: '👔' },
      { name: "Women's Clothing", slug: 'womens-clothing', icon: '👗' },
      { name: 'Shoes', slug: 'shoes', icon: '👟' },
      { name: 'Accessories', slug: 'accessories', icon: '👜' },
      { name: 'Watches', slug: 'watches', icon: '⌚' },
      { name: 'Jewelry', slug: 'jewelry', icon: '💍' },
    ],
    featured: { title: 'Summer Collection', image: 'https://picsum.photos/seed/fashion/300/200', link: '/shop/fashion' },
  },
};

export default function MegaMenu({ category, onClose }) {
  const data = MEGA_MENU_DATA[category.slug] || {
    subcategories: [],
    featured: null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 top-full mt-1 w-[600px] rounded-xl bg-surface border border-border shadow-modal overflow-hidden z-dropdown"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-3 gap-0">
        {/* Subcategories */}
        <div className="col-span-2 p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            {category.label} Categories
          </p>
          <div className="grid grid-cols-2 gap-1">
            {data.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                to={`/shop/${category.slug}/${sub.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <span>{sub.icon}</span>
                {sub.name}
              </Link>
            ))}
          </div>
          <Link
            to={`/shop/${category.slug}`}
            onClick={onClose}
            className="flex items-center gap-1 mt-3 text-xs text-accent-cyan hover:text-cyan-300 transition-colors"
          >
            View all {category.label} <ArrowRight size={12} />
          </Link>
        </div>

        {/* Featured */}
        {data.featured && (
          <div className="border-l border-border p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Featured</p>
            <Link to={data.featured.link} onClick={onClose} className="block group">
              <div className="rounded-lg overflow-hidden mb-2">
                <img
                  src={data.featured.image}
                  alt={data.featured.title}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm font-medium text-text-primary group-hover:text-accent-gold transition-colors">
                {data.featured.title}
              </p>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
