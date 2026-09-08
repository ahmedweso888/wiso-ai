/** Shared, client-safe types for the subscription + payment-request system. */

/**
 * Legacy database slot kept for schema compatibility. WISO runs ONE unified AI
 * foundation (GPT-5.6), so both values mean the same thing and nothing in the
 * app routes between model families.
 */
export type PlanAiModel = "model_a" | "model_b";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  ai_enabled: boolean;
  ai_model: PlanAiModel;
  daily_question_limit: number;
  daily_image_limit: number;
  max_images_per_request: number;
  daily_pdf_limit: number;
  max_pdf_size_mb: number;
  max_pdf_pages: number;
  max_questions_per_request: number;
  features: string[];
  is_active: boolean;
  display_order: number;
};

export type RequestStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "cancelled";

export type PaymentSettings = {
  method_name: string;
  payment_number: string;
  instructions: string;
  max_screenshot_mb: number;
};

export type MySubscriptionState = {
  is_admin: boolean;
  allowed: boolean;
  reason:
    | "admin"
    | "subscription"
    | "request_pending"
    | "request_rejected"
    | "subscription_expired"
    | "no_subscription"
    | "unauthenticated";
  subscription: {
    id: string;
    status: string;
    started_at: string;
    expires_at: string | null;
    plan: SubscriptionPlan;
  } | null;
  latest_request: {
    id: string;
    status: RequestStatus;
    rejection_reason: string | null;
    submitted_at: string;
    reviewed_at: string | null;
    plan_name: string;
    price: number;
  } | null;
  ai: {
    mode_enabled: boolean;
    emergency_disabled: boolean;
    plan_ai_enabled: boolean;
    model: PlanAiModel | null;
  };
  usage: {
    questions_used: number;
    images_used: number;
    pdfs_used: number;
    questions_limit: number | null;
    images_limit: number | null;
    pdfs_limit: number | null;
  };
};

export type AdminStudentRef = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_code: number;
};

export type AdminRequest = {
  id: string;
  status: RequestStatus;
  payment_reference: string;
  payment_screenshot_path: string;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  student: AdminStudentRef;
  plan: SubscriptionPlan;
  has_active_subscription: boolean;
};

export type AdminSubscription = {
  id: string;
  status: "active" | "expired" | "revoked";
  started_at: string;
  expires_at: string | null;
  activated_at: string;
  revoked_at: string | null;
  student: AdminStudentRef;
  plan: SubscriptionPlan;
};

/** Unified label — no Model A / Model B distinction exists any more. */
export const WISO_AI_LABEL = "ذكاء WISO (GPT-5.6)";

export const MODEL_LABEL: Record<PlanAiModel, string> = {
  model_a: WISO_AI_LABEL,
  model_b: WISO_AI_LABEL,
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "قيد المراجعة",
  under_review: "تحت المراجعة",
  approved: "تم القبول",
  rejected: "مرفوض",
  cancelled: "ملغي",
};
