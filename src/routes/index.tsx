import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  CalendarClock,
  Flame,
  ShieldCheck,
  Skull,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeadlineCountdown } from "@/components/common/DeadlineCountdown";
import { Footer } from "@/components/common/Footer";
import { SYLLABUS_DEADLINE } from "@/lib/constants";
import { countdownTo } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study Agent — اقفل المنهج واكسر الأسئلة الصعبة" },
      {
        name: "description",
        content:
          "خطة معركة لحد 1 يناير 2027، أسئلة تقيلة بالجملة، وتحليل لكل غلطة عندك. مش منصة مذاكرة عادية.",
      },
      { property: "og:title", content: "Study Agent — مركز قيادة المذاكرة" },
      {
        property: "og:description",
        content: "اقفل المنهج في وقته، وبعدها ابدأ تكسر أصعب الأسئلة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: CalendarClock,
    title: "خطة المعركة",
    body: "من السنة للشهر للأسبوع لليوم لجلسة المذاكرة، وكل مهمة معاها عدد أسئلة وساعات محسوبة.",
  },
  {
    icon: Flame,
    title: "أسئلة تقيلة بالجملة",
    body: "صعب، صعب جداً، ووضع التعجيز. الصعوبة على الفهم مش على طول السؤال.",
  },
  {
    icon: Target,
    title: "إيه اللي معطلك؟",
    body: "كل غلطة بتتصنّف وبتترجع لك في شكل أسئلة موجّهة لحد ما النقطة تسيبك.",
  },
  {
    icon: ShieldCheck,
    title: "مفيش أسئلة من الهوا",
    body: "كل سؤال مربوط بمصدر من كتبك وصور حصصك، ومعاه خط تحقق كامل.",
  },
];

const MASTERY = [
  { label: "BASIC", value: 96 },
  { label: "HARD", value: 81 },
  { label: "VERY HARD", value: 64 },
  { label: "NIGHTMARE", value: 37 },
];

function Landing() {
  const remaining = countdownTo(SYLLABUS_DEADLINE);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <div className="hero-glow flex-1">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BrainCircuit className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">Study Agent</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">يلا نبدأ</Link>
          </Button>
        </header>

        <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center"
          >
            <div>
              <span className="glass-panel inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <Skull className="size-3.5 text-nightmare" />
                مركز قيادة المذاكرة — مش منصة دروس
              </span>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-[1.25] sm:text-5xl">
                اقفل المنهج كله. وبعدها ابدأ{" "}
                <span className="text-gradient-primary">تكسر</span> أصعب الأسئلة.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                ارفع كتبك وصور الحصص، واحنا نطلعلك خريطة المنهج وخطة معركة بتنتهي في 1 يناير
                2027، وبعدها أسئلة تقيلة بالجملة مع تحليل لكل غلطة.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">ابدأ التجربة المجانية 24 ساعة</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  باقي{" "}
                  <span className="num font-semibold text-primary">{remaining.days}</span> يوم على
                  الموعد النهائي.
                </p>
              </div>
            </div>

            <DeadlineCountdown />
          </motion.div>

          <section className="mt-14 grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
                className="surface-panel p-5 transition-colors hover:border-primary/40"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <pillar.icon className="size-5" />
                </span>
                <h2 className="mt-3 font-display text-lg font-bold">{pillar.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </motion.article>
            ))}
          </section>

          <section className="surface-panel mt-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold">الهدف مش إنك تحل السهل</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  الهدف إنك تبقى جاهز للصعب. كل مستوى بيتقاس لوحده.
                </p>
              </div>
              <span className="num text-xs text-muted-foreground">مثال لمستوى الإتقان</span>
            </div>

            <div className="mt-5 space-y-3.5">
              {MASTERY.map((tier, index) => (
                <div key={tier.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="num font-mono tracking-widest text-muted-foreground">
                      {tier.label}
                    </span>
                    <span className="num font-semibold">{tier.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${tier.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">وضع التعجيز ☠️</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                هنا مفيش أسئلة سهلة. هنا بنشوف إنت فاهم بجد ولا حافظ. لو خلصت المجموعة من غير ما
                تتبهدل شوية، يبقى إنت جامد.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/auth">وريني الأسئلة التقيلة</Link>
            </Button>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
