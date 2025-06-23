import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { workflows } from '../src/lib/db/schema';
import crypto from 'crypto';

// Database setup
const sqlite = new Database('./local.db');
const db = drizzle(sqlite);

interface N8nWorkflow {
  id?: string;
  name?: string;
  nodes?: Array<{
    name: string;
    type: string;
    parameters?: any;
    credentials?: any;
    typeVersion?: number;
  }>;
  active?: boolean;
  tags?: string[];
  meta?: {
    instanceId?: string;
    templateCredsSetupCompleted?: boolean;
  };
  settings?: {
    executionOrder?: string;
  };
  connections?: any;
  versionId?: string;
  pinData?: any;
}

// Extract integrations from node types
function extractIntegrations(nodes: N8nWorkflow['nodes'] = []): string[] {
  const integrations = new Set<string>();
  
  nodes.forEach(node => {
    if (node.type) {
      // Extract service name from node type
      const parts = node.type.split('.');
      let serviceName = '';
      
      if (parts.length > 1) {
        // Handle n8n-nodes-base.serviceName format
        serviceName = parts[parts.length - 1];
      } else if (node.type.includes('-')) {
        // Handle service-name format
        serviceName = node.type.split('-').pop() || '';
      } else {
        serviceName = node.type;
      }
      
      // Clean up and normalize service names
      serviceName = serviceName
        .replace(/([A-Z])/g, ' $1') // Split camelCase
        .replace(/^\\s+/, '') // Remove leading space
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Filter out generic n8n nodes
      if (!['manualTrigger', 'set', 'if', 'function', 'functionItem', 'merge', 'split', 'noOp', 'webhook', 'cron', 'interval', 'wait', 'datetime', 'code', 'xml', 'json', 'html', 'markdown', 'crypto', 'executeCommand', 'readBinaryFile', 'writeBinaryFile', 'readBinaryFiles', 'spreadsheetFile', 'editImage', 'respondToWebhook', 'httpRequest', 'moveFiles', 'compress', 'start', 'stopAndError', 'error'].includes(serviceName.toLowerCase().replace(/\\s/g, ''))) {
        integrations.add(serviceName);
      }
    }
  });
  
  return Array.from(integrations);
}

// Determine trigger type from nodes
function getTriggerType(nodes: N8nWorkflow['nodes'] = []): string {
  const triggerNodes = nodes.filter(node => 
    node.type.includes('trigger') || 
    node.type.includes('webhook') ||
    node.type.includes('cron') ||
    node.type.includes('schedule') ||
    node.type.includes('interval') ||
    node.type.includes('manual')
  );
  
  if (triggerNodes.length === 0) return 'manual';
  
  const triggerNode = triggerNodes[0];
  const nodeType = triggerNode.type.toLowerCase();
  
  if (nodeType.includes('manual')) return 'manual';
  if (nodeType.includes('webhook')) return 'webhook';
  if (nodeType.includes('cron') || nodeType.includes('schedule') || nodeType.includes('interval')) return 'scheduled';
  if (nodeType.includes('poll')) return 'polling';
  
  return 'manual';
}

// Determine complexity based on node count and connections
function getComplexity(nodeCount: number, hasConnections: boolean = false): string {
  if (nodeCount <= 3) return 'simple';
  if (nodeCount <= 8) return 'medium';
  return 'complex';
}

// Extract tags from filename
function extractTagsFromFilename(filename: string): string[] {
  const tags: string[] = [];
  const name = filename.replace('.json', '');
  
  // Extract trigger type from filename
  if (name.includes('Scheduled')) tags.push('scheduled');
  if (name.includes('Triggered')) tags.push('triggered');  
  if (name.includes('Manual')) tags.push('manual');
  if (name.includes('Webhook')) tags.push('webhook');
  if (name.includes('Automate') || name.includes('Automation')) tags.push('automation');
  if (name.includes('Monitor')) tags.push('monitoring');
  if (name.includes('Create')) tags.push('creation');
  if (name.includes('Update')) tags.push('update');
  if (name.includes('Send')) tags.push('notification');
  if (name.includes('Import')) tags.push('import');
  if (name.includes('Export')) tags.push('export');
  if (name.includes('Process')) tags.push('processing');
  if (name.includes('Sync')) tags.push('sync');
  
  return tags;
}

// Generate readable name from filename
function generateWorkflowName(filename: string, workflowData: N8nWorkflow): string {
  // Use the name from the workflow data if available
  if (workflowData.name && workflowData.name.trim() !== '') {
    return workflowData.name.trim();
  }
  
  // Extract from filename
  const name = filename.replace('.json', '').replace(/^\\d+_/, '');
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate description based on workflow analysis
function generateDescription(workflowName: string, integrations: string[], triggerType: string): string {
  const integrationsText = integrations.length > 0 ? integrations.slice(0, 3).join(', ') : 'various services';
  const trigger = triggerType === 'manual' ? 'manually triggered' : `${triggerType} trigger`;
  
  return `Workflow automating ${integrationsText} with ${trigger}. ${workflowName} integration.`;
}

async function importWorkflows() {
  console.log('🚀 Starting workflow import process...');
  
  const workflowsDir = '../workflows';
  const files = readdirSync(workflowsDir).filter(file => file.endsWith('.json'));
  
  console.log(`📁 Found ${files.length} workflow files to process`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  // Clear existing data (except our sample data for now)
  console.log('🗑️ Clearing existing workflow data...');
  await db.delete(workflows);
  
  for (const file of files) {
    try {
      const filePath = join(workflowsDir, file);
      const fileStats = statSync(filePath);
      const fileContent = readFileSync(filePath, 'utf8');
      const workflowData: N8nWorkflow = JSON.parse(fileContent);
      
      // Extract workflow information
      const integrations = extractIntegrations(workflowData.nodes);
      const triggerType = getTriggerType(workflowData.nodes);
      const nodeCount = workflowData.nodes?.length || 0;
      const complexity = getComplexity(nodeCount, !!workflowData.connections);
      const tags = [...extractTagsFromFilename(file), ...(workflowData.tags || [])];
      const workflowName = generateWorkflowName(file, workflowData);
      const description = generateDescription(workflowName, integrations, triggerType);
      
      // Generate file hash for change detection
      const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      
      // Insert into database
      await db.insert(workflows).values({
        filename: file,
        name: workflowName,
        workflowId: workflowData.id || file.replace('.json', ''),
        active: workflowData.active !== false, // Default to true if not specified
        description: description,
        triggerType: triggerType,
        complexity: complexity,
        nodeCount: nodeCount,
        integrations: JSON.stringify(integrations),
        tags: JSON.stringify(tags),
        fileHash: fileHash,
        fileSize: fileStats.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString()
      });
      
      successCount++;
      
      if (successCount % 100 === 0) {
        console.log(`✅ Processed ${successCount} workflows...`);
      }
      
    } catch (error) {
      errorCount++;
      const errorMessage = `Failed to process ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      console.error(`❌ ${errorMessage}`);
    }
  }
  
  console.log('\\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} workflows`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\\n🔍 Error details:');
    errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
  }
  
  // Display some statistics
  console.log('\\n📈 Database Statistics:');
  const totalWorkflows = await db.select().from(workflows);
  console.log(`Total workflows in database: ${totalWorkflows.length}`);
  
  const activeCount = totalWorkflows.filter(w => w.active).length;
  console.log(`Active workflows: ${activeCount}`);
  console.log(`Inactive workflows: ${totalWorkflows.length - activeCount}`);
  
  // Count by trigger type
  const triggerStats = totalWorkflows.reduce((acc, w) => {
    const triggerType = w.triggerType || 'unknown';
    acc[triggerType] = (acc[triggerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('Trigger types:', triggerStats);
  
  // Count by complexity
  const complexityStats = totalWorkflows.reduce((acc, w) => {
    const complexity = w.complexity || 'unknown';
    acc[complexity] = (acc[complexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('Complexity distribution:', complexityStats);
  
  console.log('\\n🎉 Import process completed!');
}

// Run the import
importWorkflows().catch(console.error); 