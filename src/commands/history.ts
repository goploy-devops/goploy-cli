import type { Command } from "commander";
import type { GetApis } from "./shared.js";

export function historyCommand(program: Command, getApis: GetApis): void {
  program
    .command("history <project>")
    .description("List recent deployment history for a project")
    .option("--limit <n>", "Max records to return", "20")
    .action(async (projectQuery, opts, cmd) => {
      const { deploy, project } = getApis(cmd);

      // Resolve project
      const resolved = await project.resolveProject(projectQuery);
      if (!resolved.project) {
        console.error("Multiple projects matched:");
        for (const c of resolved.candidates!) {
          console.error(`  ${c.id}\t${c.name}`);
        }
        process.exit(1);
      }

      const data = await deploy.getPreview({
        projectId: resolved.project.id,
        rows: parseInt(opts.limit, 10),
      });

      if (data.list.length === 0) {
        console.log("No deployment history found.");
        return;
      }

      const rows = data.list.map((t) => ({
        Token: t.token,
        State: stateLabel(t.state),
        Publisher: t.publisherName,
        Time: t.insertTime,
      }));
      console.table(rows);
    });
}

function stateLabel(state: number): string {
  switch (state) {
    case 0: return "uninitialized";
    case 1: return "deploying";
    case 2: return "success";
    case 3: return "fail";
    default: return String(state);
  }
}
