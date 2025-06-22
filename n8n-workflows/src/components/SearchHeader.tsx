'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface SearchHeaderProps {
  className?: string;
}

export function SearchHeader({ className }: SearchHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    triggerType: searchParams.get('trigger') || '',
    active: searchParams.get('active') || ''
  });

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key === 'triggerType' ? 'trigger' : key, value);
      } else {
        params.delete(key === 'triggerType' ? 'trigger' : key);
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [query, filters, pathname, router, searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key as keyof typeof prev] === value ? '' : value
    }));
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      category: '',
      triggerType: '',
      active: ''
    });
  };

  const hasActiveFilters = query || Object.values(filters).some(v => v);

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search workflows, node types, or descriptions..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-20 py-3 rounded-lg border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
              "placeholder-slate-500 dark:placeholder-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-all duration-200"
            )}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-md transition-colors",
                showFilters 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600",
                  "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              >
                <option value="">All Categories</option>
                <option value="Communication">Communication</option>
                <option value="Database">Database</option>
                <option value="Cloud Storage">Cloud Storage</option>
                <option value="CRM">CRM</option>
                <option value="Analytics">Analytics</option>
                <option value="Social Media">Social Media</option>
                <option value="Productivity">Productivity</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Development">Development</option>
                <option value="Trigger">Trigger</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Trigger Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Trigger Type
              </label>
              <select
                value={filters.triggerType}
                onChange={(e) => handleFilterChange('triggerType', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600",
                  "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              >
                <option value="">All Triggers</option>
                <option value="webhook">Webhook</option>
                <option value="scheduled">Scheduled</option>
                <option value="triggered">Triggered</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600",
                  "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
              Search: "{query}"
              <button
                onClick={() => setQuery('')}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            const label = key === 'triggerType' ? 'Trigger' : key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-full"
              >
                {label}: {value === 'true' ? 'Active' : value === 'false' ? 'Inactive' : value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
} 