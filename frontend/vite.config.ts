import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		federation({
			name: "remoteApp",
			filename: "remoteEntry.js",
			shared: [
				"react",
				"react-dom",
				"zustand",
				"immer",
				"react-router",
				"axios",
			],
		}),
	],
	build: {
		target: "esnext",
		minify: true,
		outDir: "dist",
	},
});
