import { createTRPCRouter } from './trpc';
import { workflowsRouter } from './routers/workflows';

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
});

export type AppRouter = typeof appRouter; 