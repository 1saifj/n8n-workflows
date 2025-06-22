import type { Workflow, WorkflowNode, WorkflowStats, NodeCategory } from '@/types/workflow';
import { NODE_CATEGORIES } from '@/types/workflow';
import fs from 'fs';
import path from 'path';

// Workflow data loader
export class WorkflowLoader {
  private workflowsDir: string;
  private cachedWorkflows: Workflow[] | null = null;

  constructor(workflowsDir: string = '../workflows') {
    this.workflowsDir = workflowsDir;
  }

  /**
   * Load all workflows from JSON files
   */
  async loadWorkflows(): Promise<Workflow[]> {
    if (this.cachedWorkflows) {
      return this.cachedWorkflows;
    }

    const workflowsPath = path.resolve(process.cwd(), this.workflowsDir);
    
    if (!fs.existsSync(workflowsPath)) {
      console.warn(`Workflows directory not found: ${workflowsPath}`);
      return [];
    }

    const files = fs.readdirSync(workflowsPath)
      .filter(file => file.endsWith('.json'))
      .sort();

    const workflows: Workflow[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(workflowsPath, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const workflowData = JSON.parse(rawData);

        const workflow = this.processWorkflowData(workflowData, file);
        if (workflow) {
          workflows.push(workflow);
        }
      } catch (error) {
        console.error(`Error loading workflow ${file}:`, error);
      }
    }

    this.cachedWorkflows = workflows;
    return workflows;
  }

  /**
   * Process raw workflow data into our typed format
   */
  private processWorkflowData(data: any, filename: string): Workflow | null {
    try {
      const nodes = data.nodes || [];
      const connections = data.connections || {};

      // Count trigger and regular nodes
      const triggerCount = nodes.filter((node: any) => 
        this.isTriggerNode(node.type)
      ).length;
      
      const regularNodeCount = nodes.length - triggerCount;

      // Determine if workflow is active (based on naming convention)
      const active = this.determineActiveStatus(filename, data);

      return {
        id: this.extractIdFromFilename(filename),
        filename,
        name: data.name || this.extractNameFromFilename(filename),
        nodes: nodes.map(this.processNode),
        connections,
        tags: data.tags || [],
        pinData: data.pinData,
        settings: data.settings,
        staticData: data.staticData,
        versionId: data.versionId,
        meta: data.meta,
        active,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        triggerCount,
        regularNodeCount
      };
    } catch (error) {
      console.error(`Error processing workflow data for ${filename}:`, error);
      return null;
    }
  }

  /**
   * Process individual node data
   */
  private processNode(node: any): WorkflowNode {
    return {
      id: node.id,
      type: node.type,
      typeVersion: node.typeVersion || 1,
      position: node.position || [0, 0],
      parameters: node.parameters,
      credentials: node.credentials,
      name: node.name,
      executeOnce: node.executeOnce,
      continueOnFail: node.continueOnFail,
      alwaysOutputData: node.alwaysOutputData,
      onError: node.onError,
      retryOnFail: node.retryOnFail,
      maxTries: node.maxTries,
      waitBetweenTries: node.waitBetweenTries
    };
  }

  /**
   * Extract workflow ID from filename
   */
  private extractIdFromFilename(filename: string): number {
    const match = filename.match(/^(\d+)_/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Extract workflow name from filename
   */
  private extractNameFromFilename(filename: string): string {
    return filename
      .replace(/^\d+_/, '')
      .replace(/\.json$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Determine if workflow is active based on filename patterns
   */
  private determineActiveStatus(filename: string, data: any): boolean {
    if (data.active !== undefined) {
      return data.active;
    }
    
    // Based on original logic: workflows with certain patterns are considered active
    const lowerFilename = filename.toLowerCase();
    return !lowerFilename.includes('manual') || 
           lowerFilename.includes('scheduled') ||
           lowerFilename.includes('webhook');
  }

  /**
   * Check if a node type is a trigger
   */
  private isTriggerNode(nodeType: string): boolean {
    const triggerTypes = [
      'Manual Trigger', 'Webhook', 'Cron', 'Interval', 'HTTP Request',
      'manualTrigger', 'webhook', 'cron', 'interval', 'httpRequest'
    ];
    return triggerTypes.includes(nodeType);
  }

  /**
   * Categorize a node type
   */
  categorizeNode(nodeType: string): NodeCategory {
    for (const [category, types] of Object.entries(NODE_CATEGORIES)) {
      if (types.some(type => 
        nodeType.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(nodeType.toLowerCase())
      )) {
        return category as NodeCategory;
      }
    }
    return 'Other';
  }

  /**
   * Calculate workflow statistics
   */
  calculateStats(workflows: Workflow[]): WorkflowStats {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.active).length;
    const totalNodes = workflows.reduce((sum, w) => sum + w.nodes.length, 0);
    
    const uniqueNodeTypes = new Set();
    const categoryStats: Record<string, number> = {};
    const triggerTypeStats: Record<string, number> = {};

    workflows.forEach(workflow => {
      workflow.nodes.forEach(node => {
        uniqueNodeTypes.add(node.type);
        
        const category = this.categorizeNode(node.type);
        categoryStats[category] = (categoryStats[category] || 0) + 1;

        if (this.isTriggerNode(node.type)) {
          const triggerType = this.determineTriggerType(workflow.filename);
          triggerTypeStats[triggerType] = (triggerTypeStats[triggerType] || 0) + 1;
        }
      });
    });

    return {
      totalWorkflows,
      activeWorkflows,
      totalNodes,
      uniqueNodeTypes: uniqueNodeTypes.size,
      categoryStats,
      triggerTypeStats,
      averageComplexity: totalNodes / totalWorkflows
    };
  }

  /**
   * Determine trigger type from filename
   */
  private determineTriggerType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('webhook')) return 'webhook';
    if (lower.includes('scheduled') || lower.includes('cron')) return 'scheduled';
    if (lower.includes('triggered')) return 'triggered';
    return 'manual';
  }

  /**
   * Search workflows with fuzzy matching
   */
  searchWorkflows(workflows: Workflow[], query: string): Workflow[] {
    if (!query.trim()) return workflows;

    const searchTerm = query.toLowerCase();
    return workflows.filter(workflow => {
      // Search in name, filename, and node types
      const searchableText = [
        workflow.name,
        workflow.filename,
        ...workflow.nodes.map(node => node.type)
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }

  /**
   * Clear cache to force reload
   */
  clearCache(): void {
    this.cachedWorkflows = null;
  }
} 