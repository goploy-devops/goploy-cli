import type { Command } from "commander";
import type { GetApis } from "./shared.js";
import { waitForPublish } from "../agent/poll.js";
import { DeployState } from "../client/types.js";

export function waitCommand(program: Command, getApis: GetApis): void {
  program
    .command("wait <token>")
    .description("Wait for a deployment to complete")
    .option("--timeout <seconds>", "Timeout in seconds", "600")
    .action(async (token, opts, cmd) => {
      const { deploy } = getApis(cmd);
      console.log("Waiting for deployment to complete...");

      const result = await waitForPublish(deploy, token, {
        timeoutSec: parseInt(opts.timeout, 10),
        onProgress: (p) => {
          if (p.state === DeployState.Deploying) {
            process.stdout.write(`\r  Stage: ${p.stage} - ${p.message}`);
          }
        },
      });

      console.log(); // newline
      console.log(JSON.stringify(result, null, 2));

      if (result.finalState === "fail") {
        process.exit(1);
      }
    });
}
