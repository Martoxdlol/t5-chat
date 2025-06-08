import { publicProcedure, router } from '../trpc';

export const appRouter = router({
    hello: publicProcedure.query(() => {
        return 'Hello from tRPC!';
    }),
});


export type AppRouter = typeof appRouter;