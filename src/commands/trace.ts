import type { Command } from "commander";
import type { GetApis } from "./shared.js";
import { PublishTraceTypeLabel } from "../client/types.js";

export function traceCommand(program: Command, getApis: GetApis): void {
  program
    .command("trace <token>")
    .description("Get deployment trace records")
    .option("--detail", "Include full detail text")
    .action(async (token, opts, cmd) => {
      const { deploy } = getApis(cmd);
      const traces = await deploy.getPublishTrace(token);

      for (const t of traces.list) {
        const typeLabel = PublishTraceTypeLabel[t.type] ?? String(t.type);
        const stateIcon = t.state === 2 ? "✓" : t.state === 3 ? "✗" : "…";
        console.log(
          `${stateIcon} [${typeLabel}]${t.serverName ? ` (${t.serverName})` : ""}`
        );
        if (opts.detail && t.id) {
          try {
            const detail = await deploy.getPublishTraceDetail(t.id);
            if (detail.detail) {
              console.log(`  ${detail.detail.replace(/\n/g, "\n  ")}`);
            }
          } catch {
            // skip detail fetch errors
          }
        }
      }
    });
}
