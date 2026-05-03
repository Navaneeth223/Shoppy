import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import HeroSection from '../components/home/HeroSection/HeroSection';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { productAPI } from '../services/api/productAPI';
import CountUp from 'react-countup';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: '💻', color: '#00E5FF', count: '2,400+' },
  { name: 'Fashion', slug: 'fashion', icon: '👗', color: '#C9A84C', count: '8,200+' },
  { name: 'Home & Living', slug: 'home-living', icon: '🏠', color: '#00C896', count: '3,100+' },
  { name: 'Beauty', slug: 'beauty-health', icon: '✨', color: '#FF4D6D', count: '1,800+' },
  { name: 'Sports', slug: 'sports-outdoors', icon: '⚽', color: '#FFB800', count: '2,600+' },
  { name: 'Books', slug: 'books-media', icon: '📚', color: '#8B5CF6', count: '5,400+' },
  { name: 'Toys', slug: 'toys-kids', icon: '🧸', color: '#F97316', count: '1,200+' },
  { name: 'Automotive', slug: 'automotive', icon: '🚗', color: '#6B7280', count: '900+' },
];

const STATS = [
  { value: 10000, suffix: '+', label: 'Happy Sellers' },
  { value: 500000, suffix: '+', label: 'Products Listed' },
  { value: 2000000, suffix: '+', label: 'Orders Delivered' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsRef, statsVisible] = useIntersectionObserver({ threshold: 0.3 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, trending, arrivals, deals] = await Promise.all([
          productAPI.getFeatured(8),
          productAPI.getTrending(8),
          productAPI.getNewArrivals(8),
          productAPI.getFlashDeals(),
        ]);

        setFeaturedProducts(featured.data.data || []);
        setTrendingProducts(trending.data.data || []);
        setNewArrivals(arrivals.data.data || []);
        setFlashDeals(deals.data.data?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <SEOHead
        title="Premium Shopping Destination"
        description="Discover curated collections from the world's finest brands. Shop electronics, fashion, home goods, and more with fast shipping and easy returns."
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Nexus Commerce',
          url: 'https://nexuscommerce.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://nexuscommerce.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4" aria-labelledby="categories-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="categories-heading" className="section-title">Shop by Category</h2>
            <p className="section-subtitle mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-1 text-sm text-accent-cyan hover:text-cyan-300 transition-colors">
            All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-text-muted hover:-translate-y-1 transition-all duration-200 group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-text-primary group-hover:text-accent-gold transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">{cat.count}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="py-16 bg-surface border-y border-border" aria-labelledby="flash-deals-heading">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                  <Zap size={20} className="text-error" />
                </div>
                <div>
                  <h2 id="flash-deals-heading" className="section-title">Flash Deals</h2>
                  <p className="text-xs text-text-muted">Limited time offers — ends soon!</p>
                </div>
              </div>
              <Link to="/deals" className="btn-secondary text-sm px-4 py-2">
                View All Deals
              </Link>
            </div>
            <ProductGrid products={flashDeals} isLoading={isLoading} skeletonCount={4} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 max-w-7xl mx-auto px-4" aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="featured-heading" className="section-title">Featured Products</h2>
            <p className="section-subtitle mt-1">Hand-picked by our curation team</p>
          </div>
          <Link to="/shop?isFeatured=true" className="hidden md:flex items-center gap-1 text-sm text-accent-cyan hover:text-cyan-300 transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* Stats */}
      <section
        ref={statsRef}
        className="py-20 bg-surface border-y border-border"
        aria-label="Platform statistics"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Trusted by Millions</h2>
            <p className="section-subtitle mt-2">Join the fastest-growing commerce platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                  {statsVisible ? (
                    <CountUp
                      end={stat.value}
                      duration={2}
                      separator=","
                      suffix={stat.suffix}
                    />
                  ) : '0'}
                </div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 max-w-7xl mx-auto px-4" aria-labelledby="trending-heading">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-accent-gold" />
            <div>
              <h2 id="trending-heading" className="section-title">Trending Now</h2>
              <p className="section-subtitle mt-1">What everyone's buying this week</p>
            </div>
          </div>
          <Link to="/shop?isTrending=true" className="hidden md:flex items-center gap-1 text-sm text-accent-cyan hover:text-cyan-300 transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={trendingProducts} isLoading={isLoading} />
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-surface border-y border-border" aria-labelledby="new-arrivals-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-accent-cyan" />
              <div>
                <h2 id="new-arrivals-heading" className="section-title">New Arrivals</h2>
                <p className="section-subtitle mt-1">Fresh drops from top brands</p>
              </div>
            </div>
            <Link to="/new-arrivals" className="hidden md:flex items-center gap-1 text-sm text-accent-cyan hover:text-cyan-300 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={newArrivals} isLoading={isLoading} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-surface via-surface-2 to-surface border border-border p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-radial from-accent-gold/5 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
              Join 10,000+ sellers on Nexus Commerce and reach millions of customers worldwide.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/become-a-seller" className="btn-primary text-base px-8 py-4">
                Start Selling Today <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-secondary text-base px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
