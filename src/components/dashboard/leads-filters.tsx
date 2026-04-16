"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LeadsFilters({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);

  const temperature = searchParams.get("temperature") ?? "ALL";

  const pushParams = (next: URLSearchParams) => {
    startTransition(() => {
      router.push(`/dashboard?${next.toString()}`);
    });
  };

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    pushParams(next);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <Tabs
        value={temperature}
        onValueChange={(v) => setParam("temperature", v === "ALL" ? null : v)}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="HOT">HOT</TabsTrigger>
          <TabsTrigger value="WARM">WARM</TabsTrigger>
          <TabsTrigger value="COLD">COLD</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="w-full max-w-sm">
        <Input
          placeholder="Search — press Enter"
          value={q}
          disabled={pending}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setParam("q", q.trim() || null);
            }
          }}
        />
      </div>
    </div>
  );
}
