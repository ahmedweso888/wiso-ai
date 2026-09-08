//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-BGio38dy.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/home/project/src/routes/__root.tsx",
		children: [
			"/",
			"/_authenticated",
			"/auth"
		],
		preloads: ["/assets/index-B8f3ITJ9.js", "/assets/react-OrosJ8bI.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-B8f3ITJ9.js"
		} }]
	},
	"/": {
		filePath: "/home/project/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-Dma-ga1V.js",
			"/assets/createLucideIcon-14Z0IIOo.js",
			"/assets/Footer-Ve7Nxx_v.js"
		]
	},
	"/_authenticated": {
		filePath: "/home/project/src/routes/_authenticated/route.tsx",
		children: ["/_authenticated/dashboard", "/_authenticated/admin/ai"],
		preloads: ["/assets/route-DRxznx3E.js"]
	},
	"/auth": {
		filePath: "/home/project/src/routes/auth.tsx",
		children: void 0,
		preloads: [
			"/assets/auth-DP-KrNrL.js",
			"/assets/createLucideIcon-14Z0IIOo.js",
			"/assets/dist-BuoKMScG.js",
			"/assets/Footer-Ve7Nxx_v.js"
		]
	},
	"/_authenticated/dashboard": {
		filePath: "/home/project/src/routes/_authenticated/dashboard.tsx",
		children: void 0,
		preloads: ["/assets/dashboard-aGMxiwiU.js"]
	},
	"/_authenticated/admin/ai": {
		filePath: "/home/project/src/routes/_authenticated/admin.ai.tsx",
		children: void 0,
		preloads: [
			"/assets/admin.ai-CHe5_zyW.js",
			"/assets/createLucideIcon-14Z0IIOo.js",
			"/assets/dist-BuoKMScG.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
