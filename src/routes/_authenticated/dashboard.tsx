import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة الطالب — WISO" },
      { name: "description", content: "متابعة خطتك الدراسية وتقدمك اليومي في WISO." },
      { property: "og:title", content: "لوحة الطالب — WISO" },
      { property: "og:description", content: "متابعة خطتك الدراسية وتقدمك اليومي في WISO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main dir="rtl" className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">لوحة الطالب</h1>
      <p className="mt-2 text-muted-foreground">قيد الإعداد.</p>
    </main>
  );
}
