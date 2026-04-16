"use server";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { ok: true } | { ok: false; message: string };

export async function signInWithMagicLink(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/portal`,
    },
  });

  if (error) {
    return { ok: false, message: "Could not send magic link. Try again." };
  }

  return { ok: true };
}
