import { n as __toESM } from "../_runtime.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as supabase } from "./client-DhHTr4KJ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { t as Label } from "./label-B4PTMSG2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { a as ChevronUp, o as ChevronDown, s as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.ai-D63dXKDy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
/** The single WISO default model. */
var WISO_DEFAULT_MODEL = "openai/gpt-5.6-sol";
var MODEL_CATALOG = { openai: [
	{
		id: "openai/gpt-5.6-sol",
		label: "GPT-5.6 Sol — الأقوى"
	},
	{
		id: "openai/gpt-5.6-terra",
		label: "GPT-5.6 Terra — متوازن"
	},
	{
		id: "openai/gpt-5.6-luna",
		label: "GPT-5.6 Luna — سريع واقتصادي"
	}
] };
/** Every model id WISO is allowed to run. */
var SUPPORTED_MODEL_IDS = MODEL_CATALOG.openai.map((m) => m.id);
function normalizeModelId(model) {
	if (!model) return WISO_DEFAULT_MODEL;
	const withVendor = model.includes("/") ? model : `openai/${model}`;
	return SUPPORTED_MODEL_IDS.includes(withVendor) ? withVendor : WISO_DEFAULT_MODEL;
}
var PROVIDER_LABELS = { openai: "WISO AI (GPT-5.6)" };
function statusOf(s) {
	if (s.ai_emergency_disabled) return {
		label: "متوقف — إيقاف طوارئ",
		tone: "text-destructive"
	};
	if (!s.enabled || !s.ai_mode_enabled) return {
		label: "متوقف",
		tone: "text-muted-foreground"
	};
	return {
		label: "يعمل",
		tone: "text-primary"
	};
}
function AdminAiSettingsPage() {
	const queryClient = useQueryClient();
	const [model, setModel] = (0, import_react.useState)("");
	const settingsQuery = useQuery({
		queryKey: ["admin", "ai-settings"],
		queryFn: async () => {
			const { data, error } = await supabase.from("ai_settings").select("*").maybeSingle();
			if (error) throw error;
			if (!data) throw new Error("لا توجد إعدادات ذكاء اصطناعي.");
			return data;
		}
	});
	const settings = settingsQuery.data;
	(0, import_react.useEffect)(() => {
		if (settings) setModel(normalizeModelId(settings.model));
	}, [settings]);
	const update = useMutation({
		mutationFn: async (patch) => {
			const { data, error } = await supabase.rpc("admin_update_ai_settings", patch);
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["admin", "ai-settings"], data);
			toast.success("تم حفظ الإعدادات");
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : "تعذّر الحفظ";
			toast.error(message === "forbidden" ? "هذه الصفحة للمشرفين فقط" : message);
		}
	});
	if (settingsQuery.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "mx-auto max-w-2xl space-y-4 px-6 py-14",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })]
	});
	if (settingsQuery.isError || !settings) {
		const message = settingsQuery.error instanceof Error ? settingsQuery.error.message : "خطأ غير معروف";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			dir: "rtl",
			className: "mx-auto max-w-2xl px-6 py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "إعدادات ذكاء WISO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: message.includes("permission") || message.includes("forbidden") ? "هذه الصفحة متاحة للمشرفين فقط." : `تعذّر تحميل الإعدادات: ${message}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => settingsQuery.refetch(),
					children: "إعادة المحاولة"
				})
			]
		});
	}
	const status = statusOf(settings);
	const saving = update.isPending;
	const currentModel = normalizeModelId(settings.model);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		dir: "rtl",
		className: "mx-auto max-w-2xl px-6 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "إعدادات ذكاء WISO"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: PROVIDER_LABELS.openai
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: `text-sm font-semibold ${status.tone}`,
					children: ["الحالة: ", status.label]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "divide-y divide-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-6 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-enabled",
							className: "text-base",
							children: "تفعيل الذكاء الاصطناعي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "إيقافه يمنع كل مهام الذكاء الاصطناعي في المنصة."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "ai-enabled",
							disabled: saving,
							checked: settings.enabled && settings.ai_mode_enabled,
							onCheckedChange: (checked) => update.mutate({
								_enabled: checked,
								_ai_mode_enabled: checked
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-6 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-emergency",
							className: "text-base",
							children: "إيقاف طوارئ للذكاء الاصطناعي"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "يوقف كل الطلبات فوراً بغضّ النظر عن باقي الإعدادات."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "ai-emergency",
							disabled: saving,
							checked: settings.ai_emergency_disabled,
							onCheckedChange: (checked) => update.mutate({ _ai_emergency_disabled: checked })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "ai-model",
								className: "text-base",
								children: "النموذج"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "عائلة GPT-5.6 الموحّدة المستخدمة في كل مهام WISO."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: model || currentModel,
									onValueChange: setModel,
									disabled: saving,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "ai-model",
										className: "w-64",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MODEL_CATALOG.openai.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: m.id,
										children: m.label
									}, m.id)) })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: saving || (model || currentModel) === currentModel,
									onClick: () => update.mutate({ _model: model || currentModel }),
									children: saving ? "جاري الحفظ…" : "حفظ النموذج"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-xs text-muted-foreground",
				children: "مفاتيح الوصول للذكاء الاصطناعي تُدار على الخادم فقط ولا تظهر هنا إطلاقاً."
			})
		]
	});
}
//#endregion
export { AdminAiSettingsPage as component };
