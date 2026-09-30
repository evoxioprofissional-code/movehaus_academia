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

export type AppRole = "admin" | "customer" | "professor" | "nutricionista";
export type ProductType = "physical" | "digital" | "ebook";
export type BillingModel = "one_time" | "subscription";
export type EbookStatus = "draft" | "published";
export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "failed" | "refunded" | "cancelled";
export type DiscountType = "percentage" | "fixed";
export type SubscriptionStatus = "pending" | "active" | "past_due" | "cancelled" | "expired";
export type AccessStatus = "active" | "revoked" | "expired";

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
        Row: { id: string; order_number: number; customer_id: string | null; status: OrderStatus; payment_status: PaymentStatus; subtotal: number; discount: number; shipping: number; total: number; payment_method: string | null; shipping_address: Json; notes: string; source: string; idempotency_key: string | null; coupon_id: string | null; customer_email: string | null; customer_name: string | null; customer_phone: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; customer_id?: string | null; status?: OrderStatus; payment_status?: PaymentStatus; subtotal?: number; discount?: number; shipping?: number; total?: number; payment_method?: string | null; shipping_address?: Json; notes?: string; source?: string; idempotency_key?: string | null; coupon_id?: string | null; customer_email?: string | null; customer_name?: string | null; customer_phone?: string | null };
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
      payments: {
        Row: { id: string; order_id: string; provider: string; provider_payment_id: string | null; status: PaymentStatus; amount: number; method: string | null; idempotency_key: string; provider_payload: Json; created_at: string; updated_at: string };
        Insert: { id?: string; order_id: string; provider: string; provider_payment_id?: string | null; status?: PaymentStatus; amount: number; method?: string | null; idempotency_key: string; provider_payload?: Json };
        Update: { provider_payment_id?: string | null; status?: PaymentStatus; method?: string | null; provider_payload?: Json };
        Relationships: [];
      };
      subscriptions: {
        Row: { id: string; user_id: string; product_id: string; provider: string | null; provider_subscription_id: string | null; status: SubscriptionStatus; monthly_amount: number; grace_days: number; current_period_start: string | null; current_period_end: string | null; cancelled_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; product_id: string; provider?: string | null; provider_subscription_id?: string | null; status?: SubscriptionStatus; monthly_amount: number; grace_days?: number; current_period_start?: string | null; current_period_end?: string | null; cancelled_at?: string | null };
        Update: { provider_subscription_id?: string | null; status?: SubscriptionStatus; monthly_amount?: number; grace_days?: number; current_period_start?: string | null; current_period_end?: string | null; cancelled_at?: string | null };
        Relationships: [];
      };
      digital_access: {
        Row: { id: string; user_id: string; product_id: string; order_id: string | null; subscription_id: string | null; status: AccessStatus; permanent: boolean; starts_at: string; expires_at: string | null; revoked_at: string | null; revoked_by: string | null; reason: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; product_id: string; order_id?: string | null; subscription_id?: string | null; status?: AccessStatus; permanent?: boolean; starts_at?: string; expires_at?: string | null; revoked_at?: string | null; revoked_by?: string | null; reason?: string };
        Update: { status?: AccessStatus; permanent?: boolean; expires_at?: string | null; revoked_at?: string | null; revoked_by?: string | null; reason?: string };
        Relationships: [];
      };
      reading_progress: {
        Row: { user_id: string; product_id: string; chapter_id: string | null; progress_percent: number; updated_at: string };
        Insert: { user_id: string; product_id: string; chapter_id?: string | null; progress_percent?: number };
        Update: { chapter_id?: string | null; progress_percent?: number };
        Relationships: [];
      };
      coupon_redemptions: {
        Row: { id: string; coupon_id: string; user_id: string | null; order_id: string; discount: number; created_at: string };
        Insert: { id?: string; coupon_id: string; user_id?: string | null; order_id: string; discount: number };
        Update: never;
        Relationships: [];
      };
      customer_devices: {
        Row: { id: string; user_id: string; device_hash: string; label: string; last_seen_at: string; revoked_at: string | null; created_at: string };
        Insert: { id?: string; user_id: string; device_hash: string; label?: string; last_seen_at?: string; revoked_at?: string | null };
        Update: { label?: string; last_seen_at?: string; revoked_at?: string | null };
        Relationships: [];
      };
      access_logs: {
        Row: { id: number; user_id: string | null; product_id: string | null; device_id: string | null; action: string; metadata: Json; created_at: string };
        Insert: { user_id?: string | null; product_id?: string | null; device_id?: string | null; action: string; metadata?: Json };
        Update: never;
        Relationships: [];
      };
      coaching_access: {
        Row: { user_id: string; active: boolean; source: string; granted_by: string | null; starts_at: string; expires_at: string | null; created_at: string; updated_at: string };
        Insert: { user_id: string; active?: boolean; source?: string; granted_by?: string | null; starts_at?: string; expires_at?: string | null };
        Update: { active?: boolean; source?: string; granted_by?: string | null; starts_at?: string; expires_at?: string | null };
        Relationships: [];
      };
      workout_plans: {
        Row: { id: string; user_id: string; name: string; active: boolean; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name?: string; active?: boolean; created_by?: string | null };
        Update: { name?: string; active?: boolean };
        Relationships: [];
      };
      workout_days: {
        Row: { id: string; plan_id: string; weekday: number | null; name: string; position: number; created_at: string };
        Insert: { id?: string; plan_id: string; weekday?: number | null; name?: string; position?: number };
        Update: { weekday?: number | null; name?: string; position?: number };
        Relationships: [];
      };
      workout_exercises: {
        Row: { id: string; day_id: string; name: string; sets: number; reps: string; target_load: string; rest_seconds: number; video_url: string | null; notes: string; position: number; created_at: string };
        Insert: { id?: string; day_id: string; name: string; sets?: number; reps?: string; target_load?: string; rest_seconds?: number; video_url?: string | null; notes?: string; position?: number };
        Update: { name?: string; sets?: number; reps?: string; target_load?: string; rest_seconds?: number; video_url?: string | null; notes?: string; position?: number };
        Relationships: [];
      };
      workout_sessions: {
        Row: { id: string; user_id: string; day_id: string | null; day_name: string; started_at: string; finished_at: string | null; feeling: string | null; discomfort: string; notes: string; created_at: string };
        Insert: { id?: string; user_id: string; day_id?: string | null; day_name?: string };
        Update: { finished_at?: string | null; feeling?: string | null; discomfort?: string; notes?: string };
        Relationships: [];
      };
      exercise_logs: {
        Row: { id: string; session_id: string; exercise_id: string | null; exercise_name: string; set_number: number; reps_done: number | null; load_used: number | null; created_at: string };
        Insert: { id?: string; session_id: string; exercise_id?: string | null; exercise_name?: string; set_number: number; reps_done?: number | null; load_used?: number | null };
        Update: { reps_done?: number | null; load_used?: number | null };
        Relationships: [];
      };
      points_ledger: {
        Row: { id: string; user_id: string; points: number; reason: string; created_at: string };
        Insert: { id?: string; user_id: string; points: number; reason?: string };
        Update: { points?: number; reason?: string };
        Relationships: [];
      };
      goals: {
        Row: { id: string; user_id: string; title: string; type: string; target: number; period: string | null; status: string; created_by: string | null; achieved_at: string | null; created_at: string };
        Insert: { id?: string; user_id: string; title: string; type?: string; target?: number; period?: string | null; status?: string; created_by?: string | null; achieved_at?: string | null };
        Update: { title?: string; type?: string; target?: number; period?: string | null; status?: string; achieved_at?: string | null };
        Relationships: [];
      };
      achievements: {
        Row: { id: string; user_id: string; code: string; title: string; achieved_at: string };
        Insert: { id?: string; user_id: string; code: string; title: string; achieved_at?: string };
        Update: { title?: string };
        Relationships: [];
      };
      rewards: {
        Row: { id: string; title: string; description: string; cost_points: number; type: string; active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; description?: string; cost_points?: number; type?: string; active?: boolean };
        Update: { title?: string; description?: string; cost_points?: number; type?: string; active?: boolean };
        Relationships: [];
      };
      reward_redemptions: {
        Row: { id: string; user_id: string; reward_id: string | null; reward_title: string; points_spent: number; status: string; created_at: string; decided_at: string | null };
        Insert: { id?: string; user_id: string; reward_id?: string | null; reward_title?: string; points_spent?: number; status?: string };
        Update: { status?: string; decided_at?: string | null };
        Relationships: [];
      };
      body_metrics: {
        Row: { id: string; user_id: string; measured_on: string; weight: number | null; waist: number | null; hip: number | null; arm: number | null; chest: number | null; thigh: number | null; body_fat: number | null; notes: string; created_at: string };
        Insert: { id?: string; user_id: string; measured_on?: string; weight?: number | null; waist?: number | null; hip?: number | null; arm?: number | null; chest?: number | null; thigh?: number | null; body_fat?: number | null; notes?: string };
        Update: Partial<{ measured_on: string; weight: number | null; waist: number | null; hip: number | null; arm: number | null; chest: number | null; thigh: number | null; body_fat: number | null; notes: string }>;
        Relationships: [];
      };
      checkins: {
        Row: { id: string; user_id: string; week_start: string; energy: number | null; sleep: number | null; nutrition: number | null; disposition: number | null; pain: string; difficulty: string; notes: string; created_at: string };
        Insert: { id?: string; user_id: string; week_start?: string; energy?: number | null; sleep?: number | null; nutrition?: number | null; disposition?: number | null; pain?: string; difficulty?: string; notes?: string };
        Update: Partial<{ energy: number | null; sleep: number | null; nutrition: number | null; disposition: number | null; pain: string; difficulty: string; notes: string }>;
        Relationships: [];
      };
      hydration_logs: {
        Row: { user_id: string; day: string; total_ml: number; goal_ml: number; updated_at: string };
        Insert: { user_id: string; day?: string; total_ml?: number; goal_ml?: number };
        Update: { total_ml?: number; goal_ml?: number };
        Relationships: [];
      };
      progress_photos: {
        Row: { id: string; user_id: string; storage_path: string; taken_on: string; note: string; created_at: string };
        Insert: { id?: string; user_id: string; storage_path: string; taken_on?: string; note?: string };
        Update: { note?: string; taken_on?: string };
        Relationships: [];
      };
      meal_plans: {
        Row: { id: string; user_id: string; name: string; notes: string; active: boolean; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name?: string; notes?: string; active?: boolean; created_by?: string | null };
        Update: { name?: string; notes?: string; active?: boolean };
        Relationships: [];
      };
      meals: {
        Row: { id: string; plan_id: string; name: string; time_label: string; position: number; created_at: string };
        Insert: { id?: string; plan_id: string; name?: string; time_label?: string; position?: number };
        Update: { name?: string; time_label?: string; position?: number };
        Relationships: [];
      };
      meal_items: {
        Row: { id: string; meal_id: string; food: string; quantity: string; substitutions: string; notes: string; position: number; created_at: string };
        Insert: { id?: string; meal_id: string; food: string; quantity?: string; substitutions?: string; notes?: string; position?: number };
        Update: { food?: string; quantity?: string; substitutions?: string; notes?: string; position?: number };
        Relationships: [];
      };
      meal_logs: {
        Row: { id: string; user_id: string; meal_id: string; day: string; created_at: string };
        Insert: { id?: string; user_id: string; meal_id: string; day?: string };
        Update: { day?: string };
        Relationships: [];
      };
      recipes: {
        Row: { id: string; title: string; description: string; ingredients: string; steps: string; active: boolean; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; description?: string; ingredients?: string; steps?: string; active?: boolean; created_by?: string | null };
        Update: { title?: string; description?: string; ingredients?: string; steps?: string; active?: boolean };
        Relationships: [];
      };
      home_media: {
        Row: { key: string; storage_path: string; updated_at: string };
        Insert: { key: string; storage_path: string };
        Update: { storage_path?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      has_coaching_access: { Args: { uid?: string }; Returns: boolean };
      points_balance: { Args: { uid?: string }; Returns: number };
      is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      product_type: ProductType;
      billing_model: BillingModel;
      ebook_status: EbookStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      discount_type: DiscountType;
      subscription_status: SubscriptionStatus;
      access_status: AccessStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
