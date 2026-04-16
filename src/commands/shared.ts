import type { Command } from "commander";
import type { DeployApi } from "../client/deploy.js";
import type { ProjectApi } from "../client/project.js";

export type GetApis = (cmd: Command) => {
  deploy: DeployApi;
  project: ProjectApi;
};
