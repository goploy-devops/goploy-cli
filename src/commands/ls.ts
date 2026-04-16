import type { Command } from "commander";
import type { GetApis } from "./shared.js";

export function lsCommand(program: Command, getApis: GetApis): void {
  program
    .command("ls")
    .description("List projects available for deployment")
    .option("--keyword <keyword>", "Filter projects by name")
    .action(async (opts, cmd) => {
      const { project } = getApis(cmd);
      const projects = await project.getList(opts.keyword);

      if (projects.length === 0) {
        console.log("No projects found.");
        return;
      }

      const rows = projects.map((p) => ({
        ID: p.id,
        Name: p.name,
        Branch: p.branch,
        State: stateLabel(p.deployState),
        AutoDeploy: p.autoDeploy ? "Yes" : "No",
      }));
      console.table(rows);
    });
}

function stateLabel(state: number): string {
  switch (state) {
    case 0: return "idle";
    case 1: return "deploying";
    case 2: return "success";
    case 3: return "fail";
    default: return String(state);
  }
}
