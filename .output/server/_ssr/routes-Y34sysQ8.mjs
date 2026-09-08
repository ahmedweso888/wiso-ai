import { n as __toESM } from "../_runtime.mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { c as CalendarClock, i as Flame, l as BrainCircuit, n as Skull, r as ShieldCheck, t as Target } from "../_libs/lucide-react.mjs";
import { t as Footer } from "./Footer-D_059AWg.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Y34sysQ8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Product-wide constants. The whole planner is anchored to this deadline.
*/
var SYLLABUS_DEADLINE = /* @__PURE__ */ new Date("2027-01-01T00:00:00Z");
function countdownTo(target, from = /* @__PURE__ */ new Date()) {
	const diff = target.getTime() - from.getTime();
	if (diff <= 0) return {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		expired: true
	};
	const seconds = Math.floor(diff / 1e3);
	return {
		days: Math.floor(seconds / 86400),
		hours: Math.floor(seconds % 86400 / 3600),
		minutes: Math.floor(seconds % 3600 / 60),
		seconds: seconds % 60,
		expired: false
	};
}
var UNITS = [
	{
		key: "days",
		label: "يوم"
	},
	{
		key: "hours",
		label: "ساعة"
	},
	{
		key: "minutes",
		label: "دقيقة"
	},
	{
		key: "seconds",
		label: "ثانية"
	}
];
function DeadlineCountdown({ className }) {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(id);
	}, []);
	const remaining = countdownTo(SYLLABUS_DEADLINE, now ?? SYLLABUS_DEADLINE);
	const ready = now !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			ease: "easeOut"
		},
		className: cn("glass-panel p-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-muted-foreground",
					children: "قدامك لحد"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num text-xs font-semibold tracking-widest text-primary",
					children: "01 / 01 / 2027"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-4 gap-2",
				dir: "ltr",
				children: UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-hairline bg-surface-2/60 px-2 py-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num block font-display text-2xl font-bold leading-none sm:text-3xl",
						children: ready ? String(remaining[unit.key]).padStart(2, "0") : "--"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-[0.65rem] text-muted-foreground",
						children: unit.label
					})]
				}, unit.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs leading-relaxed text-muted-foreground",
				children: remaining.expired ? "المنهج المفروض خلص. دلوقتي بنكسر الأسئلة الصعبة بس." : "هدفنا واضح: نقفل المنهج كله، وبعدها نبدأ نكسر أصعب الأسئلة."
			})
		]
	});
}
var PILLARS = [
	{
		icon: CalendarClock,
		title: "خطة المعركة",
		body: "من السنة للشهر للأسبوع لليوم لجلسة المذاكرة، وكل مهمة معاها عدد أسئلة وساعات محسوبة."
	},
	{
		icon: Flame,
		title: "أسئلة تقيلة بالجملة",
		body: "صعب، صعب جداً، ووضع التعجيز. الصعوبة على الفهم مش على طول السؤال."
	},
	{
		icon: Target,
		title: "إيه اللي معطلك؟",
		body: "كل غلطة بتتصنّف وبتترجع لك في شكل أسئلة موجّهة لحد ما النقطة تسيبك."
	},
	{
		icon: ShieldCheck,
		title: "مفيش أسئلة من الهوا",
		body: "كل سؤال مربوط بمصدر من كتبك وصور حصصك، ومعاه خط تحقق كامل."
	}
];
var MASTERY = [
	{
		label: "BASIC",
		value: 96
	},
	{
		label: "HARD",
		value: 81
	},
	{
		label: "VERY HARD",
		value: 64
	},
	{
		label: "NIGHTMARE",
		value: 37
	}
];
function Landing() {
	const remaining = countdownTo(SYLLABUS_DEADLINE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "flex min-h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hero-glow flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrainCircuit, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-bold",
						children: "Study Agent"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "يلا نبدأ"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-5 pb-16 pt-8 sm:pt-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .55,
							ease: "easeOut"
						},
						className: "grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "glass-panel inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "size-3.5 text-nightmare" }), "مركز قيادة المذاكرة — مش منصة دروس"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-4 max-w-2xl font-display text-3xl font-extrabold leading-[1.25] sm:text-5xl",
								children: [
									"اقفل المنهج كله. وبعدها ابدأ",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-primary",
										children: "تكسر"
									}),
									" أصعب الأسئلة."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-xl text-base leading-relaxed text-muted-foreground",
								children: "ارفع كتبك وصور الحصص، واحنا نطلعلك خريطة المنهج وخطة معركة بتنتهي في 1 يناير 2027، وبعدها أسئلة تقيلة بالجملة مع تحليل لكل غلطة."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "ابدأ التجربة المجانية 24 ساعة"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"باقي",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num font-semibold text-primary",
											children: remaining.days
										}),
										" يوم على الموعد النهائي."
									]
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeadlineCountdown, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mt-14 grid gap-4 sm:grid-cols-2",
						children: PILLARS.map((pillar, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
							initial: {
								opacity: 0,
								y: 14
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: {
								once: true,
								amount: .3
							},
							transition: {
								duration: .4,
								delay: index * .06,
								ease: "easeOut"
							},
							className: "surface-panel p-5 transition-colors hover:border-primary/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-10 items-center justify-center rounded-xl bg-secondary text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(pillar.icon, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-lg font-bold",
									children: pillar.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
									children: pillar.body
								})
							]
						}, pillar.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "surface-panel mt-6 p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-bold",
								children: "الهدف مش إنك تحل السهل"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "الهدف إنك تبقى جاهز للصعب. كل مستوى بيتقاس لوحده."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num text-xs text-muted-foreground",
								children: "مثال لمستوى الإتقان"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 space-y-3.5",
							children: MASTERY.map((tier, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-mono tracking-widest text-muted-foreground",
									children: tier.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num font-semibold",
									children: [tier.value, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 h-2 overflow-hidden rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									initial: { width: 0 },
									whileInView: { width: `${tier.value}%` },
									viewport: { once: true },
									transition: {
										duration: .9,
										delay: index * .1,
										ease: "easeOut"
									},
									className: "h-full rounded-full bg-primary"
								})
							})] }, tier.label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "surface-panel mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold",
							children: "وضع التعجيز ☠️"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground",
							children: "هنا مفيش أسئلة سهلة. هنا بنشوف إنت فاهم بجد ولا حافظ. لو خلصت المجموعة من غير ما تتبهدل شوية، يبقى إنت جامد."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "وريني الأسئلة التقيلة"
							})
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})]
	});
}
//#endregion
export { Landing as component };
