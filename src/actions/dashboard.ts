"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/profile";
import type { LeadTemperature, PipelineStatus } from "@/types/database";

const MAX_FILE = 12 * 1024 * 1024;

function extFromName(name: string) {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i).toLowerCase();
}

function safeFileName(original: string) {
  const ext = extFromName(original) || ".jpg";
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${base}${ext}`;
}

export async function updateLeadPipelineStatus(leadId: string, status: PipelineStatus) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw new Error("Could not update status");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function addLeadNote(leadId: string, body: string) {
  await requireAdmin();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Note is empty");

  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    body: trimmed,
    author_id: user.id,
  });
  if (error) throw new Error("Could not add note");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function uploadProjectImageAction(leadId: string, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file");
  }
  if (file.size > MAX_FILE) {
    throw new Error("File too large");
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (!project?.id) {
    throw new Error("Project not found");
  }

  const path = `${project.id}/${safeFileName(file.name)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("projects")
    .upload(path, buf, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (upErr) throw new Error("Upload failed");

  const { error: imgErr } = await supabase.from("lead_images").insert({
    lead_id: leadId,
    storage_path: path,
    kind: "project",
  });
  if (imgErr) throw new Error("Could not record image");

  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function getDashboardStats() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: leads } = await supabase.from("leads").select("temperature");

  const total = leads?.length ?? 0;
  const hot = leads?.filter((l) => l.temperature === "HOT").length ?? 0;
  const warm = leads?.filter((l) => l.temperature === "WARM").length ?? 0;
  const cold = leads?.filter((l) => l.temperature === "COLD").length ?? 0;

  return { total, hot, warm, cold };
}

export async function getLeadsForTable(
  filter?: LeadTemperature | "ALL",
  search?: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  let q = supabase
    .from("leads")
    .select(
      "id, full_name, contact_email, phone, temperature, score, status, created_at, lat, lng, monthly_bill_thb",
    )
    .order("created_at", { ascending: false });

  if (filter && filter !== "ALL") {
    q = q.eq("temperature", filter);
  }

  const term = search?.trim().replace(/[%]/g, "");
  if (term && term.length > 0) {
    const pattern = `%${term}%`;
    q = q.or(
      `full_name.ilike.${pattern},contact_email.ilike.${pattern},phone.ilike.${pattern}`,
    );
  }

  const { data, error } = await q;
  if (error) throw new Error("Could not load leads");
  return data ?? [];
}

export async function getLeadsForMap() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, lat, lng, temperature")
    .not("lat", "is", null)
    .not("lng", "is", null);
  if (error) throw new Error("Could not load map data");
  return data ?? [];
}

export async function getLeadDetail(leadId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: lead, error: le } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (le || !lead) throw new Error("Lead not found");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("lead_id", leadId)
    .maybeSingle();

  const { data: notes } = await supabase
    .from("lead_notes")
    .select("id, body, created_at, author_id")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  const { data: images } = await supabase
    .from("lead_images")
    .select("id, storage_path, kind, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  return { lead, proposal, notes: notes ?? [], images: images ?? [], projectId: project?.id ?? null };
}
