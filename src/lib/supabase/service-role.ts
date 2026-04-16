import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ServiceRoleResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; reason: "missing_env" };

/**
 * Server-only elevated client (bypasses RLS). Does not throw — use for clearer errors in actions.
 */
export function getServiceRoleClient(): ServiceRoleResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, reason: "missing_env" };
  }
  return {
    ok: true,
    client: createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

/**
 * @deprecated Prefer getServiceRoleClient() to avoid uncaught throws in server actions.
 */
export function createServiceRoleClient(): SupabaseClient {
  const result = getServiceRoleClient();
  if (!result.ok) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return result.client;
}
