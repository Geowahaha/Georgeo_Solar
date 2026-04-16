import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Total lead rows (quote requests) for public marketing copy.
 * Server-only; uses service role to bypass RLS (anon cannot read leads).
 */
export async function getPublicLeadCount(): Promise<number> {
  try {
    const sr = getServiceRoleClient();
    if (!sr.ok) return 0;
    const { count, error } = await sr.client
      .from("leads")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("getPublicLeadCount:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}
