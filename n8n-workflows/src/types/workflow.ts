// N8N Workflow Types
export interface WorkflowNode {
  id: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
  name?: string;
  executeOnce?: boolean;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  onError?: string;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
}

export interface WorkflowConnection {
  [outputIndex: string]: Array<{
    node: string;
    type: string;
    index: number;
  }>;
}

export interface WorkflowConnections {
  [nodeId: string]: WorkflowConnection;
}

export interface Workflow {
  id: number;
  filename: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  tags?: string[];
  pinData?: Record<string, any>;
  settings?: {
    executionOrder?: string;
    saveManualExecutions?: boolean;
    callerPolicy?: string;
    errorWorkflow?: string;
    timezone?: string;
  };
  staticData?: Record<string, any>;
  versionId?: string;
  meta?: {
    templateCredsSetupCompleted?: boolean;
    instanceId?: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
  triggerCount: number;
  regularNodeCount: number;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalNodes: number;
  uniqueNodeTypes: number;
  categoryStats: Record<string, number>;
  triggerTypeStats: Record<string, number>;
  averageComplexity: number;
}

export interface WorkflowFilter {
  search?: string;
  category?: string;
  triggerType?: 'webhook' | 'scheduled' | 'triggered' | 'manual';
  active?: boolean;
  minNodes?: number;
  maxNodes?: number;
  hasCredentials?: boolean;
  tags?: string[];
}

export interface WorkflowSearchResult {
  workflows: Workflow[];
  total: number;
  facets: {
    categories: Record<string, number>;
    triggerTypes: Record<string, number>;
    activeStatus: Record<string, number>;
    nodeCount: {
      min: number;
      max: number;
      avg: number;
    };
  };
}

// Node type categories based on the original Python categorization
export const NODE_CATEGORIES = {
  'Trigger': ['Manual Trigger', 'Webhook', 'Cron', 'Interval', 'HTTP Request'],
  'Communication': ['Email', 'Slack', 'Discord', 'Telegram', 'Mattermost', 'SMS'],
  'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis'],
  'Cloud Storage': ['Google Drive', 'Dropbox', 'AWS S3', 'OneDrive', 'Box'],
  'CRM': ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Copper'],
  'Analytics': ['Google Analytics', 'Mixpanel', 'Segment', 'Amplitude'],
  'Social Media': ['Twitter', 'Facebook', 'LinkedIn', 'Instagram', 'YouTube'],
  'Productivity': ['Notion', 'Trello', 'Asana', 'Todoist', 'ClickUp'],
  'E-commerce': ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Magento'],
  'Development': ['GitHub', 'GitLab', 'Jira', 'Jenkins', 'Docker'],
  'Other': []
} as const;

export type NodeCategory = keyof typeof NODE_CATEGORIES; 