import { createClient } from "@/lib/supabase/server";

export async function getSignedUrl(
  bucket: "bills" | "roofs" | "projects",
  path: string,
  expiresSec = 3600,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
