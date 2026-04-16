import type { Command } from "commander";
import type { GetApis } from "./shared.js";

export function rebuildCommand(program: Command, getApis: GetApis): void {
  program
    .command("rebuild <token>")
    .description("Rollback a deployment by rebuild from a previous token")
    .action(async (token, _opts, cmd) => {
      const { deploy } = getApis(cmd);
      const result = await deploy.rebuild(token);
      console.log(`Type: ${result.type}`);
      console.log(`New token: ${result.token}`);

      if (result.type === "symlink") {
        console.log("Symlink rollback completed instantly.");
      } else {
        console.log("Rebuild triggered. Use 'goploy wait <token>' to monitor.");
      }
    });
}
