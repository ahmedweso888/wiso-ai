import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DhHTr4KJ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { t as Label } from "./label-B4PTMSG2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as BrainCircuit } from "../_libs/lucide-react.mjs";
import { t as Footer } from "./Footer-D_059AWg.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BDKJu2rq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function AuthPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	async function signIn(event) {
		event.preventDefault();
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		setLoading(false);
		if (error) {
			toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
			return;
		}
		navigate({ to: "/" });
	}
	async function signUp(event) {
		event.preventDefault();
		setLoading(true);
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: window.location.origin,
				data: { full_name: fullName }
			}
		});
		setLoading(false);
		if (error) {
			toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
			return;
		}
		if (!data.session) {
			toast.success("بصّ في إيميلك وأكّد الحساب.");
			return;
		}
		navigate({ to: "/" });
	}
	async function forgotPassword() {
		if (!email) {
			toast.error("اكتب إيميلك الأول.");
			return;
		}
		setLoading(true);
		await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
		setLoading(false);
		toast.success("بعتنالك لينك لو الإيميل مسجّل عندنا.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "hero-glow flex min-h-screen flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 items-center justify-center px-5 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-6 flex items-center justify-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrainCircuit, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold",
							children: "Study Agent"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-extrabold",
							children: "يلا نبدأ ونخلص اللي ورانا 🔥"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: "دخول واحد، وبعدها خطة المعركة والأسئلة التقيلة."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "surface-panel p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "login",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "grid w-full grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "login",
										children: "دخول"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "register",
										children: "حساب جديد"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "login",
									className: "mt-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										onSubmit: signIn,
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "login-email",
													children: "الإيميل"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "login-email",
													type: "email",
													dir: "ltr",
													required: true,
													value: email,
													onChange: (e) => setEmail(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "login-password",
													children: "الباسورد"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "login-password",
													type: "password",
													dir: "ltr",
													required: true,
													value: password,
													onChange: (e) => setPassword(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "submit",
												className: "w-full",
												disabled: loading,
												children: loading ? "لحظة..." : "يلا ندخل"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: forgotPassword,
												className: "w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline",
												children: "نسيت الباسورد؟"
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "register",
									className: "mt-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										onSubmit: signUp,
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "reg-name",
													children: "اسمك بالكامل"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "reg-name",
													required: true,
													value: fullName,
													onChange: (e) => setFullName(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "reg-email",
													children: "الإيميل"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "reg-email",
													type: "email",
													dir: "ltr",
													required: true,
													value: email,
													onChange: (e) => setEmail(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "reg-password",
													children: "الباسورد"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "reg-password",
													type: "password",
													dir: "ltr",
													required: true,
													minLength: 8,
													value: password,
													onChange: (e) => setPassword(e.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "submit",
												className: "w-full",
												disabled: loading,
												children: loading ? "لحظة..." : "اعمل حسابي"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-center text-xs text-muted-foreground",
												children: "هتاخد كود طالب خاص بيك وتجربة مجانية 24 ساعة."
											})
										]
									})
								})
							]
						})
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})]
	});
}
//#endregion
export { AuthPage as component };
