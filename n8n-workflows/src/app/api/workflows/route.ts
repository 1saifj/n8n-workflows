import { NextRequest, NextResponse } from 'next/server';
import { WorkflowLoader } from '@/lib/workflow-loader';
import { WorkflowSearch } from '@/lib/search';

// Cache for workflows data
let cachedWorkflows: any = null;
let workflowLoader: WorkflowLoader | null = null;
let workflowSearch: WorkflowSearch | null = null;

async function getWorkflows() {
  if (!cachedWorkflows || !workflowSearch) {
    workflowLoader = new WorkflowLoader('../../workflows');
    cachedWorkflows = await workflowLoader.loadWorkflows();
    workflowSearch = new WorkflowSearch(cachedWorkflows);
  }
  return { workflows: cachedWorkflows, search: workflowSearch };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const trigger = searchParams.get('trigger') || '';
    const active = searchParams.get('active') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { workflows, search } = await getWorkflows();

    let filteredWorkflows = workflows;

    // Apply search if query is provided
    if (query) {
      const searchResults = search.search(query);
      filteredWorkflows = searchResults.workflows;
    }

    // Apply filters
    if (category) {
      filteredWorkflows = filteredWorkflows.filter((workflow: any) =>
        workflow.tags?.includes(category)
      );
    }

    if (trigger) {
      filteredWorkflows = filteredWorkflows.filter((workflow: any) => {
        const filename = workflow.filename.toLowerCase();
        switch (trigger) {
          case 'webhook':
            return filename.includes('webhook');
          case 'scheduled':
            return filename.includes('scheduled') || filename.includes('cron');
          case 'triggered':
            return filename.includes('triggered');
          case 'manual':
            return !filename.includes('webhook') && !filename.includes('scheduled') && !filename.includes('triggered');
          default:
            return true;
        }
      });
    }

    if (active) {
      filteredWorkflows = filteredWorkflows.filter((workflow: any) =>
        workflow.active === (active === 'true')
      );
    }

    // Apply pagination
    const total = filteredWorkflows.length;
    const paginatedWorkflows = filteredWorkflows.slice(offset, offset + limit);

    // Calculate stats
    const stats = {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      categories: Array.from(new Set(workflows.flatMap((w: any) => w.tags || []))).length,
      activeCount: workflows.filter((w: any) => w.active).length,
      averageNodes: workflows.reduce((acc: number, w: any) => acc + w.nodes.length, 0) / workflows.length
    };

    return NextResponse.json({
      workflows: paginatedWorkflows,
      stats,
      success: true
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle workflow uploads or updates
  return NextResponse.json(
    { error: 'POST method not implemented yet' },
    { status: 501 }
  );
} 