"use server";

import { revalidatePath } from "next/cache";
import { leadFormSchema } from "@/lib/validations/lead";
import { estimateProposal } from "@/lib/leads/proposal";
import { computeLeadScore, scoreToTemperature } from "@/lib/leads/scoring";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { dispatchLeadCreatedWebhook } from "@/actions/webhook";
import type { LeadTemperature, PipelineStatus } from "@/types/database";

const MAX_FILE = 8 * 1024 * 1024;

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

export type CreateLeadState =
  | { ok: true; leadId: string }
  | { ok: false; message: string };

export async function createLeadAction(
  _prev: CreateLeadState | null,
  formData: FormData,
): Promise<CreateLeadState> {
  try {
    return await createLeadActionInner(formData);
  } catch (err) {
    console.error("createLeadAction failed:", err);
    return {
      ok: false,
      message:
        "Something went wrong while submitting. Check your connection and file sizes, then try again.",
    };
  }
}

async function createLeadActionInner(formData: FormData): Promise<CreateLeadState> {
  const facebookProfile = (formData.get("facebookProfile") as string) || "";

  const parsed = leadFormSchema.safeParse({
    contactEmail: formData.get("contactEmail"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    lineId: formData.get("lineId") || undefined,
    facebookProfile: facebookProfile || undefined,
    address: formData.get("address"),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    monthlyBillThb: formData.get("monthlyBillThb"),
    roofType: formData.get("roofType"),
    propertyType: formData.get("propertyType"),
    budgetRange: formData.get("budgetRange"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] ||
      "Please check the form and try again.";
    return { ok: false, message: msg };
  }

  const data = parsed.data;
  const billFile = formData.get("billImage");
  const roofFiles = formData.getAll("roofImages").filter((f): f is File => f instanceof File && f.size > 0);

  if (!(billFile instanceof File) || billFile.size === 0) {
    return { ok: false, message: "Electric bill image is required." };
  }
  if (billFile.size > MAX_FILE) {
    return { ok: false, message: "Bill image must be under 8MB." };
  }
  if (roofFiles.length === 0) {
    return { ok: false, message: "Upload at least one roof photo." };
  }
  for (const f of roofFiles) {
    if (f.size > MAX_FILE) {
      return { ok: false, message: "Each roof image must be under 8MB." };
    }
  }

  const hasLocation =
    data.lat != null &&
    data.lng != null &&
    !Number.isNaN(data.lat) &&
    !Number.isNaN(data.lng);

  const score = computeLeadScore({
    monthlyBillThb: data.monthlyBillThb,
    roofImageCount: roofFiles.length,
    hasLocation,
    budgetRange: data.budgetRange,
  });
  const temperature: LeadTemperature = scoreToTemperature(score);
  const proposal = estimateProposal(data.monthlyBillThb);

  const supabase = createServiceRoleClient();

  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .insert({
      contact_email: data.contactEmail.trim().toLowerCase(),
      full_name: data.fullName,
      phone: data.phone,
      line_id: data.lineId || null,
      facebook_profile: data.facebookProfile || null,
      address: data.address,
      lat: hasLocation ? data.lat : null,
      lng: hasLocation ? data.lng : null,
      monthly_bill_thb: data.monthlyBillThb,
      roof_type: data.roofType,
      property_type: data.propertyType,
      budget_range: data.budgetRange,
      notes: data.notes || null,
      score,
      temperature,
      status: "new" satisfies PipelineStatus,
    })
    .select("id, created_at")
    .single();

  if (leadErr || !leadRow) {
    console.error("leads insert error:", leadErr?.message ?? leadErr);
    return { ok: false, message: "Could not save your request. Please try again." };
  }

  const leadId = leadRow.id;

  const billPath = `${leadId}/${safeFileName(billFile.name)}`;
  const billBuf = Buffer.from(await billFile.arrayBuffer());
  const { error: billUpErr } = await supabase.storage
    .from("bills")
    .upload(billPath, billBuf, {
      contentType: billFile.type || "image/jpeg",
      upsert: false,
    });
  if (billUpErr) {
    await supabase.from("leads").delete().eq("id", leadId);
    return { ok: false, message: "Could not upload bill image." };
  }

  await supabase.from("lead_images").insert({
    lead_id: leadId,
    storage_path: billPath,
    kind: "bill",
  });

  for (const roof of roofFiles) {
    const path = `${leadId}/${safeFileName(roof.name)}`;
    const buf = Buffer.from(await roof.arrayBuffer());
    const { error: rErr } = await supabase.storage.from("roofs").upload(path, buf, {
      contentType: roof.type || "image/jpeg",
      upsert: false,
    });
    if (rErr) {
      return { ok: false, message: "Could not upload roof images." };
    }
    await supabase.from("lead_images").insert({
      lead_id: leadId,
      storage_path: path,
      kind: "roof",
    });
  }

  const { error: propErr } = await supabase.from("proposals").insert({
    lead_id: leadId,
    system_kw: proposal.systemKw,
    price_thb: proposal.priceThb,
    monthly_savings_thb: proposal.monthlySavingsThb,
    annual_savings_thb: proposal.annualSavingsThb,
    roi_years: proposal.roiYears,
  });

  if (propErr) {
    return { ok: false, message: "Lead saved but proposal failed. Our team will follow up." };
  }

  await supabase.from("projects").insert({
    lead_id: leadId,
    title: "Solar project",
    status: "planning",
  });

  await dispatchLeadCreatedWebhook({
    event: "lead.created",
    leadId,
    contactEmail: data.contactEmail,
    fullName: data.fullName,
    phone: data.phone,
    temperature,
    score,
    createdAt: leadRow.created_at,
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true, leadId };
}
