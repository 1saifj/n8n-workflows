import { Filter, Tag, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Workflow } from '@/types/workflow';

interface FilterSidebarProps {
  workflows: Workflow[];
  className?: string;
}

export function FilterSidebar({ workflows, className }: FilterSidebarProps) {
  // Calculate filter options based on current workflows
  const categories = Array.from(new Set(
    workflows.flatMap(w => w.tags || [])
      .filter(tag => !tag.includes('nodes')) // Exclude node count tags
  )).sort();

  const triggerTypes = Array.from(new Set(
    workflows.map(w => {
      const filename = w.filename.toLowerCase();
      if (filename.includes('webhook')) return 'webhook';
      if (filename.includes('scheduled') || filename.includes('cron')) return 'scheduled';
      if (filename.includes('triggered')) return 'triggered';
      return 'manual';
    })
  )).sort();

  const nodeTypes = Array.from(new Set(
    workflows.flatMap(w => w.nodes.map(n => n.type))
  )).sort().slice(0, 20); // Show top 20 most common node types

  const activeCount = workflows.filter(w => w.active).length;
  const inactiveCount = workflows.filter(w => !w.active).length;

  return (
    <div className={cn("w-64 space-y-6", className)}>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            Filters
          </h3>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Categories
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {categories.map((category) => {
                const count = workflows.filter(w => w.tags?.includes(category)).length;
                return (
                  <label key={category} className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded px-2 py-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-600 dark:text-slate-400 truncate">
                        {category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Trigger Types */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Trigger Types
            </h4>
            <div className="space-y-1">
              {triggerTypes.map((type) => {
                const count = workflows.filter(w => {
                  const filename = w.filename.toLowerCase();
                  if (type === 'webhook') return filename.includes('webhook');
                  if (type === 'scheduled') return filename.includes('scheduled') || filename.includes('cron');
                  if (type === 'triggered') return filename.includes('triggered');
                  return !filename.includes('webhook') && !filename.includes('scheduled') && !filename.includes('triggered');
                }).length;

                return (
                  <label key={type} className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded px-2 py-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-600 dark:text-slate-400 capitalize">
                        {type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Status
            </h4>
            <div className="space-y-1">
              <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    Active
                  </span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {activeCount}
                </span>
              </label>
              <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    Inactive
                  </span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {inactiveCount}
                </span>
              </label>
            </div>
          </div>

          {/* Node Count Range */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Node Count
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  defaultValue="1"
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>1</span>
                <span>50+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Total Workflows</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{workflows.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Categories</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Avg Nodes</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {workflows.length > 0 ? Math.round(workflows.reduce((acc, w) => acc + w.nodes.length, 0) / workflows.length) : 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Active Rate</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {workflows.length > 0 ? Math.round((activeCount / workflows.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Popular Node Types */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          Popular Nodes
        </h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {nodeTypes.slice(0, 8).map((nodeType) => {
            const count = workflows.reduce((acc, w) => 
              acc + w.nodes.filter(n => n.type === nodeType).length, 0
            );
            return (
              <div key={nodeType} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 truncate">
                  {nodeType}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 