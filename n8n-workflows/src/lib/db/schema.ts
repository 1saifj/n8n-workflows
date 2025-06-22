import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Main workflows table matching the Python schema
export const workflows = sqliteTable(
  'workflows',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    filename: text('filename').notNull().unique(),
    name: text('name').notNull(),
    workflowId: text('workflow_id'),
    active: integer('active', { mode: 'boolean' }).default(false),
    description: text('description'),
    triggerType: text('trigger_type'),
    complexity: text('complexity'),
    nodeCount: integer('node_count').default(0),
    integrations: text('integrations'), // JSON array stored as text
    tags: text('tags'), // JSON array stored as text
    createdAt: text('created_at'),
    updatedAt: text('updated_at'),
    fileHash: text('file_hash'),
    fileSize: integer('file_size'),
    analyzedAt: text('analyzed_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    triggerTypeIdx: index('idx_trigger_type').on(table.triggerType),
    complexityIdx: index('idx_complexity').on(table.complexity),
    activeIdx: index('idx_active').on(table.active),
    nodeCountIdx: index('idx_node_count').on(table.nodeCount),
    filenameIdx: index('idx_filename').on(table.filename),
  })
);

// FTS5 virtual table for full-text search
// Note: Drizzle doesn't have native FTS5 support, so we'll handle this with raw SQL
export const workflowsFts = sqliteTable('workflows_fts', {
  rowid: integer('rowid').primaryKey(),
  filename: text('filename'),
  name: text('name'),
  description: text('description'),
  integrations: text('integrations'),
  tags: text('tags'),
});

// Additional analytics tables for future features
export const workflowStats = sqliteTable('workflow_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workflowId: integer('workflow_id').notNull(),
  views: integer('views').default(0),
  downloads: integer('downloads').default(0),
  lastAccessed: text('last_accessed').default(sql`CURRENT_TIMESTAMP`),
});

// User preferences table for future features
export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  savedSearches: text('saved_searches'), // JSON array
  bookmarks: text('bookmarks'), // JSON array
  theme: text('theme').default('light'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Type definitions for TypeScript
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowStat = typeof workflowStats.$inferSelect;
export type NewWorkflowStat = typeof workflowStats.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

// Helper types for the frontend
export interface WorkflowWithParsedFields extends Omit<Workflow, 'integrations' | 'tags'> {
  integrations: string[];
  tags: string[];
}

export interface WorkflowSearchFilters {
  query?: string;
  triggerType?: string;
  complexity?: string;
  activeOnly?: boolean;
  category?: string;
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface SearchResponse {
  workflows: WorkflowWithParsedFields[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
  query: string;
  filters: WorkflowSearchFilters;
}

export interface StatsResponse {
  total: number;
  active: number;
  inactive: number;
  triggers: Record<string, number>;
  complexity: Record<string, number>;
  totalNodes: number;
  uniqueIntegrations: number;
  lastIndexed: string;
} 