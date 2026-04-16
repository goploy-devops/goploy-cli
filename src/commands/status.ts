import type { Command } from "commander";
import type { GetApis } from "./shared.js";

export function statusCommand(program: Command, getApis: GetApis): void {
  program
    .command("status <token>")
    .description("Get current deployment status for a token")
    .action(async (token, _opts, cmd) => {
      const { deploy } = getApis(cmd);
      const progress = await deploy.getPublishProgress(token);
      console.log(JSON.stringify(progress, null, 2));
    });
}
