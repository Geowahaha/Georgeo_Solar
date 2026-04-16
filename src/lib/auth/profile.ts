import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export async function getSessionProfile(): Promise<{
  userId: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    role: (profile?.role as UserRole) ?? "user",
    fullName: profile?.full_name ?? null,
  };
}

export async function requireAdmin() {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return profile;
}
