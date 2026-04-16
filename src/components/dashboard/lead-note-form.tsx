"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { addLeadNote } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: { ok: boolean; message?: string } | null, formData: FormData) => {
      const body = String(formData.get("body") || "");
      try {
        await addLeadNote(leadId, body);
        return { ok: true };
      } catch {
        return { ok: false, message: "Could not save note" };
      }
    },
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Note added");
    } else if (state && !state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-2">
      <Textarea name="body" placeholder="Add an internal note…" rows={3} required />
      <Button type="submit" size="sm" disabled={pending}>
        Add note
      </Button>
    </form>
  );
}
