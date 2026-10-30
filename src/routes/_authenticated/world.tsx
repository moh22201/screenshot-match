import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { regionsQuery, STATUS_LABEL, claimErrorMessage, type Region } from "@/lib/regions";

const WorldMap3D = lazy(() => import("@/components/WorldMap3D"));

export const Route = createFileRoute("/_authenticated/world")({
  head: () => ({
    meta: [
      { title: "خريطة العالم — VORTERRA" },
      { name: "description", content: "اختر منطقة البداية على خريطة عالم VORTERRA." },
      { property: "og:title", content: "خريطة العالم — VORTERRA" },
      { property: "og:description", content: "مربعات قابلة للاختيار لبدء نشاطك الاقتصادي." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(regionsQuery),
  component: WorldPage,
});

const FIELDS: [keyof Region, string][] = [
  ["terrain", "الطبيعة الجغرافية"],
  ["resources", "الموارد الطبيعية"],
  ["extraction_sites", "مواقع التعدين والمحاجر والغابات"],
  ["industrial_land", "الأراضي والمواقع الصناعية"],
  ["transport", "الطرق والسكك والموانئ"],
  ["utilities", "الكهرباء والمياه"],
  ["market_access", "القرب من الأسواق والمواد الخام"],
  ["advantages", "المميزات"],
  ["constraints", "القيود"],
  ["start_conditions", "شروط بدء النشاط"],
  ["usage_fee", "رسوم الاستغلال"],
];

function WorldPage() {
  const { user } = Route.useRouteContext();
  const { data: regions } = useSuspenseQuery(regionsQuery);
  const [selectedId, setSelectedId] = useState<number>();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const mine = regions.find((r) => r.owner_id === user.id);
  const sel = regions.find((r) => r.id === selectedId);

  const claim = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("claim_region", { _region_id: id });
      if (error) throw error;
    },
    onSuccess: async (_d, id) => {
      await qc.invalidateQueries({ queryKey: ["regions"] });
      toast.success("تم تثبيت منطقة البداية");
      navigate({ to: "/region/$id", params: { id: String(id) } });
    },
    onError: (e: Error) => {
      toast.error(claimErrorMessage(e.message));
      qc.invalidateQueries({ queryKey: ["regions"] });
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const counts = regions.reduce<Record<string, number>>((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0 touch-none">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">جارٍ تحميل الخريطة…</div>}>
          <WorldMap3D regions={regions} myId={mine?.id} selectedId={selectedId} onSelect={setSelectedId} />
        </Suspense>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-lg border bg-card px-3 py-2 shadow-panel">
          <div className="font-display text-lg text-primary" dir="ltr">VORTERRA</div>
          <div className="text-xs text-muted-foreground">خريطة العالم</div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          {mine && (
            <Button size="sm" asChild>
              <Link to="/region/$id" params={{ id: String(mine.id) }}>منطقتي</Link>
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={signOut}>خروج</Button>
        </div>
      </header>

      <div className="pointer-events-none absolute top-20 right-3 rounded-lg border bg-card p-2 text-xs shadow-panel">
        <Legend cls="bg-status-available" label={`متاحة (${counts["available"] ?? 0})`} />
        <Legend cls="bg-status-reserved" label={`محجوزة (${counts["reserved"] ?? 0})`} />
        <Legend cls="bg-status-unavailable" label={`غير متاحة (${counts["unavailable"] ?? 0})`} />
        <Legend cls="bg-status-mine" label="منطقتي" />
      </div>

      {sel && (
        <aside className="absolute inset-x-0 bottom-0 max-h-[60dvh] overflow-y-auto rounded-t-2xl border bg-card p-4 shadow-panel md:inset-x-auto md:bottom-4 md:left-4 md:w-96 md:rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl">{sel.name}</h2>
              <p className="text-xs text-muted-foreground">
                رقم {sel.id} · الموقع ({sel.grid_x + 1}، {sel.grid_y + 1})
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs">
              {sel.id === mine?.id ? "منطقتك" : STATUS_LABEL[sel.status]}
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {FIELDS.map(([k, label]) => {
              const v = sel[k];
              const text = Array.isArray(v) ? v.join("، ") : (v as string | null);
              return (
                <div key={k} className="flex justify-between gap-4 border-b border-border/40 pb-1">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-left">{text || <span className="text-muted-foreground/60">غير محددة بعد</span>}</dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 flex gap-2">
            {sel.status === "available" && !mine && (
              <Button className="flex-1" disabled={claim.isPending} onClick={() => claim.mutate(sel.id)}>
                {claim.isPending ? "جارٍ الحجز…" : "تأكيد اختيار منطقة البداية"}
              </Button>
            )}
            {sel.id === mine?.id && (
              <Button className="flex-1" asChild>
                <Link to="/region/$id" params={{ id: String(sel.id) }}>ادخل المنطقة</Link>
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSelectedId(undefined)}>إغلاق</Button>
          </div>
          {mine && sel.id !== mine.id && sel.status === "available" && (
            <p className="mt-2 text-xs text-muted-foreground">لديك منطقة بداية بالفعل.</p>
          )}
        </aside>
      )}
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={`h-3 w-3 rounded-sm ${cls}`} />
      {label}
    </div>
  );
}
