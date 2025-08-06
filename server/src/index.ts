
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createExtensionInputSchema, 
  bulkCreateMonthlyInstallsInputSchema,
  getExtensionByIdInputSchema,
  getExtensionByNameInputSchema
} from './schema';

// Import handlers
import { getExtensions } from './handlers/get_extensions';
import { getExtensionById } from './handlers/get_extension_by_id';
import { getExtensionByName } from './handlers/get_extension_by_name';
import { createExtension } from './handlers/create_extension';
import { createMonthlyInstalls } from './handlers/create_monthly_installs';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Get all extensions with install data for dashboard
  getExtensions: publicProcedure
    .query(() => getExtensions()),
  
  // Get specific extension by ID for modal/detail view
  getExtensionById: publicProcedure
    .input(getExtensionByIdInputSchema)
    .query(({ input }) => getExtensionById(input)),
  
  // Get specific extension by name for SEO-friendly URLs
  getExtensionByName: publicProcedure
    .input(getExtensionByNameInputSchema)
    .query(({ input }) => getExtensionByName(input)),
  
  // Create new extension
  createExtension: publicProcedure
    .input(createExtensionInputSchema)
    .mutation(({ input }) => createExtension(input)),
  
  // Bulk create monthly install data from TSV
  createMonthlyInstalls: publicProcedure
    .input(bulkCreateMonthlyInstallsInputSchema)
    .mutation(({ input }) => createMonthlyInstalls(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
