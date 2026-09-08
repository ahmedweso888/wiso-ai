/**
 * Subscription + payment-request seam.
 *
 * All authorization, validation and activation logic lives server-side (here and
 * in the database functions). The browser only sends intent.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import type {
  AdminRequest,
  AdminSubscription,
  MySubscriptionState,
  PaymentSettings,
  SubscriptionPlan,
} from "./subscriptions.types";

export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubscriptionPlan[]> => {
    const { data, error } = await context.supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SubscriptionPlan[];
  });

export const listAllPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubscriptionPlan[]> => {
    const { data, error } = await context.supabase
      .from("subscription_plans")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SubscriptionPlan[];
  });

export const getPaymentSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PaymentSettings> => {
    const { data, error } = await context.supabase
      .from("payment_settings")
      .select("method_name, payment_number, instructions, max_screenshot_mb")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (
      (data as PaymentSettings | null) ?? {
        method_name: "",
        payment_number: "",
        instructions: "",
        max_screenshot_mb: 5,
      }
    );
  });

export const getMySubscriptionState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MySubscriptionState> => {
    await context.supabase.rpc("expire_due_subscriptions");
    const { data, error } = await context.supabase.rpc("my_subscription_state");
    if (error) throw new Error(error.message);
    return data as unknown as MySubscriptionState;
  });

export const submitSubscriptionRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      planId: string;
      paymentReference: string;
      fileName: string;
      mimeType: string;
      dataBase64: string;
    }) => input,
  )
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(data.mimeType)) {
      throw new Error("نوع الصورة مش مدعوم. ارفع JPG أو PNG أو WEBP.");
    }
    if (!/^[0-9+\-\s]{6,32}$/.test(data.paymentReference.trim())) {
      throw new Error("اكتب رقم التحويل صح (من 6 لـ 32 رقم).");
    }

    const { data: settings } = await context.supabase
      .from("payment_settings")
      .select("max_screenshot_mb")
      .maybeSingle();
    const maxMb = settings?.max_screenshot_mb ?? 5;

    const binary = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    if (binary.byteLength > maxMb * 1024 * 1024) {
      throw new Error(`أقصى حجم للصورة ${maxMb}MB.`);
    }
    if (binary.byteLength < 1024) throw new Error("الصورة مش صالحة.");

    const ext = data.mimeType === "image/png" ? "png" : data.mimeType === "image/webp" ? "webp" : "jpg";
    const path = `${context.userId}/${crypto.randomUUID()}.${ext}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const upload = await supabaseAdmin.storage
      .from("payment-proofs")
      .upload(path, binary, { contentType: data.mimeType, upsert: false });
    if (upload.error) throw new Error(upload.error.message);

    const { data: row, error } = await context.supabase.rpc(
      "submit_subscription_request",
      {
        _plan_id: data.planId,
        _payment_reference: data.paymentReference.trim(),
        _screenshot_path: path,
      },
    );
    if (error) {
      await supabaseAdmin.storage.from("payment-proofs").remove([path]);
      throw new Error(error.message);
    }
    return { id: (row as unknown as { id: string }).id };
  });

export const cancelMyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { requestId: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("cancel_my_subscription_request", {
      _id: data.requestId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Signed URL for a payment proof. RLS decides who may see the request row. */
export const getPaymentProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { requestId: string }) => input)
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { data: row, error } = await context.supabase
      .from("subscription_requests")
      .select("payment_screenshot_path")
      .eq("id", data.requestId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("مش مسموح.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const signed = await supabaseAdmin.storage
      .from("payment-proofs")
      .createSignedUrl(row.payment_screenshot_path, 300);
    if (signed.error || !signed.data) throw new Error("مش قادر أفتح الصورة.");
    return { url: signed.data.signedUrl };
  });

/* ------------------------------- admin ---------------------------------- */

export const adminListRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string | null }) => input)
  .handler(async ({ data, context }): Promise<AdminRequest[]> => {
    const { data: rows, error } = await context.supabase.rpc(
      "admin_list_subscription_requests",
      { _status: (data.status ?? null) as never, _limit: 200 },
    );
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as AdminRequest[];
  });

export const adminReviewRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { requestId: string; notes?: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_review_subscription_request", {
      _id: data.requestId,
      ...(data.notes ? { _notes: data.notes } : {}),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRejectRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { requestId: string; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_reject_subscription_request", {
      _id: data.requestId,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminApproveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      requestId: string;
      expiresAt: string;
      replaceActive?: boolean;
      notes?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const expires = new Date(data.expiresAt);
    if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
      throw new Error("تاريخ الانتهاء لازم يكون في المستقبل.");
    }
    const { data: sub, error } = await context.supabase.rpc(
      "admin_approve_subscription_request",
      {
        _id: data.requestId,
        _expires_at: expires.toISOString(),
        _replace_active: data.replaceActive ?? false,
        ...(data.notes ? { _notes: data.notes } : {}),
      },
    );
    if (error) throw new Error(error.message);
    return { subscriptionId: (sub as unknown as { id: string }).id };
  });

export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSubscription[]> => {
    await context.supabase.rpc("expire_due_subscriptions");
    const { data, error } = await context.supabase.rpc(
      "admin_list_student_subscriptions",
      { _limit: 200 },
    );
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AdminSubscription[];
  });

export const adminExtendSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { subscriptionId: string; days: number }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_extend_student_subscription", {
      _id: data.subscriptionId,
      _days: Math.trunc(data.days),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRevokeSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { subscriptionId: string; reason?: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_revoke_student_subscription", {
      _id: data.subscriptionId,
      ...(data.reason ? { _reason: data.reason } : {}),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSavePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string | null; plan: Record<string, unknown> }) => input)
  .handler(async ({ data, context }): Promise<SubscriptionPlan> => {
    const { data: row, error } = await context.supabase.rpc("admin_upsert_plan", {
      _plan: data.plan as never,
      ...(data.id ? { _id: data.id } : {}),
    });
    if (error) throw new Error(error.message);
    return row as unknown as SubscriptionPlan;
  });

export const adminSavePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      method?: string;
      number?: string;
      instructions?: string;
      maxMb?: number;
    }) => input,
  )
  .handler(async ({ data, context }): Promise<PaymentSettings> => {
    const { data: row, error } = await context.supabase.rpc(
      "admin_update_payment_settings",
      {
        ...(data.method !== undefined ? { _method: data.method } : {}),
        ...(data.number !== undefined ? { _number: data.number } : {}),
        ...(data.instructions !== undefined ? { _instructions: data.instructions } : {}),
        ...(data.maxMb !== undefined ? { _max_mb: data.maxMb } : {}),
      },
    );
    if (error) throw new Error(error.message);
    return row as unknown as PaymentSettings;
  });
