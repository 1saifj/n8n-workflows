import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Cloudflare D1 types
type D1Database = import('@cloudflare/workers-types').D1Database;

// Database connection factory
export function createDatabase(env?: { DB?: D1Database }) {
  if (env?.DB) {
    // Cloudflare D1 database (production/preview)
    return drizzleD1(env.DB, { schema });
  } else {
    // Local SQLite database (development)
    const sqlite = new Database('local.db');
    
    // Enable WAL mode for better performance
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = NORMAL');
    sqlite.pragma('cache_size = 10000');
    sqlite.pragma('temp_store = MEMORY');
    
    return drizzle(sqlite, { schema });
  }
}

// Database type
export type Database = ReturnType<typeof createDatabase>;

// Export schema for easy access
export { schema };
export * from './schema';

// FTS5 setup utilities (since Drizzle doesn't support FTS5 natively)
export const ftsSetupSQL = `
  -- Create FTS5 virtual table
  CREATE VIRTUAL TABLE IF NOT EXISTS workflows_fts USING fts5(
    filename,
    name,
    description,
    integrations,
    tags,
    content=workflows,
    content_rowid=id
  );

  -- Create triggers to keep FTS table in sync
  CREATE TRIGGER IF NOT EXISTS workflows_ai AFTER INSERT ON workflows BEGIN
    INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
    VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS workflows_ad AFTER DELETE ON workflows BEGIN
    INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
    VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS workflows_au AFTER UPDATE ON workflows BEGIN
    INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
    VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
    INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
    VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
  END;
`;

// Helper function to setup FTS5 tables and triggers
export function setupFTS5(db: Database) {
  if ('run' in db) {
    // Local SQLite
    (db as any).run(ftsSetupSQL);
  } else {
    // D1 - will be handled in migrations
    console.log('FTS5 setup should be done via migrations for D1');
  }
}

// Helper function to parse JSON fields
export function parseWorkflowFields(workflow: schema.Workflow): schema.WorkflowWithParsedFields {
  return {
    ...workflow,
    integrations: workflow.integrations ? JSON.parse(workflow.integrations) : [],
    tags: workflow.tags ? JSON.parse(workflow.tags) : [],
  };
}

// Helper function to stringify JSON fields for insertion
export function stringifyWorkflowFields(workflow: Partial<schema.WorkflowWithParsedFields>): Partial<schema.NewWorkflow> {
  const { integrations, tags, ...rest } = workflow;
  return {
    ...rest,
    integrations: integrations ? JSON.stringify(integrations) : undefined,
    tags: tags ? JSON.stringify(tags) : undefined,
  };
} 