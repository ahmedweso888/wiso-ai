import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/common/Footer";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Study Agent — دخول الطلاب" },
      {
        name: "description",
        content: "سجّل دخولك أو اعمل حساب جديد، وخد كود طالب خاص بيك وتجربة 24 ساعة.",
      },
      { property: "og:title", content: "Study Agent — دخول الطلاب" },
      { property: "og:description", content: "حساب واحد لخطة المعركة ومحرك الأسئلة التقيلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
      return;
    }
    void navigate({ to: "/" });
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
      return;
    }
    if (!data.session) {
      toast.success("بصّ في إيميلك وأكّد الحساب.");
      return;
    }
    void navigate({ to: "/" });
  }

  async function forgotPassword() {
    if (!email) {
      toast.error("اكتب إيميلك الأول.");
      return;
    }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    toast.success("بعتنالك لينك لو الإيميل مسجّل عندنا.");
  }

  return (
    <div dir="rtl" className="hero-glow flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">Study Agent</span>
        </Link>

        <div className="mb-5 text-center">
          <h1 className="font-display text-2xl font-extrabold">يلا نبدأ ونخلص اللي ورانا 🔥</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            دخول واحد، وبعدها خطة المعركة والأسئلة التقيلة.
          </p>
        </div>

        <div className="surface-panel p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">دخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">الإيميل</Label>
                  <Input
                    id="login-email"
                    type="email"
                    dir="ltr"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">الباسورد</Label>
                  <Input
                    id="login-password"
                    type="password"
                    dir="ltr"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "لحظة..." : "يلا ندخل"}
                </Button>
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  نسيت الباسورد؟
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-5">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">اسمك بالكامل</Label>
                  <Input
                    id="reg-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">الإيميل</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    dir="ltr"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">الباسورد</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    dir="ltr"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "لحظة..." : "اعمل حسابي"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  هتاخد كود طالب خاص بيك وتجربة مجانية 24 ساعة.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
