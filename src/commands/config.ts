import type { Command } from "commander";
import { loadConfig } from "../config.js";
import { GoployClient } from "../client/index.js";
import { DeployApi } from "../client/deploy.js";

export function configCommand(program: Command): void {
  const cmd = program
    .command("config")
    .description("Configuration management");

  cmd
    .command("check")
    .description("Verify configuration and test connection")
    .action(async (_opts, subcmd) => {
      const parentOpts = program.optsWithGlobals();
      try {
        const config = loadConfig({
          url: parentOpts.url,
          apiKey: parentOpts.apiKey,
          namespaceId: parentOpts.namespace
            ? parseInt(parentOpts.namespace, 10)
            : undefined,
        });

        console.log(`URL:       ${config.url}`);
        console.log(`Namespace: ${config.namespaceId}`);
        console.log(`API Key:   ${config.apiKey.slice(0, 4)}****`);
        console.log();

        // Test connection by fetching project list
        const client = new GoployClient(config);
        const deployApi = new DeployApi(client);
        const data = await deployApi.getList();
        const count = data.list?.length ?? 0;
        console.log(`Connection: OK (${count} projects accessible)`);
      } catch (err) {
        console.error(
          `Connection failed: ${err instanceof Error ? err.message : err}`
        );
        process.exit(1);
      }
    });
}
