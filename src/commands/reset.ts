import type { Command } from "commander";
import type { GetApis } from "./shared.js";

export function resetCommand(program: Command, getApis: GetApis): void {
  program
    .command("reset <project>")
    .description("Reset a stuck project's deploy state")
    .action(async (projectQuery, _opts, cmd) => {
      const { deploy, project } = getApis(cmd);

      const resolved = await project.resolveProject(projectQuery);
      if (!resolved.project) {
        console.error("Multiple projects matched:");
        for (const c of resolved.candidates!) {
          console.error(`  ${c.id}\t${c.name}`);
        }
        process.exit(1);
      }

      await deploy.resetState(resolved.project.id);
      console.log(`Project "${resolved.project.name}" state has been reset.`);
    });
}
