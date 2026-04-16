"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signInWithMagicLink, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
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
