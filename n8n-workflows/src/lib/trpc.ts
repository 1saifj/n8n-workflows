import { useQuery } from '@tanstack/react-query';

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3001}`; // dev SSR should use localhost
}

// Helper function to make tRPC calls
async function trpcCall(procedure: string, input?: any) {
  const url = `${getBaseUrl()}/api/trpc/${procedure}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: input || {} }),
  });
  
  if (!response.ok) {
    throw new Error(`tRPC call failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.result?.data || data;
}

// React Query-based tRPC client
export const trpc = {
  workflows: {
    getAll: (input?: any) => useQuery({
      queryKey: ['workflows.getAll', input],
      queryFn: () => trpcCall('workflows.getAll', input),
    }),
    getStats: () => useQuery({
      queryKey: ['workflows.getStats'],
      queryFn: () => trpcCall('workflows.getStats'),
    }),
    searchWorkflows: (input: any) => useQuery({
      queryKey: ['workflows.searchWorkflows', input],
      queryFn: () => trpcCall('workflows.searchWorkflows', input),
      enabled: !!input,
    }),
    getWorkflowDetail: (input: { filename: string }) => useQuery({
      queryKey: ['workflows.getWorkflowDetail', input],
      queryFn: () => trpcCall('workflows.getWorkflowDetail', input),
      enabled: !!input.filename,
    }),
    getIntegrations: () => useQuery({
      queryKey: ['workflows.getIntegrations'],
      queryFn: () => trpcCall('workflows.getIntegrations'),
    }),
    getByCategory: (input: any) => useQuery({
      queryKey: ['workflows.getByCategory', input],
      queryFn: () => trpcCall('workflows.getByCategory', input),
      enabled: !!input?.category,
    }),
  },
}; 