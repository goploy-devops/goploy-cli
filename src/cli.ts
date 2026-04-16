import { Command } from "commander";
import { loadConfig } from "./config.js";
import { GoployClient } from "./client/index.js";
import { DeployApi } from "./client/deploy.js";
import { ProjectApi } from "./client/project.js";
import { lsCommand } from "./commands/ls.js";
import { publishCommand } from "./commands/publish.js";
import { statusCommand } from "./commands/status.js";
import { waitCommand } from "./commands/wait.js";
import { traceCommand } from "./commands/trace.js";
import { rebuildCommand } from "./commands/rebuild.js";
import { historyCommand } from "./commands/history.js";
import { resetCommand } from "./commands/reset.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("goploy")
  .description("CLI & MCP server for Goploy deployment system")
  .version("0.1.0")
  .option("--url <url>", "Goploy server URL (env: GOPLOY_URL)")
  .option("--api-key <key>", "API key (env: GOPLOY_API_KEY)")
  .option("--namespace <id>", "Namespace ID (env: GOPLOY_NAMESPACE_ID)");

function getApis(cmd: Command) {
  const opts = cmd.optsWithGlobals();
  const config = loadConfig({
    url: opts.url,
    apiKey: opts.apiKey,
    namespaceId: opts.namespace ? parseInt(opts.namespace, 10) : undefined,
  });
  const client = new GoployClient(config);
  return {
    deploy: new DeployApi(client),
    project: new ProjectApi(client),
  };
}

// ---- MCP subcommand ----
program
  .command("mcp")
  .description("Start MCP server (stdio transport)")
  .action(async () => {
    // Dynamic import to avoid loading MCP SDK for CLI commands
    const { McpServer } = await import(
      "@modelcontextprotocol/sdk/server/mcp.js"
    );
    const { StdioServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/stdio.js"
    );
    const { registerTools } = await import("./agent/tools.js");

    const opts = program.optsWithGlobals();
    const config = loadConfig({
      url: opts.url,
      apiKey: opts.apiKey,
      namespaceId: opts.namespace ? parseInt(opts.namespace, 10) : undefined,
    });

    const server = new McpServer({ name: "goploy", version: "0.1.0" });
    registerTools(server, config);

    const transport = new StdioServerTransport();
    await server.connect(transport);
  });

// ---- CLI subcommands ----
lsCommand(program, getApis);
publishCommand(program, getApis);
statusCommand(program, getApis);
waitCommand(program, getApis);
traceCommand(program, getApis);
rebuildCommand(program, getApis);
historyCommand(program, getApis);
resetCommand(program, getApis);
configCommand(program);

program.parse();
