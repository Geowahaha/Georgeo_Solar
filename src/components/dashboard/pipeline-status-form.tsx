"use client";

import { useTransition } from "react";
import { updateLeadPipelineStatus } from "@/actions/dashboard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PipelineStatus } from "@/types/database";

const statuses: { value: PipelineStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "site_visit", label: "Site visit" },
  { value: "quote", label: "Quote" },
  { value: "closed", label: "Closed" },
  { value: "install", label: "Install" },
  { value: "support", label: "Support" },
];

export function PipelineStatusForm({
  leadId,
  current,
}: {
  leadId: string;
  current: PipelineStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Label>Pipeline status</Label>
      <Select
        disabled={pending}
        value={current}
        onValueChange={(v) => {
          startTransition(async () => {
            await updateLeadPipelineStatus(leadId, v as PipelineStatus);
          });
        }}
      >
        <SelectTrigger className="max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
