import { cookies, headers } from 'next/headers';
import { get_session_user_async } from '@shared/auth/betterauth_adapter';

/**
 * get_current_user
 * Purpose: Server-side helper to get the current user (BetterAuth integration point with dev fallback).
 */
export async function get_current_user() {
  const request_headers = await headers();
  const cookie_store = await cookies();
  return get_session_user_async({ headers: request_headers, cookies: cookie_store });
}
