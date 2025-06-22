import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Workflow, WorkflowFilter, WorkflowSearchResult } from '@/types/workflow';

// Fuse.js configuration for workflow search
const fuseOptions: IFuseOptions<Workflow> = {
  keys: [
    {
      name: 'name',
      weight: 0.3
    },
    {
      name: 'filename',
      weight: 0.2
    },
    {
      name: 'nodes.type',
      weight: 0.2
    },
    {
      name: 'nodes.name',
      weight: 0.1
    },
    {
      name: 'tags',
      weight: 0.2
    }
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  useExtendedSearch: true
};

export class WorkflowSearch {
  private fuse: Fuse<Workflow>;
  private workflows: Workflow[];

  constructor(workflows: Workflow[]) {
    this.workflows = workflows;
    this.fuse = new Fuse(workflows, fuseOptions);
  }

  /**
   * Search workflows with filters and facets
   */
  search(query: string = '', filters: WorkflowFilter = {}): WorkflowSearchResult {
    let results = this.workflows;

    // Apply text search if query provided
    if (query.trim()) {
      const fuseResults = this.fuse.search(query);
      results = fuseResults.map(result => result.item);
    }

    // Apply filters
    results = this.applyFilters(results, filters);

    // Calculate facets for the filtered results
    const facets = this.calculateFacets(results);

    return {
      workflows: results,
      total: results.length,
      facets
    };
  }

  /**
   * Apply filters to workflow results
   */
  private applyFilters(workflows: Workflow[], filters: WorkflowFilter): Workflow[] {
    let filtered = workflows;

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(workflow => 
        workflow.nodes.some(node => 
          this.categorizeNodeType(node.type) === filters.category
        )
      );
    }

    // Trigger type filter
    if (filters.triggerType) {
      filtered = filtered.filter(workflow => {
        const triggerType = this.determineTriggerType(workflow.filename);
        return triggerType === filters.triggerType;
      });
    }

    // Active status filter
    if (filters.active !== undefined) {
      filtered = filtered.filter(workflow => workflow.active === filters.active);
    }

    // Node count filters
    if (filters.minNodes !== undefined) {
      filtered = filtered.filter(workflow => workflow.nodes.length >= filters.minNodes!);
    }

    if (filters.maxNodes !== undefined) {
      filtered = filtered.filter(workflow => workflow.nodes.length <= filters.maxNodes!);
    }

    // Credentials filter
    if (filters.hasCredentials !== undefined) {
      filtered = filtered.filter(workflow => {
        const hasCredentials = workflow.nodes.some(node => 
          node.credentials && Object.keys(node.credentials).length > 0
        );
        return hasCredentials === filters.hasCredentials;
      });
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(workflow => 
        filters.tags!.some(tag => workflow.tags?.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Calculate facets for search results
   */
  private calculateFacets(workflows: Workflow[]) {
    const categories: Record<string, number> = {};
    const triggerTypes: Record<string, number> = {};
    const activeStatus: Record<string, number> = { active: 0, inactive: 0 };
    
    let minNodes = Infinity;
    let maxNodes = 0;
    let totalNodes = 0;

    workflows.forEach(workflow => {
      // Category facets
      const workflowCategories = new Set<string>();
      workflow.nodes.forEach(node => {
        const category = this.categorizeNodeType(node.type);
        workflowCategories.add(category);
      });
      
      workflowCategories.forEach(category => {
        categories[category] = (categories[category] || 0) + 1;
      });

      // Trigger type facets
      const triggerType = this.determineTriggerType(workflow.filename);
      triggerTypes[triggerType] = (triggerTypes[triggerType] || 0) + 1;

      // Active status facets
      if (workflow.active) {
        activeStatus.active++;
      } else {
        activeStatus.inactive++;
      }

      // Node count facets
      const nodeCount = workflow.nodes.length;
      minNodes = Math.min(minNodes, nodeCount);
      maxNodes = Math.max(maxNodes, nodeCount);
      totalNodes += nodeCount;
    });

    return {
      categories,
      triggerTypes,
      activeStatus,
      nodeCount: {
        min: workflows.length > 0 ? minNodes : 0,
        max: maxNodes,
        avg: workflows.length > 0 ? Math.round(totalNodes / workflows.length) : 0
      }
    };
  }

  /**
   * Categorize node type (simplified version)
   */
  private categorizeNodeType(nodeType: string): string {
    const type = nodeType.toLowerCase();
    
    if (type.includes('trigger') || type.includes('webhook') || type.includes('cron')) {
      return 'Trigger';
    }
    if (type.includes('slack') || type.includes('email') || type.includes('telegram') || type.includes('discord')) {
      return 'Communication';
    }
    if (type.includes('mysql') || type.includes('postgres') || type.includes('mongo') || type.includes('redis')) {
      return 'Database';
    }
    if (type.includes('drive') || type.includes('dropbox') || type.includes('s3') || type.includes('storage')) {
      return 'Cloud Storage';
    }
    if (type.includes('hubspot') || type.includes('salesforce') || type.includes('pipedrive') || type.includes('crm')) {
      return 'CRM';
    }
    if (type.includes('analytics') || type.includes('mixpanel') || type.includes('segment')) {
      return 'Analytics';
    }
    if (type.includes('twitter') || type.includes('facebook') || type.includes('linkedin') || type.includes('social')) {
      return 'Social Media';
    }
    if (type.includes('notion') || type.includes('trello') || type.includes('asana') || type.includes('todo')) {
      return 'Productivity';
    }
    if (type.includes('shopify') || type.includes('stripe') || type.includes('paypal') || type.includes('commerce')) {
      return 'E-commerce';
    }
    if (type.includes('github') || type.includes('gitlab') || type.includes('jira') || type.includes('docker')) {
      return 'Development';
    }
    
    return 'Other';
  }

  /**
   * Determine trigger type from filename
   */
  private determineTriggerType(filename: string): 'webhook' | 'scheduled' | 'triggered' | 'manual' {
    const lower = filename.toLowerCase();
    if (lower.includes('webhook')) return 'webhook';
    if (lower.includes('scheduled') || lower.includes('cron')) return 'scheduled';
    if (lower.includes('triggered')) return 'triggered';
    return 'manual';
  }

  /**
   * Update search index with new workflows
   */
  updateIndex(workflows: Workflow[]): void {
    this.workflows = workflows;
    this.fuse = new Fuse(workflows, fuseOptions);
  }

  /**
   * Get suggested search terms based on content
   */
  getSuggestions(limit: number = 10): string[] {
    const suggestions = new Set<string>();
    
    // Add popular node types
    this.workflows.forEach(workflow => {
      workflow.nodes.forEach(node => {
        if (suggestions.size < limit) {
          suggestions.add(node.type);
        }
      });
    });

    // Add workflow names
    this.workflows.forEach(workflow => {
      if (suggestions.size < limit) {
        const words = workflow.name.split(' ').filter(word => word.length > 3);
        words.forEach(word => suggestions.add(word));
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }
} 