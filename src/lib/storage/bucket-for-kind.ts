import type { LeadImageKind } from "@/types/database";

export function bucketForLeadImageKind(
  kind: LeadImageKind,
): "bills" | "roofs" | "projects" {
  if (kind === "bill") return "bills";
  if (kind === "roof") return "roofs";
  return "projects";
}
