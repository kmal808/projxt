import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const hiProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const name = input.name || 'Projxt User';
    return {
      greeting: `Hello ${name}! Welcome to Projxt API`,
      date: new Date().toISOString(),
    };
  });