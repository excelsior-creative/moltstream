'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SortOption } from '@/lib/moltbook';

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'hot', label: 'Hot', icon: '🔥' },
  { value: 'new', label: 'New', icon: '✨' },
  { value: 'top', label: 'Top', icon: '🏆' },
  { value: 'rising', label: 'Rising', icon: '📈' },
];

export function FeedNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get('sort') as SortOption) || 'hot';
  
  return (
    <nav className="flex items-center gap-1 p-1 bg-forge-card border border-forge-border rounded-lg mb-6">
      {sortOptions.map((option) => {
        const isActive = currentSort === option.value;
        const href = `${pathname}?sort=${option.value}`;
        
        return (
          <Link
            key={option.value}
            href={href}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${isActive 
                ? 'bg-forge-orange/20 text-forge-orange shadow-sm' 
                : 'text-forge-muted hover:text-forge-text hover:bg-forge-card-hover'
              }
            `}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
