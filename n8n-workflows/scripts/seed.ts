import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { workflows } from '../src/lib/db/schema';
import fs from 'fs';
import path from 'path';

// Create database connection
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

// Sample workflow data for testing
const sampleWorkflows = [
  {
    filename: 'sample_slack_notification.json',
    name: 'Slack Notification Workflow',
    workflowId: 'wf_001',
    active: true,
    description: 'Send automated notifications to Slack channels',
    triggerType: 'scheduled',
    complexity: 'simple',
    nodeCount: 3,
    integrations: JSON.stringify(['Slack', 'HTTP']),
    tags: JSON.stringify(['notification', 'communication']),
    createdAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
  },
  {
    filename: 'github_issue_tracker.json',
    name: 'GitHub Issue Tracker',
    workflowId: 'wf_002', 
    active: true,
    description: 'Track and process GitHub issues automatically',
    triggerType: 'webhook',
    complexity: 'medium',
    nodeCount: 7,
    integrations: JSON.stringify(['GitHub', 'Slack', 'Google Sheets']),
    tags: JSON.stringify(['github', 'automation', 'tracking']),
    createdAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
  },
  {
    filename: 'data_backup_workflow.json',
    name: 'Automated Data Backup',
    workflowId: 'wf_003',
    active: false,
    description: 'Backup critical data to multiple cloud storage providers',
    triggerType: 'scheduled',
    complexity: 'complex',
    nodeCount: 12,
    integrations: JSON.stringify(['Google Drive', 'Dropbox', 'AWS S3', 'Email']),
    tags: JSON.stringify(['backup', 'storage', 'automation']),
    createdAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
  },
  {
    filename: 'social_media_monitor.json',
    name: 'Social Media Monitor',
    workflowId: 'wf_004',
    active: true,
    description: 'Monitor social media mentions and respond automatically',
    triggerType: 'polling',
    complexity: 'medium',
    nodeCount: 8,
    integrations: JSON.stringify(['Twitter', 'Discord', 'Telegram', 'Slack']),
    tags: JSON.stringify(['social', 'monitoring', 'automation']),
    createdAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
  },
  {
    filename: 'ecommerce_order_processor.json',
    name: 'E-commerce Order Processor',
    workflowId: 'wf_005',
    active: true,
    description: 'Process e-commerce orders and update inventory',
    triggerType: 'webhook',
    complexity: 'complex',
    nodeCount: 15,
    integrations: JSON.stringify(['Shopify', 'Stripe', 'Gmail', 'Google Sheets', 'Slack']),
    tags: JSON.stringify(['ecommerce', 'orders', 'inventory']),
    createdAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('Clearing existing workflows...');
    await db.delete(workflows);
    
    // Insert sample data
    console.log('Inserting sample workflows...');
    await db.insert(workflows).values(sampleWorkflows);
    
    console.log(`✅ Successfully seeded ${sampleWorkflows.length} workflows`);
    console.log('Sample workflows:');
    sampleWorkflows.forEach((wf, index) => {
      console.log(`  ${index + 1}. ${wf.name} (${wf.complexity}, ${wf.nodeCount} nodes)`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

seed(); 