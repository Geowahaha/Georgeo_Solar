import { z } from "zod";

export const roofTypeSchema = z.enum(["tile", "metal", "concrete"]);
export const propertyTypeSchema = z.enum(["home", "factory"]);

export const leadFormSchema = z.object({
  contactEmail: z.string().email("Valid email is required"),
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  lineId: z.string().optional(),
  facebookProfile: z
    .string()
    .optional()
    .refine((s) => {
      if (!s || s.trim() === "") return true;
      return /^https?:\/\/.+/.test(s.trim());
    }, "Facebook profile must be a valid URL"),
  address: z.string().min(5, "Address is required"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  monthlyBillThb: z.coerce.number().positive("Bill must be greater than 0"),
  roofType: roofTypeSchema,
  propertyType: propertyTypeSchema,
  budgetRange: z.string().min(1, "Select a budget range"),
  notes: z.string().optional(),
})
  .refine(
    (d) =>
      d.lat != null &&
      d.lng != null &&
      Number.isFinite(d.lat) &&
      Number.isFinite(d.lng),
    {
      message:
        "Set your exact location: use the map search, click the map, or enter latitude & longitude.",
      path: ["lat"],
    },
  );

export type LeadFormValues = z.infer<typeof leadFormSchema>;
