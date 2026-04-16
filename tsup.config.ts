import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    banner: { js: "#!/usr/bin/env node" },
    outDir: "dist",
    clean: true,
    sourcemap: true,
    dts: false,
  },
  {
    entry: { mcp: "src/mcp.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    banner: { js: "#!/usr/bin/env node" },
    outDir: "dist",
    sourcemap: true,
    dts: true,
  },
]);
