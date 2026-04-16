export type UserRole = "admin" | "user";

export type LeadTemperature = "HOT" | "WARM" | "COLD";

export type PipelineStatus =
  | "new"
  | "contacted"
  | "site_visit"
  | "quote"
  | "closed"
  | "install"
  | "support";

export type RoofType = "tile" | "metal" | "concrete";

export type PropertyType = "home" | "factory";

export type LeadImageKind = "bill" | "roof" | "project";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadRow = {
  id: string;
  contact_email: string;
  full_name: string;
  phone: string;
  line_id: string | null;
  facebook_profile: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  monthly_bill_thb: number;
  roof_type: RoofType;
  property_type: PropertyType;
  budget_range: string;
  notes: string | null;
  score: number;
  temperature: LeadTemperature;
  status: PipelineStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadImageRow = {
  id: string;
  lead_id: string;
  storage_path: string;
  kind: LeadImageKind;
  created_at: string;
};

export type ProposalRow = {
  id: string;
  lead_id: string;
  system_kw: number;
  price_thb: number;
  monthly_savings_thb: number;
  annual_savings_thb: number;
  roi_years: number;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  lead_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type LeadNoteRow = {
  id: string;
  lead_id: string;
  body: string;
  author_id: string | null;
  created_at: string;
};
