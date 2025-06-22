import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
// import type { AppRouter } from '../server/api/router';

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3001}`; // dev SSR should use localhost
}

// TODO: Fix tRPC client configuration
// export const trpc = createTRPCNext<AppRouter>({
//   config() {
//     return {
//       transformer: superjson,
//       links: [
//         httpBatchLink({
//           url: `${getBaseUrl()}/api/trpc`,
//         }),
//       ],
//     };
//   },
//   ssr: false,
// });

// Temporary stub for development
export const trpc = {
  workflows: {
    getStats: () => ({ data: null, isLoading: false, error: null }),
    searchWorkflows: () => ({ data: null, isLoading: false, error: null }),
    getWorkflowDetail: () => ({ data: null, isLoading: false, error: null }),
    getIntegrations: () => ({ data: null, isLoading: false, error: null }),
  }
}; 