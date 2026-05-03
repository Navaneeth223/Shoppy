import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const SLIDES = [
  {
    id: 1,
    title: 'The Future of\nPremium Shopping',
    subtitle: 'Discover curated collections from the world\'s finest brands',
    cta: { label: 'Explore Now', href: '/shop' },
    ctaSecondary: { label: 'View Deals', href: '/deals' },
    image: 'https://picsum.photos/seed/hero1/1920/1080',
    accent: '#C9A84C',
    badge: '✨ New Season Collection',
  },
  {
    id: 2,
    title: 'Flash Deals\nUp to 70% Off',
    subtitle: 'Limited time offers on thousands of premium products',
    cta: { label: 'Shop Deals', href: '/deals' },
    ctaSecondary: { label: 'New Arrivals', href: '/new-arrivals' },
    image: 'https://picsum.photos/seed/hero2/1920/1080',
    accent: '#FF4D6D',
    badge: '⚡ Flash Sale Live',
  },
  {
    id: 3,
    title: 'Sell on Nexus\nReach Millions',
    subtitle: 'Join 10,000+ sellers and grow your business with our platform',
    cta: { label: 'Start Selling', href: '/become-a-seller' },
    ctaSecondary: { label: 'Learn More', href: '/about' },
    image: 'https://picsum.photos/seed/hero3/1920/1080',
    accent: '#00E5FF',
    badge: '🚀 Seller Program',
  },
];

const FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $75' },
  { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encryption' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
  { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <section aria-label="Hero banner">
      {/* Main hero */}
      <div
        className="relative h-[85vh] min-h-[600px] overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-border text-sm font-medium text-text-secondary mb-6"
                >
                  {slide.badge}
                </motion.div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-display font-bold text-text-primary leading-tight mb-6 whitespace-pre-line">
                  {slide.title.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {i === 0 ? line : <span className="text-gradient-gold">{line}</span>}
                    </span>
                  ))}
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link to={slide.cta.href} className="btn-primary text-base px-8 py-4 shadow-gold-glow">
                    {slide.cta.label} <ArrowRight size={18} />
                  </Link>
                  <Link to={slide.ctaSecondary.href} className="btn-secondary text-base px-8 py-4">
                    {slide.ctaSecondary.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={clsx(
                'transition-all duration-300 rounded-full',
                i === currentSlide
                  ? 'w-8 h-2 bg-accent-gold'
                  : 'w-2 h-2 bg-text-muted hover:bg-text-secondary'
              )}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide ? 'true' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Feature blocks */}
      <div className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 px-6 py-5"
              >
                <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{feature.title}</p>
                  <p className="text-xs text-text-muted">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
