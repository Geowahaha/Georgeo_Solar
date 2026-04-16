import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Total lead rows (quote requests) for public marketing copy.
 * Server-only; uses service role to bypass RLS (anon cannot read leads).
 */
export async function getPublicLeadCount(): Promise<number> {
  try {
    const supabase = createServiceRoleClient();
    const { count, error } = await supabase
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
