import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — VORTERRA" },
      { name: "description", content: "سجّل الدخول إلى حسابك في VORTERRA." },
      { property: "og:title", content: "تسجيل الدخول — VORTERRA" },
      { property: "og:description", content: "سجّل الدخول لحجز منطقتك في عالم VORTERRA." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/world" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: window.location.origin + "/world" },
        });
        if (error) throw error;
        toast.success("تحقق من بريدك الإلكتروني لتأكيد الحساب");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error(String((r.error as Error).message ?? r.error)); return; }
    if (r.redirected) { return; }
    navigate({ to: "/world" });
  }

  return (
    <main className="bg-sky flex min-h-screen items-center justify-center px-4">
      <div className="shadow-panel w-full max-w-sm rounded-xl border bg-card p-6">
        <h1 className="font-display text-center text-3xl text-primary" dir="ltr">VORTERRA</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "in" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          <Input type="password" required minLength={6} placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? "دخول" : "إنشاء الحساب"}
          </Button>
        </form>
        <Button variant="secondary" className="mt-3 w-full" onClick={google}>المتابعة باستخدام Google</Button>
        <button className="mt-4 w-full text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </main>
  );
}
