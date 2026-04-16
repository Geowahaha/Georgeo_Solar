"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signInWithMagicLink, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const fieldClass =
  "border-white/20 bg-black text-white placeholder:text-[#737373] focus-visible:border-white/40 focus-visible:ring-white/20";

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(signInWithMagicLink, null as AuthState | null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Check your email for the sign-in link.");
    } else if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4 [&_label]:text-[12px] [&_label]:font-medium [&_label]:tracking-[0.08em] [&_label]:text-[#a2a3a5] [&_label]:uppercase">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-none bg-white text-sm font-medium tracking-wide text-black hover:bg-white/90"
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Sending link…
          </>
        ) : (
          "Email me a magic link"
        )}
      </Button>
    </form>
  );
}
