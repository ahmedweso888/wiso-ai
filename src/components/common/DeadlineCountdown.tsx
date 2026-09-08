import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { SYLLABUS_DEADLINE } from "@/lib/constants";
import { countdownTo, type Countdown } from "@/lib/format";
import { cn } from "@/lib/utils";

const UNITS: { key: keyof Omit<Countdown, "expired">; label: string }[] = [
  { key: "days", label: "يوم" },
  { key: "hours", label: "ساعة" },
  { key: "minutes", label: "دقيقة" },
  { key: "seconds", label: "ثانية" },
];

export function DeadlineCountdown({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = countdownTo(SYLLABUS_DEADLINE, now ?? SYLLABUS_DEADLINE);
  const ready = now !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("glass-panel p-5", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">قدامك لحد</p>
        <p className="num text-xs font-semibold tracking-widest text-primary">01 / 01 / 2027</p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" dir="ltr">
        {UNITS.map((unit) => (
          <div
            key={unit.key}
            className="rounded-xl border border-hairline bg-surface-2/60 px-2 py-3 text-center"
          >
            <span className="num block font-display text-2xl font-bold leading-none sm:text-3xl">
              {ready ? String(remaining[unit.key]).padStart(2, "0") : "--"}
            </span>
            <span className="mt-1 block text-[0.65rem] text-muted-foreground">{unit.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {remaining.expired
          ? "المنهج المفروض خلص. دلوقتي بنكسر الأسئلة الصعبة بس."
          : "هدفنا واضح: نقفل المنهج كله، وبعدها نبدأ نكسر أصعب الأسئلة."}
      </p>
    </motion.div>
  );
}
