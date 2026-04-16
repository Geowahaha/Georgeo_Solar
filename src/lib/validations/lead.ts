import { z } from "zod";

export const roofTypeSchema = z.enum(["tile", "metal", "concrete"]);
export const propertyTypeSchema = z.enum(["home", "factory"]);

export type LeadFormMessages = {
  email: string;
  name: string;
  phone: string;
  facebookUrl: string;
  address: string;
  bill: string;
  budget: string;
  location: string;
};

const defaultMessages: LeadFormMessages = {
  email: "Valid email is required",
  name: "Name is required",
  phone: "Phone is required",
  facebookUrl: "Facebook profile must be a valid URL",
  address: "Address is required",
  bill: "Bill must be greater than 0",
  budget: "Select a budget range",
  location:
    "Set your exact location: use the map search, click the map, or enter latitude & longitude.",
};

export function createLeadFormSchema(messages: LeadFormMessages) {
  return z
    .object({
      contactEmail: z.string().email(messages.email),
      fullName: z.string().min(2, messages.name),
      phone: z.string().min(6, messages.phone),
      lineId: z.string().optional(),
      facebookProfile: z
        .string()
        .optional()
        .refine((s) => {
          if (!s || s.trim() === "") return true;
          return /^https?:\/\/.+/.test(s.trim());
        }, messages.facebookUrl),
      address: z.string().min(5, messages.address),
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional(),
      monthlyBillThb: z.coerce.number().positive(messages.bill),
      roofType: roofTypeSchema,
      propertyType: propertyTypeSchema,
      budgetRange: z.string().min(1, messages.budget),
      notes: z.string().optional(),
    })
    .refine(
      (d) =>
        d.lat != null &&
        d.lng != null &&
        Number.isFinite(d.lat) &&
        Number.isFinite(d.lng),
      {
        message: messages.location,
        path: ["lat"],
      },
    );
}

/** Server + English default (same rules as localized client schema). */
export const leadFormSchema = createLeadFormSchema(defaultMessages);

export type LeadFormValues = z.infer<typeof leadFormSchema>;
