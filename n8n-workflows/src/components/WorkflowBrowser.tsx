'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Search, Filter, Activity, Calendar, Zap, Layers, ExternalLink, Download } from 'lucide-react';

// Types
interface WorkflowCardProps {
  workflow: {
    id: number;
    filename: string;
    name: string;
    description: string;
    active: boolean;
    triggerType: string;
    complexity: string;
    nodeCount: number;
    integrations: string[];
    tags: string[];
    createdAt: string;
  };
}

// Modern Workflow Card Component
const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'webhook': return <Zap size={16} />;
      case 'scheduled': return <Calendar size={16} />;
      case 'polling': return <Activity size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {workflow.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {workflow.description}
            </p>
          </div>
          <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(workflow.complexity)}`}>
            {workflow.complexity}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            {getTriggerIcon(workflow.triggerType)}
            <span className="capitalize">{workflow.triggerType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers size={16} />
            <span>{workflow.nodeCount} nodes</span>
          </div>
          <div className={`flex items-center gap-1 ${workflow.active ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{workflow.active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {workflow.integrations.slice(0, 4).map((integration, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
              >
                {integration}
              </span>
            ))}
            {workflow.integrations.length > 4 && (
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                +{workflow.integrations.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {workflow.filename}
          </span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
              <ExternalLink size={16} />
            </button>
            <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterControls = ({ 
  filters, 
  onFiltersChange 
}: { 
  filters: any; 
  onFiltersChange: (filters: any) => void;
}) => (
  <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
    {/* Trigger Type Filter */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Trigger Type
      </label>
      <select
        value={filters.triggerType}
        onChange={(e) => onFiltersChange({ ...filters, triggerType: e.target.value })}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Types</option>
        <option value="webhook">Webhook</option>
        <option value="scheduled">Scheduled</option>
        <option value="polling">Polling</option>
        <option value="manual">Manual</option>
      </select>
    </div>

    {/* Complexity Filter */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Complexity
      </label>
      <select
        value={filters.complexity}
        onChange={(e) => onFiltersChange({ ...filters, complexity: e.target.value })}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Levels</option>
        <option value="simple">Simple</option>
        <option value="medium">Medium</option>
        <option value="complex">Complex</option>
      </select>
    </div>

    {/* Active Only Toggle */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Status
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.activeOnly}
          onChange={(e) => onFiltersChange({ ...filters, activeOnly: e.target.checked })}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">Active only</span>
      </label>
    </div>
  </div>
);

// Main WorkflowBrowser Component
export function WorkflowBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    triggerType: 'all',
    complexity: 'all',
    activeOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Build search input for tRPC
  const searchInput = {
    query: searchQuery,
    ...filters,
  };

  const { data: searchResults, isLoading, error } = trpc.workflows.searchWorkflows(searchInput);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search workflows by name, description, or integration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-4 text-lg rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <FilterControls filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div>
            {isLoading ? (
              'Loading workflows...'
            ) : searchResults ? (
              `Found ${searchResults.workflows.length} workflows`
            ) : (
              'No results'
            )}
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load workflows</p>
          </div>
        ) : searchResults?.workflows.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
            <Search className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No workflows found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults?.workflows.map((workflow: any) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 