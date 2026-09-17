/**
 * Tipos do banco (schema public). Mantidos à mão, espelhando as migrations em
 * supabase/migrations/. Podem ser regenerados com `supabase gen types`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "customer";
export type ProductType = "physical" | "digital" | "ebook";
export type BillingModel = "one_time" | "subscription";
export type EbookStatus = "draft" | "published";

/** Grupo de variação armazenado em products.variants (jsonb). */
export type VariantGroup = { label: string; options: string[] };

type ProductRow = {
  id: string;
  slug: string;
  type: ProductType;
  name: string;
  short_description: string;
  description: string;
  category_id: string | null;
  images: string[];
  variants: VariantGroup[];
  featured: boolean;
  active: boolean;
  price: number | null;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  weight_grams: number | null;
  billing_model: BillingModel | null;
  monthly_price: number | null;
  access_duration_days: number | null;
  grace_days: number | null;
  author: string | null;
  chapters_count: number | null;
  created_at: string;
  updated_at: string;
};

type ProductWrite = Partial<Omit<ProductRow, "id" | "created_at" | "updated_at" | "variants" | "images">> & {
  variants?: Json;
  images?: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; whatsapp: string | null; email: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; whatsapp?: string | null; email?: string | null };
        Update: { full_name?: string | null; whatsapp?: string | null; email?: string | null };
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role: AppRole; created_at: string };
        Insert: { user_id: string; role?: AppRole };
        Update: { role?: AppRole };
        Relationships: [];
      };
      categories: {
        Row: { id: string; slug: string; name: string; position: number; active: boolean; created_at: string };
        Insert: { id?: string; slug: string; name: string; position?: number; active?: boolean };
        Update: { slug?: string; name?: string; position?: number; active?: boolean };
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductWrite & { slug: string; type: ProductType; name: string };
        Update: ProductWrite;
        Relationships: [];
      };
      ebooks: {
        Row: { product_id: string; cover_url: string | null; intro: string; status: EbookStatus; version: number; updated_at: string };
        Insert: { product_id: string; cover_url?: string | null; intro?: string; status?: EbookStatus; version?: number };
        Update: { cover_url?: string | null; intro?: string; status?: EbookStatus; version?: number };
        Relationships: [];
      };
      ebook_chapters: {
        Row: { id: string; product_id: string; title: string; position: number; content: string; created_at: string; updated_at: string };
        Insert: { id?: string; product_id: string; title: string; position?: number; content?: string };
        Update: { title?: string; position?: number; content?: string };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          academy_name: string;
          whatsapp: string;
          whatsapp_label: string;
          email: string;
          instagram: string;
          address: string;
          city: string;
          delivery_rules: string;
          device_limit: number;
          grace_days: number;
          nutritionist_name: string;
          nutritionist_bio: string;
          terms: string;
          privacy: string;
          updated_at: string;
        };
        Insert: { id?: number };
        Update: Partial<Omit<Database["public"]["Tables"]["site_settings"]["Row"], "id" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      product_type: ProductType;
      billing_model: BillingModel;
      ebook_status: EbookStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
