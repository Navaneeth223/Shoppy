import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import clsx from 'clsx';

/**
 * Breadcrumb navigation component.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Electronics', href: '/shop/electronics' },
 *     { label: 'Headphones', href: '/shop/electronics/headphones' },
 *     { label: 'Sony WH-1000XM5' },
 *   ]}
 * />
 */
export default function Breadcrumb({ items = [], showHome = true, className }) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: Home }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={clsx('flex items-center flex-wrap gap-1', className)}>
      <ol className="flex items-center flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li
              key={index}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight size={12} className="text-text-muted shrink-0" aria-hidden="true" />
              )}

              {isLast ? (
                <span
                  className="text-sm text-text-primary font-medium line-clamp-1 max-w-[200px]"
                  aria-current="page"
                  itemProp="name"
                >
                  {Icon && <Icon size={14} className="inline mr-1" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
                  itemProp="item"
                >
                  {Icon && <Icon size={14} aria-hidden="true" />}
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}

              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
