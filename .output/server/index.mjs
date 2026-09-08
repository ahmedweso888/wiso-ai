globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/hero.png": {
		"type": "image/png",
		"etag": "\"52b9f-dhh3AqD9Tz/DU7xLqNmamC9Ygxc\"",
		"mtime": "2026-09-08T02:17:09.045Z",
		"size": 338847,
		"path": "../public/hero.png"
	},
	"/assets/Footer-Ve7Nxx_v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"55d-P38fQC5AkDxDgzFQ0K91T0CnzlY\"",
		"mtime": "2026-09-08T02:17:03.993Z",
		"size": 1373,
		"path": "../public/assets/Footer-Ve7Nxx_v.js"
	},
	"/assets/admin.ai-CHe5_zyW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13db8-v/E79Yj3iHSHwNKU0FRBrICkC0o\"",
		"mtime": "2026-09-08T02:17:03.994Z",
		"size": 81336,
		"path": "../public/assets/admin.ai-CHe5_zyW.js"
	},
	"/assets/auth-DP-KrNrL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2f85-/smbTx7mjbfQVTAEMB8d1qxy0RY\"",
		"mtime": "2026-09-08T02:17:03.995Z",
		"size": 12165,
		"path": "../public/assets/auth-DP-KrNrL.js"
	},
	"/assets/createLucideIcon-14Z0IIOo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8168-LsRRRqcy78Lm/gGI74D6EUAR36A\"",
		"mtime": "2026-09-08T02:17:03.996Z",
		"size": 33128,
		"path": "../public/assets/createLucideIcon-14Z0IIOo.js"
	},
	"/assets/dashboard-aGMxiwiU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15f-Dj+niMdZH0fPUczpu8Z0cv9SPVc\"",
		"mtime": "2026-09-08T02:17:03.997Z",
		"size": 351,
		"path": "../public/assets/dashboard-aGMxiwiU.js"
	},
	"/assets/dist-BuoKMScG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3dad-YB3nAQMbJOF/cxYaHqvBk6r8QM8\"",
		"mtime": "2026-09-08T02:17:03.998Z",
		"size": 15789,
		"path": "../public/assets/dist-BuoKMScG.js"
	},
	"/assets/react-OrosJ8bI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f7a-9Wgz4C3WXKYWr0L2/vDIHU7SG3k\"",
		"mtime": "2026-09-08T02:17:03.998Z",
		"size": 8058,
		"path": "../public/assets/react-OrosJ8bI.js"
	},
	"/assets/route-DRxznx3E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66-jL/FCOC/gXV5WnfLFbR0dRJA/c8\"",
		"mtime": "2026-09-08T02:17:03.999Z",
		"size": 102,
		"path": "../public/assets/route-DRxznx3E.js"
	},
	"/assets/routes-Dma-ga1V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fa08-O4IyYvHGFfE7MH0wtGsOwnEDwkE\"",
		"mtime": "2026-09-08T02:17:04.000Z",
		"size": 129544,
		"path": "../public/assets/routes-Dma-ga1V.js"
	},
	"/assets/styles-s3ltIM7m.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"12cf5-guMR/S9jxoetdd/NJwR+e7PgTzk\"",
		"mtime": "2026-09-08T02:17:04.005Z",
		"size": 77045,
		"path": "../public/assets/styles-s3ltIM7m.css"
	},
	"/بريميوم لوجو ويسو ايجنت.png": {
		"type": "image/png",
		"etag": "\"fed6b-NxXNYa8hUof/e2YFWu/iuvuzGAM\"",
		"mtime": "2026-09-08T02:17:09.045Z",
		"size": 1043819,
		"path": "../public/بريميوم لوجو ويسو ايجنت.png"
	},
	"/assets/index-B8f3ITJ9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"93eae-CoVqlWwWHvLOHtVoYzKzn75ZkP0\"",
		"mtime": "2026-09-08T02:17:03.991Z",
		"size": 605870,
		"path": "../public/assets/index-B8f3ITJ9.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_hBn8Kl = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_hBn8Kl
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
