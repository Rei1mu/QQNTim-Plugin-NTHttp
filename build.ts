import { build } from "esbuild";
import * as fs from "fs-extra";
import * as path from "path";

const s = path.sep;

const isProduction = process.env["NODE_ENV"] == "production";

async function buildPlugin() {
    await fs.ensureDir("dist");
    await build({
        target: "node18",
        bundle: true,
        platform: "node",
        write: true,
        allowOverwrite: true,
        sourcemap: isProduction ? false : "inline",
        minify: isProduction,
        treeShaking: isProduction,
        format: "cjs",
        entryPoints: [`src${s}main.ts`, `src${s}renderer.ts`, `src${s}settings.tsx`],
        outdir: "dist",
        external: ["electron", "react", "react/jsx-runtime", "react-dom", "react-dom/client", "qqntim/main", "qqntim/renderer", "qqntim-settings", "qqntim-settings/components"],
    });
    await fs.copy("publish", "dist");
}

buildPlugin();
