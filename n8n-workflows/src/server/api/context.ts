import type { NextApiRequest, NextApiResponse } from 'next';
import { createDatabase } from '../../lib/db';

export function createTRPCContext({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
  const db = createDatabase();
  
  return {
    req,
    res,
    db,
  };
}

export type Context = ReturnType<typeof createTRPCContext>; 