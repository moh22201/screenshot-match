import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { Building2, Trees, Mountain, Users, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regionsQuery } from "@/lib/regions";
import { locationLabel } from "@/lib/world-geography";
import { STARTER_FACILITIES, type CityFocus } from "@/lib/city-layout";

const RegionScene3D = lazy(() => import("@/components/RegionScene3D"));

export const Route = createFileRoute("/_authenticated/region/$id")({
  head: () => ({
    meta: [
      { title: "منطقتي — VORTERRA" },
      { name: "description", content: "العالم ثلاثي الأبعاد داخل منطقة البداية." },
      { property: "og:title", content: "منطقتي — VORTERRA" },
      { property: "og:description", content: "استكشف منطقتك في عالم VORTERRA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const regions = await context.queryClient.ensureQueryData(regionsQuery);
    const r = regions.find((x) => x.id === Number(params.id));
    if (!r || r.owner_id !== context.user.id) throw redirect({ to: "/world" });
  },
  component: RegionPage,
});

function RegionPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(regionsQuery);
  const [focus, setFocus] = useState<CityFocus>("all");
  const r = data.find((x) => x.id === Number(id));
  if (!r) return null;
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0 touch-none">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">جارٍ تحميل المنطقة…</div>}>
          <RegionScene3D focus={focus} />
        </Suspense>
      </div>
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="rounded-lg border bg-card px-3 py-2 shadow-panel">
          <div className="font-display text-lg">مدينتي <span className="text-primary" dir="ltr">VORTERRA</span></div>
          <div className="text-xs text-muted-foreground">{locationLabel(r.grid_x, r.grid_y)}</div>
        </div>
        <Button className="pointer-events-auto shrink-0" size="sm" variant="secondary" asChild>
          <Link to="/world">خريطة العالم</Link>
        </Button>
      </header>
      <nav aria-label="مرافق المدينة" className="absolute inset-x-3 bottom-4 flex justify-center gap-1 rounded-lg border bg-card p-1.5 shadow-panel md:inset-x-auto md:left-1/2 md:-translate-x-1/2">
        <Button size="icon" title="عرض المدينة كاملة" aria-label="عرض المدينة كاملة" variant={focus === "all" ? "default" : "ghost"} onClick={() => setFocus("all")}><Scan className="size-4" /></Button>
        {STARTER_FACILITIES.map((facility) => {
          const Icon = { commercial: Building2, recruitment: Users, forest: Trees, quarry: Mountain }[facility.id];
          return <Button key={facility.id} title={facility.label} aria-label={facility.label} variant={focus === facility.id ? "default" : "ghost"} className="h-auto min-h-10 min-w-0 flex-1 flex-col gap-1 px-2 py-2 text-[10px] md:flex-row md:text-xs" onClick={() => setFocus(facility.id)}><Icon className="size-4 shrink-0" /><span>{facility.label}</span></Button>;
        })}
      </nav>
    </div>
  );
}
