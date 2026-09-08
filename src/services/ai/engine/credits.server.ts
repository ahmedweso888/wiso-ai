/**
 * WISO Credit / Quota Reservation.
 *
 * Uses atomic database-side RPCs (reserve_ai_credits / commit_ai_credits /
 * release_ai_credits) to ensure race-safe quota management.
 *
 * Flow:
 *   authenticate → verify entitlement → check quota → atomically reserve
 *   → generation → validation → commit actual usage OR release reservation
 *
 * Prevents: negative balances, double charging, concurrent race conditions,
 * duplicate reservations, charging failed requests, cross-student charging.
 */
import { supabase } from "@/integrations/supabase/client";

export type ResourceType = "questions" | "images" | "pdfs" | "documents";

export type Reservation = {
  id: string;
  requestId: string;
  resourceType: ResourceType;
  amount: number;
};

/**
 * Atomically reserves credits for a pending AI operation.
 * Throws on quota exceeded, no subscription, or authentication failure.
 */
export async function reserveCredits(
  userId: string,
  requestId: string,
  resourceType: ResourceType,
  amount: number,
): Promise<Reservation> {
  const { data, error } = await supabase.rpc("reserve_ai_credits", {
    _request_id: requestId,
    _resource_type: resourceType,
    _amount: amount,
  });

  if (error) {
    if (error.message.startsWith("quota_exceeded")) {
      throw new QuotaExceededError(error.message);
    }
    if (error.message.includes("no active subscription")) {
      throw new NoEntitlementError(error.message);
    }
    throw new Error(`credit_reservation_failed: ${error.message}`);
  }

  return {
    id: data as unknown as string,
    requestId,
    resourceType,
    amount,
  };
}

/** Commits a reservation — the AI call succeeded, usage is final. */
export async function commitCredits(reservationId: string): Promise<void> {
  const { error } = await supabase.rpc("commit_ai_credits", {
    _reservation_id: reservationId,
  });
  if (error) {
    throw new Error(`credit_commit_failed: ${error.message}`);
  }
}

/** Releases a reservation — the AI call failed, quota returned. */
export async function releaseCredits(reservationId: string): Promise<void> {
  const { error } = await supabase.rpc("release_ai_credits", {
    _reservation_id: reservationId,
  });
  if (error) {
    // Best-effort release — log but don't throw on release failure
    console.error(`[wiso] credit release failed for ${reservationId}:`, error.message);
  }
}

/**
 * Safely runs an AI operation with credit reservation.
 * Automatically commits on success or releases on failure.
 */
export async function withCredits<T>(
  userId: string,
  requestId: string,
  resourceType: ResourceType,
  amount: number,
  operation: () => Promise<T>,
): Promise<T> {
  const reservation = await reserveCredits(userId, requestId, resourceType, amount);
  try {
    const result = await operation();
    await commitCredits(reservation.id);
    return result;
  } catch (error) {
    await releaseCredits(reservation.id);
    throw error;
  }
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class NoEntitlementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoEntitlementError";
  }
}
