"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyLeadBundle() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .ilike("contact_email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lead) return { lead: null, proposal: null };

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("lead_id", lead.id)
    .maybeSingle();

  return { lead, proposal };
}
