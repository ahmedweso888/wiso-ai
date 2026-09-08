import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MODEL_CATALOG, normalizeModelId, PROVIDER_LABELS } from "@/services/ai/config";
import type { Database } from "@/integrations/supabase/types";

type AiSettings = Database["public"]["Tables"]["ai_settings"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({
    meta: [
      { title: "إعدادات ذكاء WISO — لوحة الإدارة" },
      { name: "description", content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ." },
      { property: "og:title", content: "إعدادات ذكاء WISO — لوحة الإدارة" },
      {
        property: "og:description",
        content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAiSettingsPage,
});

function statusOf(s: AiSettings) {
  if (s.ai_emergency_disabled)
    return { label: "متوقف — إيقاف طوارئ", tone: "text-destructive" };
  if (!s.enabled || !s.ai_mode_enabled)
    return { label: "متوقف", tone: "text-muted-foreground" };
  return { label: "يعمل", tone: "text-primary" };
}

function AdminAiSettingsPage() {
  const queryClient = useQueryClient();
  const [model, setModel] = useState<string>("");

  const settingsQuery = useQuery({
    queryKey: ["admin", "ai-settings"],
    queryFn: async (): Promise<AiSettings> => {
      const { data, error } = await supabase.from("ai_settings").select("*").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("لا توجد إعدادات ذكاء اصطناعي.");
      return data;
    },
  });

  const settings = settingsQuery.data;

  useEffect(() => {
    if (settings) setModel(normalizeModelId(settings.model));
  }, [settings]);

  const update = useMutation({
    mutationFn: async (patch: {
      _model?: string;
      _ai_mode_enabled?: boolean;
      _ai_emergency_disabled?: boolean;
      _enabled?: boolean;
    }): Promise<AiSettings> => {
      const { data, error } = await supabase.rpc("admin_update_ai_settings", patch);
      if (error) throw error;
      return data as unknown as AiSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "ai-settings"], data);
      toast.success("تم حفظ الإعدادات");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "تعذّر الحفظ";
      toast.error(message === "forbidden" ? "هذه الصفحة للمشرفين فقط" : message);
    },
  });

  if (settingsQuery.isPending) {
    return (
      <main dir="rtl" className="mx-auto max-w-2xl space-y-4 px-6 py-14">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (settingsQuery.isError || !settings) {
    const message =
      settingsQuery.error instanceof Error ? settingsQuery.error.message : "خطأ غير معروف";
    return (
      <main dir="rtl" className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-2xl font-bold">إعدادات ذكاء WISO</h1>
        <p className="mt-3 text-sm text-destructive">
          {message.includes("permission") || message.includes("forbidden")
            ? "هذه الصفحة متاحة للمشرفين فقط."
            : `تعذّر تحميل الإعدادات: ${message}`}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => settingsQuery.refetch()}>
          إعادة المحاولة
        </Button>
      </main>
    );
  }

  const status = statusOf(settings);
  const saving = update.isPending;
  const currentModel = normalizeModelId(settings.model);

  return (
    <main dir="rtl" className="mx-auto max-w-2xl px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">إعدادات ذكاء WISO</h1>
          <p className="mt-1 text-sm text-muted-foreground">{PROVIDER_LABELS.openai}</p>
        </div>
        <span className={`text-sm font-semibold ${status.tone}`}>الحالة: {status.label}</span>
      </header>

      <section className="divide-y divide-border">
        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <Label htmlFor="ai-enabled" className="text-base">
              تفعيل الذكاء الاصطناعي
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              إيقافه يمنع كل مهام الذكاء الاصطناعي في المنصة.
            </p>
          </div>
          <Switch
            id="ai-enabled"
            disabled={saving}
            checked={settings.enabled && settings.ai_mode_enabled}
            onCheckedChange={(checked) =>
              update.mutate({ _enabled: checked, _ai_mode_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <Label htmlFor="ai-emergency" className="text-base">
              إيقاف طوارئ للذكاء الاصطناعي
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              يوقف كل الطلبات فوراً بغضّ النظر عن باقي الإعدادات.
            </p>
          </div>
          <Switch
            id="ai-emergency"
            disabled={saving}
            checked={settings.ai_emergency_disabled}
            onCheckedChange={(checked) => update.mutate({ _ai_emergency_disabled: checked })}
          />
        </div>

        <div className="py-5">
          <Label htmlFor="ai-model" className="text-base">
            النموذج
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            عائلة GPT-5.6 الموحّدة المستخدمة في كل مهام WISO.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Select value={model || currentModel} onValueChange={setModel} disabled={saving}>
              <SelectTrigger id="ai-model" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_CATALOG.openai.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={saving || (model || currentModel) === currentModel}
              onClick={() => update.mutate({ _model: model || currentModel })}
            >
              {saving ? "جاري الحفظ…" : "حفظ النموذج"}
            </Button>
          </div>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        مفاتيح الوصول للذكاء الاصطناعي تُدار على الخادم فقط ولا تظهر هنا إطلاقاً.
      </p>
    </main>
  );
}
