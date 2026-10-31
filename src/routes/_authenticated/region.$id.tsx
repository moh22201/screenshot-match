import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { regionsQuery } from "@/lib/regions";
import { locationLabel } from "@/lib/world-geography";

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
  const r = data.find((x) => x.id === Number(id));
  if (!r) return null;
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0 touch-none">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">جارٍ تحميل المنطقة…</div>}>
          <RegionScene3D />
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
    </div>
  );
}
