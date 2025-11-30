/**
 * tRPC Client for Client Components
 * Location: apps/web/lib/trpc_client.ts
 * Purpose: Provides tRPC hooks for use in 'use client' components
 */

'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@shared/schema/src/routers/root_router';

export const trpc = createTRPCReact<AppRouter>();
export type { AppRouter };
