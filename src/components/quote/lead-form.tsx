"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createLeadFormSchema, type LeadFormValues } from "@/lib/validations/lead";
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

const fieldClass =
  "border-white/20 bg-black text-white placeholder:text-[#737373] focus-visible:border-white/40 focus-visible:ring-white/20";

export function LeadQuoteForm() {
  const t = useTranslations("QuoteForm");
  const tQuote = useTranslations("Quote");
  const billRef = useRef<HTMLInputElement>(null);
  const roofRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    null as CreateLeadState | null,
  );

  const leadFormSchemaClient = useMemo(
    () =>
      createLeadFormSchema({
        email: t("errors.email"),
        name: t("errors.name"),
        phone: t("errors.phone"),
        facebookUrl: t("errors.facebookUrl"),
        address: t("errors.address"),
        bill: t("errors.bill"),
        budget: t("errors.budget"),
        location: t("errors.location"),
      }),
    [t],
  );

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchemaClient),
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

  const budgetOptions = useMemo(
    () => [
      { value: "under_100k", label: t("budgetUnder100k") },
      { value: "100k_300k", label: t("budget100k300k") },
      { value: "300k_500k", label: t("budget300k500k") },
      { value: "500k_high", label: t("budget500k") },
    ],
    [t],
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(t("toastSuccess"));
      form.reset();
      if (billRef.current) billRef.current.value = "";
      if (roofRef.current) roofRef.current.value = "";
    } else if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state, form, t]);

  const onPlaceResolved = useCallback(
    (formattedAddress: string) => {
      form.setValue("address", formattedAddress, { shouldValidate: true });
    },
    [form],
  );

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
    <Card className="border border-white/10 bg-transparent">
      <CardHeader>
        <CardTitle className="text-[28px] font-medium tracking-tight text-white">{tQuote("title")}</CardTitle>
        <CardDescription className="text-[15px] leading-relaxed text-[#a2a3a5]">
          {tQuote("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="space-y-8 [&_label]:text-[12px] [&_label]:font-medium [&_label]:tracking-[0.08em] [&_label]:text-[#a2a3a5] [&_label]:uppercase"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactEmail">
                {t("email")} *
              </Label>
              <Input
                id="contactEmail"
                autoComplete="email"
                className={fieldClass}
                {...form.register("contactEmail")}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t("fullName")} *
              </Label>
              <Input id="fullName" className={fieldClass} {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("phone")} *
              </Label>
              <Input id="phone" type="tel" className={fieldClass} {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-400">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineId">{t("lineId")}</Label>
              <Input id="lineId" className={fieldClass} {...form.register("lineId")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookProfile">{t("facebook")}</Label>
              <Input
                id="facebookProfile"
                className={fieldClass}
                {...form.register("facebookProfile")}
              />
              {form.formState.errors.facebookProfile && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.facebookProfile.message}
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">
                {t("address")} *
              </Label>
              <Input id="address" className={fieldClass} {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-sm text-red-400">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t("mapLabel")} *
            </Label>
            <LocationPicker
              lat={form.watch("lat") ?? null}
              lng={form.watch("lng") ?? null}
              inputClassName={fieldClass}
              onPlaceResolved={onPlaceResolved}
              onChange={(la, ln) => {
                form.setValue("lat", la, { shouldValidate: true });
                form.setValue("lng", ln, { shouldValidate: true });
              }}
            />
            {form.formState.errors.lat?.message && (
              <p className="text-sm text-red-400">{form.formState.errors.lat.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthlyBillThb">
                {t("monthlyBill")} *
              </Label>
              <Input
                id="monthlyBillThb"
                type="number"
                min={1}
                step="0.01"
                className={fieldClass}
                {...form.register("monthlyBillThb", { valueAsNumber: true })}
              />
              {form.formState.errors.monthlyBillThb && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.monthlyBillThb.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                {t("budget")} *
              </Label>
              <Controller
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder={t("selectBudget")} />
                    </SelectTrigger>
                    <SelectContent className="border border-white/10 bg-[#1a1a1a] text-white">
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
              <Label>
                {t("roofType")} *
              </Label>
              <Controller
                control={form.control}
                name="roofType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-white/10 bg-[#1a1a1a] text-white">
                      <SelectItem value="tile">{t("roofTile")}</SelectItem>
                      <SelectItem value="metal">{t("roofMetal")}</SelectItem>
                      <SelectItem value="concrete">{t("roofConcrete")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("propertyType")} *
              </Label>
              <Controller
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-white/10 bg-[#1a1a1a] text-white">
                      <SelectItem value="home">{t("propHome")}</SelectItem>
                      <SelectItem value="factory">{t("propFactory")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billImage">
                {t("billFile")} *
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="billImage"
                  ref={billRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className={`cursor-pointer ${fieldClass}`}
                />
                <Upload className="h-4 w-4 shrink-0 text-[#737373]" aria-hidden />
              </div>
              <BillPreview inputRef={billRef} alt={t("billPreviewAlt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roofImages">
                {t("roofPhotos")} *
              </Label>
              <Input
                id="roofImages"
                ref={roofRef}
                type="file"
                accept="image/*"
                multiple
                className={`cursor-pointer ${fieldClass}`}
              />
              <RoofPreview inputRef={roofRef} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" rows={4} className={fieldClass} {...form.register("notes")} />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 min-w-[200px] rounded-none bg-white px-8 text-sm font-medium tracking-wide text-black hover:bg-white/90 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BillPreview({
  inputRef,
  alt,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  alt: string;
}) {
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
    <img src={url} alt={alt} className="mt-2 max-h-40 rounded-md border border-white/10" />
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
