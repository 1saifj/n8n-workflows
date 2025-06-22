import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware for logging (optional)
const loggerMiddleware = t.middleware(({ path, type, next }) => {
  const start = Date.now();
  const result = next();
  
  result.then((res) => {
    const durationMs = Date.now() - start;
    const meta = { path, type, durationMs };
    
    if (res.ok) {
      console.log('TRPC OK:', meta);
    } else {
      console.error('TRPC ERROR:', meta, res.error);
    }
  });
  
  return result;
});

// Procedure with logging
export const loggedProcedure = publicProcedure.use(loggerMiddleware); 