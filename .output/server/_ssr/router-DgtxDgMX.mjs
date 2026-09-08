import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DhHTr4KJ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, k as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DgtxDgMX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-s3ltIM7m.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
/**
* Session state. `supabase.auth.getUser()` re-validates with the auth server,
* so it is the trusted identity source; the session is only used for tokens.
*/
function useSession() {
	const queryClient = useQueryClient();
	const [session, setSession] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
			if (!active) return;
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
				queryClient.invalidateQueries({ queryKey: ["profile"] });
				queryClient.invalidateQueries({ queryKey: ["access"] });
			}
		});
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session);
			setUser(data.session?.user ?? null);
			setReady(true);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, [queryClient]);
	return {
		session,
		user,
		ready
	};
}
/** Ensures the profile row (and its immutable public user_code) exists. */
function useProfile(userId) {
	return useQuery({
		queryKey: ["profile", userId],
		enabled: Boolean(userId),
		staleTime: 3e4,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("ensure_profile", {});
			if (error) throw error;
			return data ?? null;
		}
	});
}
/**
* The single source of truth for platform access. Computed server side by the
* `access_state` database function — never from local timers or storage.
*/
function useAccess(userId) {
	return useQuery({
		queryKey: ["access", userId],
		enabled: Boolean(userId),
		refetchInterval: 6e4,
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("access_state", { _user_id: userId });
			if (error) throw error;
			return data;
		}
	});
}
function useIsAdmin(userId) {
	return useQuery({
		queryKey: ["is-admin", userId],
		enabled: Boolean(userId),
		staleTime: 6e4,
		queryFn: async () => {
			const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
			if (error) throw error;
			return Boolean(data);
		}
	});
}
async function signOutEverywhere(queryClient) {
	await queryClient.cancelQueries();
	queryClient.clear();
	await supabase.auth.signOut();
}
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const queryClient = useQueryClient();
	const { session, user, ready } = useSession();
	const profileQuery = useProfile(user?.id);
	const accessQuery = useAccess(user?.id);
	const adminQuery = useIsAdmin(user?.id);
	const value = (0, import_react.useMemo)(() => ({
		session,
		user,
		profile: profileQuery.data ?? null,
		access: accessQuery.data ?? null,
		isAdmin: adminQuery.data ?? false,
		isAuthenticated: Boolean(user),
		loading: !ready || Boolean(user) && (profileQuery.isPending || accessQuery.isPending),
		signOut: () => signOutEverywhere(queryClient)
	}), [
		session,
		user,
		ready,
		profileQuery.data,
		profileQuery.isPending,
		accessQuery.data,
		accessQuery.isPending,
		adminQuery.data,
		queryClient
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lovable App" },
			{
				name: "description",
				content: "Lovable Generated Project"
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Lovable App"
			},
			{
				property: "og:description",
				content: "Lovable Generated Project"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })] })
	});
}
var $$splitComponentImporter$4 = () => import("./routes-Y34sysQ8.mjs");
var Route$4 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Study Agent — اقفل المنهج واكسر الأسئلة الصعبة" },
		{
			name: "description",
			content: "خطة معركة لحد 1 يناير 2027، أسئلة تقيلة بالجملة، وتحليل لكل غلطة عندك. مش منصة مذاكرة عادية."
		},
		{
			property: "og:title",
			content: "Study Agent — مركز قيادة المذاكرة"
		},
		{
			property: "og:description",
			content: "اقفل المنهج في وقته، وبعدها ابدأ تكسر أصعب الأسئلة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./route-Di7iQBCH.mjs");
var Route$3 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./auth-BDKJu2rq.mjs");
var Route$2 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Study Agent — دخول الطلاب" },
		{
			name: "description",
			content: "سجّل دخولك أو اعمل حساب جديد، وخد كود طالب خاص بيك وتجربة 24 ساعة."
		},
		{
			property: "og:title",
			content: "Study Agent — دخول الطلاب"
		},
		{
			property: "og:description",
			content: "حساب واحد لخطة المعركة ومحرك الأسئلة التقيلة."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./dashboard-BxBXtsYG.mjs");
var Route$1 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "لوحة الطالب — WISO" },
		{
			name: "description",
			content: "متابعة خطتك الدراسية وتقدمك اليومي في WISO."
		},
		{
			property: "og:title",
			content: "لوحة الطالب — WISO"
		},
		{
			property: "og:description",
			content: "متابعة خطتك الدراسية وتقدمك اليومي في WISO."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin.ai-D63dXKDy.mjs");
var Route = createFileRoute("/_authenticated/admin/ai")({
	head: () => ({ meta: [
		{ title: "إعدادات ذكاء WISO — لوحة الإدارة" },
		{
			name: "description",
			content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ."
		},
		{
			property: "og:title",
			content: "إعدادات ذكاء WISO — لوحة الإدارة"
		},
		{
			property: "og:description",
			content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$5
});
var AuthenticatedRouteRoute = Route$3.update({
	id: "/_authenticated",
	getParentRoute: () => Route$5
});
var AuthRoute = Route$2.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$5
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedDashboardRoute: Route$1.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedAdminAiRoute: Route.update({
		id: "/admin/ai",
		path: "/admin/ai",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
