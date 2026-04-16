"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeInternalPath } from "@/lib/sanitize-internal-path";

export type AuthState = { ok: true } | { ok: false; message: string };

export async function signInWithMagicLink(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Login" });

  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false, message: t("errors.invalidEmail") };
  }

  const fallbackPortal = locale === "en" ? "/en/portal" : "/portal";
  const rawNext = String(formData.get("next") || "").trim();
  const safeNext = sanitizeInternalPath(rawNext || undefined, fallbackPortal);

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  });

  if (error) {
    return { ok: false, message: t("errors.sendFailed") };
  }

  return { ok: true };
}
