import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Health check endpoint
app.get('/', (c) => c.text('Projxt API is running'));

// tRPC endpoint
app.all('/api/trpc/*', async (c) => {
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Start the server if this file is run directly
if (typeof require !== 'undefined' && require.main === module) {
  const { serve } = require('@hono/node-server');
  serve({
    fetch: app.fetch,
    port: 3000,
  });
  console.log('Server is running on http://localhost:3000');
}

export default app;