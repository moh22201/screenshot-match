import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VORTERRA — اختر منطقتك وابنِ إمبراطوريتك الصناعية" },
      { name: "description", content: "لعبة محاكاة اقتصادية وصناعية ثلاثية الأبعاد. ابدأ من خريطة العالم واحجز منطقتك." },
      { property: "og:title", content: "VORTERRA" },
      { property: "og:description", content: "ابدأ من خريطة العالم واحجز منطقة نشاطك الاقتصادي." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-sky flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm tracking-[0.4em] text-muted-foreground">محاكاة اقتصادية · صناعية · استراتيجية</p>
      <h1 className="font-display mt-4 text-6xl text-primary md:text-8xl" dir="ltr">VORTERRA</h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        كل شيء يبدأ من خريطة العالم. اختر مربعك، احجزه، وادخل إلى منطقتك.
      </p>
      <Button asChild size="lg" className="mt-10 px-10">
        <Link to="/world">ادخل إلى خريطة العالم</Link>
      </Button>
    </main>
  );
}
