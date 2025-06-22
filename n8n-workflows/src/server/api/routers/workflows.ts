import { z } from 'zod';
import { eq, like, and, sql, count, desc } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { workflows } from '../../../lib/db/schema';

// Input validation schemas
const SearchInputSchema = z.object({
  query: z.string().default(''),
  triggerType: z.string().default('all'),
  complexity: z.string().default('all'), 
  activeOnly: z.boolean().default(false),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
});

const WorkflowDetailSchema = z.object({
  filename: z.string(),
});

const CategorySchema = z.object({
  category: z.string(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
});

// Helper function to parse workflow JSON fields
const parseWorkflowFields = (workflow: any) => {
  return {
    ...workflow,
    integrations: workflow.integrations ? 
      (typeof workflow.integrations === 'string' ? JSON.parse(workflow.integrations) : workflow.integrations) : [],
    tags: workflow.tags ? 
      (typeof workflow.tags === 'string' ? JSON.parse(workflow.tags) : workflow.tags) : [],
  };
};

export const workflowsRouter = createTRPCRouter({
  // GET /api/stats - Get workflow database statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    try {
      // Get basic counts using raw SQL for reliability
      const totalResult = await db.all(sql`SELECT COUNT(*) as count FROM workflows`);
      const total = totalResult[0]?.count || 0;
      
      const activeResult = await db.all(sql`SELECT COUNT(*) as count FROM workflows WHERE active = 1`);
      const active = activeResult[0]?.count || 0;
      
      const inactive = total - active;
      
      return {
        total,
        active,
        inactive,
        triggers: {},
        complexity: {},
        totalNodes: 0,
        uniqueIntegrations: 0,
        lastIndexed: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch workflow statistics');
    }
  }),
  
  // GET /api/workflows - Search and filter workflows with pagination
  searchWorkflows: publicProcedure
    .input(SearchInputSchema)
    .query(async ({ input, ctx }) => {
      const { query, triggerType, complexity, activeOnly, page, perPage } = input;
      const { db } = ctx;
      
      try {
        const offset = (page - 1) * perPage;
        
        // Build where conditions
        const conditions = [];
        
        if (activeOnly) {
          conditions.push(eq(workflows.active, true));
        }
        
        if (triggerType !== 'all') {
          conditions.push(eq(workflows.triggerType, triggerType));
        }
        
        if (complexity !== 'all') {
          conditions.push(eq(workflows.complexity, complexity));
        }
        
        // Handle search query with LIKE for now
        if (query) {
          const searchCondition = sql`(
            ${workflows.name} LIKE ${`%${query}%`} OR 
            ${workflows.description} LIKE ${`%${query}%`} OR 
            ${workflows.integrations} LIKE ${`%${query}%`} OR
            ${workflows.filename} LIKE ${`%${query}%`}
          )`;
          conditions.push(searchCondition);
        }
        
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        // Get paginated results
        const workflowResults = await db
          .select()
          .from(workflows)
          .where(whereClause)
          .orderBy(desc(workflows.analyzedAt))
          .limit(perPage)
          .offset(offset);
        
        const parsedWorkflows = workflowResults.map(parseWorkflowFields);
        const total = parsedWorkflows.length; // Simplified for now
        const pages = Math.ceil(total / perPage);
        
        return {
          workflows: parsedWorkflows,
          total,
          page,
          perPage,
          pages,
          query,
          filters: {
            triggerType,
            complexity,
            activeOnly,
          },
        };
      } catch (error) {
        console.error('Error searching workflows:', error);
        throw new Error('Failed to search workflows');
      }
    }),
  
  // GET /api/workflows/{filename} - Get detailed workflow information
  getWorkflowDetail: publicProcedure
    .input(WorkflowDetailSchema)
    .query(async ({ input, ctx }) => {
      const { filename } = input;
      const { db } = ctx;
      
      try {
        const [workflow] = await db
          .select()
          .from(workflows)
          .where(eq(workflows.filename, filename));
        
        if (!workflow) {
          throw new Error('Workflow not found');
        }
        
        return parseWorkflowFields(workflow);
      } catch (error) {
        console.error('Error fetching workflow detail:', error);
        throw new Error('Failed to fetch workflow details');
      }
    }),
  
  // GET /api/integrations - Get all unique integrations
  getIntegrations: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    try {
      const allWorkflows = await db.select({ integrations: workflows.integrations }).from(workflows);
      const integrationCounts = new Map<string, number>();
      
      allWorkflows.forEach(w => {
        if (w.integrations) {
          try {
            const integrations = typeof w.integrations === 'string' ? 
              JSON.parse(w.integrations) : w.integrations;
            integrations.forEach((int: string) => {
              integrationCounts.set(int, (integrationCounts.get(int) || 0) + 1);
            });
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
      
      return Array.from(integrationCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw new Error('Failed to fetch integrations');
    }
  }),
  
  // GET /api/categories - Get service categories (placeholder)
  getCategories: publicProcedure.query(async () => {
    // This would be implemented based on the Python categorization logic
    return {
      'Communication': ['Slack', 'Discord', 'Telegram', 'Email'],
      'Productivity': ['Google Sheets', 'Notion', 'Airtable'],
      'Development': ['GitHub', 'GitLab', 'Jira'],
      'Analytics': ['Google Analytics', 'Mixpanel'],
      'Marketing': ['HubSpot', 'Mailchimp'],
      'Storage': ['Google Drive', 'Dropbox', 'AWS S3'],
      'Payment': ['Stripe', 'PayPal'],
      'Social Media': ['Twitter', 'LinkedIn', 'Facebook'],
      'CRM': ['Salesforce', 'Pipedrive'],
      'E-commerce': ['Shopify', 'WooCommerce'],
      'Monitoring': ['PagerDuty', 'Datadog'],
      'Other': []
    };
  }),
  
  // GET /api/workflows/category/{category} - Search workflows by category
  searchByCategory: publicProcedure
    .input(CategorySchema)
    .query(async ({ input, ctx }) => {
      const { category, page, perPage } = input;
      const { db } = ctx;
      
      try {
        const offset = (page - 1) * perPage;
        
        // Search for workflows that contain integrations in this category
        const searchCondition = like(workflows.integrations, `%${category}%`);
        
        const [totalResult] = await db
          .select({ count: count(workflows.id) })
          .from(workflows)
          .where(searchCondition);
        const total = totalResult?.count || 0;
        
        const workflowResults = await db
          .select()
          .from(workflows)
          .where(searchCondition)
          .orderBy(desc(workflows.analyzedAt))
          .limit(perPage)
          .offset(offset);
        
        const parsedWorkflows = workflowResults.map(parseWorkflowFields);
        const pages = Math.ceil(total / perPage);
        
        return {
          workflows: parsedWorkflows,
          total,
          page,
          perPage,
          pages,
          query: category,
          filters: {
            category,
          },
        };
      } catch (error) {
        console.error('Error searching by category:', error);
        throw new Error('Failed to search workflows by category');
      }
    }),
}); 