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
export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "failed" | "refunded" | "cancelled";
export type DiscountType = "percentage" | "fixed";

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
  status: string;
  tags: string[];
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  featured_order: number | null;
  is_new: boolean;
  show_on_home: boolean;
  custom_badge: string | null;
  track_inventory: boolean;
  minimum_stock: number;
  allow_backorder: boolean;
  requires_shipping: boolean;
  width_cm: number | null;
  height_cm: number | null;
  length_cm: number | null;
  extra_lead_days: number;
  shipping_notes: string;
  published_at: string | null;
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
        Row: { id: string; full_name: string | null; whatsapp: string | null; phone: string | null; email: string | null; status: string; last_access_at: string | null; internal_notes: string; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; whatsapp?: string | null; phone?: string | null; email?: string | null; status?: string; last_access_at?: string | null; internal_notes?: string };
        Update: { full_name?: string | null; whatsapp?: string | null; phone?: string | null; email?: string | null; status?: string; last_access_at?: string | null; internal_notes?: string };
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role: AppRole; created_at: string };
        Insert: { user_id: string; role?: AppRole };
        Update: { role?: AppRole };
        Relationships: [];
      };
      categories: {
        Row: { id: string; slug: string; name: string; description: string; image_path: string | null; position: number; active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; name: string; description?: string; image_path?: string | null; position?: number; active?: boolean };
        Update: { slug?: string; name?: string; description?: string; image_path?: string | null; position?: number; active?: boolean };
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductWrite & { slug: string; type: ProductType; name: string };
        Update: ProductWrite;
        Relationships: [];
      };
      product_images: {
        Row: { id: string; product_id: string; storage_path: string | null; legacy_url: string | null; alt_text: string; is_primary: boolean; display_order: number; created_at: string };
        Insert: { id?: string; product_id: string; storage_path?: string | null; legacy_url?: string | null; alt_text?: string; is_primary?: boolean; display_order?: number };
        Update: { alt_text?: string; is_primary?: boolean; display_order?: number };
        Relationships: [];
      };
      product_variants: {
        Row: { id: string; product_id: string; name: string; value: string; sku: string | null; stock: number; price_delta: number; active: boolean; position: number; created_at: string; updated_at: string };
        Insert: { id?: string; product_id: string; name: string; value: string; sku?: string | null; stock?: number; price_delta?: number; active?: boolean; position?: number };
        Update: { name?: string; value?: string; sku?: string | null; stock?: number; price_delta?: number; active?: boolean; position?: number };
        Relationships: [];
      };
      inventory_movements: {
        Row: { id: string; product_id: string; variant_id: string | null; quantity: number; balance_after: number; reason: string; note: string; created_by: string | null; created_at: string };
        Insert: { id?: string; product_id: string; variant_id?: string | null; quantity: number; balance_after: number; reason: string; note?: string; created_by?: string | null };
        Update: never;
        Relationships: [];
      };
      ebooks: {
        Row: { product_id: string; cover_url: string | null; cover_path: string | null; intro: string; status: EbookStatus; version: number; updated_at: string };
        Insert: { product_id: string; cover_url?: string | null; cover_path?: string | null; intro?: string; status?: EbookStatus; version?: number };
        Update: { cover_url?: string | null; cover_path?: string | null; intro?: string; status?: EbookStatus; version?: number };
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
      orders: {
        Row: { id: string; order_number: number; customer_id: string | null; status: OrderStatus; payment_status: PaymentStatus; subtotal: number; discount: number; shipping: number; total: number; payment_method: string | null; shipping_address: Json; notes: string; source: string; created_at: string; updated_at: string };
        Insert: { id?: string; customer_id?: string | null; status?: OrderStatus; payment_status?: PaymentStatus; subtotal?: number; discount?: number; shipping?: number; total?: number; payment_method?: string | null; shipping_address?: Json; notes?: string; source?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; product_name: string; sku: string | null; quantity: number; unit_price: number; total: number; metadata: Json };
        Insert: { id?: string; order_id: string; product_id?: string | null; product_name: string; sku?: string | null; quantity: number; unit_price: number; total: number; metadata?: Json };
        Update: never;
        Relationships: [];
      };
      coupons: {
        Row: { id: string; code: string; description: string; discount_type: DiscountType; discount_value: number; minimum_order: number; usage_limit: number | null; usage_per_customer: number | null; product_ids: string[]; category_ids: string[]; starts_at: string | null; ends_at: string | null; active: boolean; usage_count: number; created_at: string; updated_at: string };
        Insert: { id?: string; code: string; description?: string; discount_type: DiscountType; discount_value: number; minimum_order?: number; usage_limit?: number | null; usage_per_customer?: number | null; product_ids?: string[]; category_ids?: string[]; starts_at?: string | null; ends_at?: string | null; active?: boolean };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Row"]>;
        Relationships: [];
      };
      banners: {
        Row: { id: string; title: string; subtitle: string; desktop_image_path: string | null; mobile_image_path: string | null; button_label: string | null; link: string | null; starts_at: string | null; ends_at: string | null; active: boolean; position: number; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; subtitle?: string; desktop_image_path?: string | null; mobile_image_path?: string | null; button_label?: string | null; link?: string | null; starts_at?: string | null; ends_at?: string | null; active?: boolean; position?: number };
        Update: Partial<Database["public"]["Tables"]["banners"]["Row"]>;
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
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      discount_type: DiscountType;
    };
    CompositeTypes: Record<string, never>;
  };
};
