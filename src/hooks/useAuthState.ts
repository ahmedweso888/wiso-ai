import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AccessReason =
  | "admin"
  | "trial"
  | "subscription"
  | "admin_granted"
  | "permanent_access"
  | "trial_expired"
  | "subscription_expired"
  | "subscription_cancelled"
  | "suspended"
  | "maintenance"
  | "platform_closed"
  | "window_not_open"
  | "window_closed"
  | "no_profile"
  | "unauthenticated";

export type AccessState = {
  allowed: boolean;
  reason: AccessReason;
  is_admin?: boolean;
  expires_at?: string | null;
  trial_expires_at?: string | null;
  suspended_reason?: string | null;
  platform_status?: "open" | "closed" | "maintenance";
  window_start?: string | null;
  window_end?: string | null;
};

/**
 * Session state. `supabase.auth.getUser()` re-validates with the auth server,
 * so it is the trusted identity source; the session is only used for tokens.
 */
export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["access"] });
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  return { session, user, ready };
}

/** Ensures the profile row (and its immutable public user_code) exists. */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.rpc("ensure_profile", {});
      if (error) throw error;
      return (data as unknown as Profile) ?? null;
    },
  });
}

/**
 * The single source of truth for platform access. Computed server side by the
 * `access_state` database function — never from local timers or storage.
 */
export function useAccess(userId: string | undefined) {
  return useQuery({
    queryKey: ["access", userId],
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<AccessState> => {
      const { data, error } = await supabase.rpc("access_state", {
        _user_id: userId as string,
      });
      if (error) throw error;
      return data as unknown as AccessState;
    },
  });
}

export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId as string)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });
}

export async function signOutEverywhere(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
}
