import type { Command } from "commander";
import type { GetApis } from "./shared.js";
import { waitForPublish } from "../agent/poll.js";
import { DeployState } from "../client/types.js";

export function publishCommand(program: Command, getApis: GetApis): void {
  program
    .command("publish <project>")
    .description("Trigger a deployment for a project")
    .option("--branch <branch>", "Branch to deploy")
    .option("--commit <commit>", "Specific commit hash")
    .option("--servers <ids>", "Comma-separated server IDs", parseServerIds)
    .option("--wait", "Wait for deployment to complete")
    .option("--timeout <seconds>", "Timeout in seconds when using --wait", "600")
    .action(async (projectQuery, opts, cmd) => {
      const { deploy, project } = getApis(cmd);

      // Resolve project
      const resolved = await project.resolveProject(projectQuery);
      if (!resolved.project) {
        console.error("Multiple projects matched:");
        for (const c of resolved.candidates!) {
          console.error(`  ${c.id}\t${c.name}`);
        }
        console.error("Please use the exact project name or ID.");
        process.exit(1);
      }

      console.log(`Publishing ${resolved.project.name} (ID: ${resolved.project.id})...`);

      const result = await deploy.publish({
        projectId: resolved.project.id,
        branch: opts.branch,
        commit: opts.commit,
        serverIds: opts.servers,
      });

      console.log(`Token: ${result.token}`);

      if (opts.wait) {
        console.log("Waiting for deployment to complete...");
        const waitResult = await waitForPublish(deploy, result.token, {
          timeoutSec: parseInt(opts.timeout, 10),
          onProgress: (p) => {
            if (p.state === DeployState.Deploying) {
              process.stdout.write(`\r  Stage: ${p.stage} - ${p.message}`);
            }
          },
        });
        console.log(); // newline after progress
        console.log(`Result: ${waitResult.finalState}`);
        if (waitResult.traceSummary) {
          console.log("Trace:\n" + waitResult.traceSummary);
        }
        if (waitResult.finalState === "fail") {
          process.exit(1);
        }
      }
    });
}

function parseServerIds(value: string): number[] {
  return value.split(",").map((s) => parseInt(s.trim(), 10));
}
