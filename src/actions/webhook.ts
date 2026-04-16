"use server";

type LeadWebhookPayload = {
  event: "lead.created";
  leadId: string;
  contactEmail: string;
  fullName: string;
  phone: string;
  temperature: string;
  score: number;
  createdAt: string;
};

export async function dispatchLeadCreatedWebhook(payload: LeadWebhookPayload) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return { ok: true as const, skipped: true };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false as const, status: res.status };
    }
    return { ok: true as const, skipped: false };
  } catch {
    return { ok: false as const, status: 0 };
  }
}
