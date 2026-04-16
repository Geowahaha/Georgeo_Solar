"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { uploadProjectImageAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ProjectUploadForm({ leadId }: { leadId: string }) {
  const wrapped = async (
    _prev: { ok: boolean; message?: string } | null,
    formData: FormData,
  ) => {
    try {
      await uploadProjectImageAction(leadId, formData);
      return { ok: true };
    } catch {
      return { ok: false, message: "Upload failed" };
    }
  };

  const [state, action, pending] = useActionState(wrapped, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Image uploaded");
    } else if (state && !state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-2">
      <Label htmlFor={`file-${leadId}`}>Upload project image</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={`file-${leadId}`}
          name="file"
          type="file"
          accept="image/*"
          required
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Uploading…
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </form>
  );
}
