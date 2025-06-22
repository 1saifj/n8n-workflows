'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Grid, List } from 'lucide-react';
import type { Workflow, WorkflowFilter } from '@/types/workflow';
import { SortControls } from './SortControls';
import { FilterSidebar } from './FilterSidebar';
import { WorkflowCard } from './WorkflowCard';
import { cn } from '@/lib/utils';

// Mock data - this would normally come from your API
const generateMockWorkflows = (count: number): Workflow[] => {
  const categories = ['Communication', 'Database', 'CRM', 'Analytics', 'Social Media', 'Productivity'];
  const triggerTypes = ['webhook', 'scheduled', 'triggered', 'manual'];
  const nodeTypes = ['Slack', 'Gmail', 'MySQL', 'HubSpot', 'Twitter', 'Notion', 'HTTP Request', 'Code'];
  
  return Array.from({ length: count }, (_, i) => {
    const numNodes = Math.floor(Math.random() * 20) + 3;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomTrigger = triggerTypes[Math.floor(Math.random() * triggerTypes.length)];
    
    return {
      id: i + 1,
      filename: `${i + 1}_${randomCategory.toLowerCase().replace(' ', '_')}_workflow.json`,
      name: `${randomCategory} Integration ${i + 1}`,
      nodes: Array.from({ length: numNodes }, (_, nodeIndex) => ({
        id: `node_${nodeIndex}`,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
        typeVersion: 1,
        position: [Math.random() * 400, Math.random() * 300] as [number, number],
        parameters: {},
        name: `Node ${nodeIndex + 1}`
      })),
      connections: {},
      tags: [randomCategory, `${numNodes} nodes`],
      active: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      triggerCount: Math.floor(Math.random() * 3) + 1,
      regularNodeCount: numNodes - 1
    };
  });
};

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'updated' | 'nodes' | 'created';

export function WorkflowBrowser() {
  const searchParams = useSearchParams();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load workflows on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockWorkflows = generateMockWorkflows(50);
        setWorkflows(mockWorkflows);
        setFilteredWorkflows(mockWorkflows);
      } catch (error) {
        console.error('Error loading workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  // Apply filters and search when URL params change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const trigger = searchParams.get('trigger') || '';
    const active = searchParams.get('active') || '';

    let filtered = workflows;

    // Apply search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(workflow => 
        workflow.name.toLowerCase().includes(searchTerm) ||
        workflow.filename.toLowerCase().includes(searchTerm) ||
        workflow.nodes.some(node => node.type.toLowerCase().includes(searchTerm)) ||
        workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(workflow =>
        workflow.tags?.includes(category)
      );
    }

    // Apply trigger filter
    if (trigger) {
      filtered = filtered.filter(workflow => {
        const triggerType = determineTriggerType(workflow.filename);
        return triggerType === trigger;
      });
    }

    // Apply active status filter
    if (active) {
      filtered = filtered.filter(workflow => 
        workflow.active === (active === 'true')
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'nodes':
          comparison = a.nodes.length - b.nodes.length;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredWorkflows(filtered);
  }, [workflows, searchParams, sortBy, sortOrder]);

  const determineTriggerType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('webhook')) return 'webhook';
    if (lower.includes('scheduled') || lower.includes('cron')) return 'scheduled';
    if (lower.includes('triggered')) return 'triggered';
    return 'manual';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600 dark:text-slate-400">
          Loading workflows...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Results count */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredWorkflows.length} of {workflows.length} workflows
        </div>

        {/* View and Sort Controls */}
        <div className="flex items-center gap-4">
          {/* Sort Controls */}
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSortBy}
            onOrderChange={setSortOrder}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <FilterSidebar workflows={filteredWorkflows} />

        {/* Workflow Grid/List */}
        <div className="flex-1">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <Grid className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No workflows found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 