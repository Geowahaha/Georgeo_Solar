"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { leadFormSchema, type LeadFormValues } from "@/lib/validations/lead";
import { createLeadAction, type CreateLeadState } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/maps/location-picker";
import { Loader2, Upload } from "lucide-react";

const budgetOptions = [
  { value: "under_100k", label: "Under ฿100,000" },
  { value: "100k_300k", label: "฿100,000 – ฿300,000" },
  { value: "300k_500k", label: "฿300,000 – ฿500,000" },
  { value: "500k_high", label: "฿500,000+ (high budget)" },
];

export function LeadQuoteForm() {
  const billRef = useRef<HTMLInputElement>(null);
  const roofRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    null as CreateLeadState | null,
  );

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      contactEmail: "",
      fullName: "",
      phone: "",
      lineId: "",
      facebookProfile: "",
      address: "",
      lat: null,
      lng: null,
      monthlyBillThb: 3500,
      roofType: "tile",
      propertyType: "home",
      budgetRange: "300k_500k",
      notes: "",
    },
  });

  useEffect(() => {
    if (state?.ok) {
      toast.success("Request received. Our team will contact you shortly.");
      form.reset();
      if (billRef.current) billRef.current.value = "";
      if (roofRef.current) roofRef.current.value = "";
    } else if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit((values) => {
    const bill = billRef.current?.files?.[0];
    const roofs = roofRef.current?.files ? Array.from(roofRef.current.files) : [];
    const fd = new FormData();
    fd.set("contactEmail", values.contactEmail);
    fd.set("fullName", values.fullName);
    fd.set("phone", values.phone);
    fd.set("lineId", values.lineId || "");
    fd.set("facebookProfile", values.facebookProfile || "");
    fd.set("address", values.address);
    if (values.lat != null) fd.set("lat", String(values.lat));
    if (values.lng != null) fd.set("lng", String(values.lng));
    fd.set("monthlyBillThb", String(values.monthlyBillThb));
    fd.set("roofType", values.roofType);
    fd.set("propertyType", values.propertyType);
    fd.set("budgetRange", values.budgetRange);
    fd.set("notes", values.notes || "");
    if (bill) fd.append("billImage", bill);
    roofs.forEach((f) => fd.append("roofImages", f));
    formAction(fd);
  });

  return (
    <Card className="border-slate-800 bg-slate-950/40">
      <CardHeader>
        <CardTitle className="text-xl text-slate-50">Get Solar Quote</CardTitle>
        <CardDescription>
          Duck4 Solar — upload your bill & roof photos for a fast, accurate assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                autoComplete="email"
                {...form.register("contactEmail")}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name *</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-400">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineId">LINE ID</Label>
              <Input id="lineId" {...form.register("lineId")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookProfile">Facebook profile URL</Label>
              <Input id="facebookProfile" {...form.register("facebookProfile")} />
              {form.formState.errors.facebookProfile && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.facebookProfile.message}
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Property address *</Label>
              <Input id="address" {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-sm text-red-400">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Map location</Label>
            <LocationPicker
              lat={form.watch("lat") ?? null}
              lng={form.watch("lng") ?? null}
              onChange={(la, ln) => {
                form.setValue("lat", la, { shouldValidate: true });
                form.setValue("lng", ln, { shouldValidate: true });
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthlyBillThb">Monthly electric bill (THB) *</Label>
              <Input
                id="monthlyBillThb"
                type="number"
                min={1}
                step="0.01"
                {...form.register("monthlyBillThb", { valueAsNumber: true })}
              />
              {form.formState.errors.monthlyBillThb && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.monthlyBillThb.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Budget range *</Label>
              <Controller
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Roof type *</Label>
              <Controller
                control={form.control}
                name="roofType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Property type *</Label>
              <Controller
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="factory">Factory</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billImage">Electric bill image *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="billImage"
                  ref={billRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              </div>
              <BillPreview inputRef={billRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roofImages">Roof photos * (multiple)</Label>
              <Input
                id="roofImages"
                ref={roofRef}
                type="file"
                accept="image/*"
                multiple
                className="cursor-pointer"
              />
              <RoofPreview inputRef={roofRef} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </div>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit & get proposal"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BillPreview({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onChange = () => {
      const f = el.files?.[0];
      setUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        if (f && f.type.startsWith("image/")) {
          return URL.createObjectURL(f);
        }
        return null;
      });
    };
    el.addEventListener("change", onChange);
    return () => {
      el.removeEventListener("change", onChange);
      setUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [inputRef]);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Bill preview" className="mt-2 max-h-40 rounded-md border border-slate-800" />
  );
}

function RoofPreview({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onChange = () => {
      const files = el.files ? Array.from(el.files) : [];
      setUrls((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return files.filter((f) => f.type.startsWith("image/")).map((f) => URL.createObjectURL(f));
      });
    };
    el.addEventListener("change", onChange);
    return () => {
      el.removeEventListener("change", onChange);
      setUrls((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });
    };
  }, [inputRef]);
  if (urls.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((u) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={u} src={u} alt="" className="h-20 w-20 rounded-md object-cover" />
      ))}
    </div>
  );
}
