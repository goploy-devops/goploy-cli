import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GoployClient } from "../client/index.js";
import { DeployApi } from "../client/deploy.js";
import { ProjectApi } from "../client/project.js";
import { GoployError } from "../client/errors.js";
import { DeployState, PublishTraceTypeLabel } from "../client/types.js";
import { waitForPublish } from "./poll.js";
import type { GoployConfig } from "../config.js";

export function registerTools(server: McpServer, config: GoployConfig): void {
  const client = new GoployClient(config);
  const deployApi = new DeployApi(client);
  const projectApi = new ProjectApi(client);

  // ---- list_projects ----
  server.tool(
    "list_projects",
    "List projects available for deployment. Optionally filter by keyword.",
    { keyword: z.string().optional().describe("Filter projects by name (fuzzy match)") },
    async ({ keyword }) => {
      try {
        const projects = await projectApi.getList(keyword);
        const summary = projects.map((p) => ({
          id: p.id,
          name: p.name,
          branch: p.branch,
          autoDeploy: p.autoDeploy,
          deployState: stateLabel(p.deployState),
          lastPublishToken: p.lastPublishToken,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }] };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- resolve_project ----
  server.tool(
    "resolve_project",
    "Resolve a project by name or ID. Returns single match or list of candidates for disambiguation.",
    { query: z.string().describe("Project name (fuzzy) or numeric ID") },
    async ({ query }) => {
      try {
        const result = await projectApi.resolveProject(query);
        if (result.project) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  { id: result.project.id, name: result.project.name, branch: result.project.branch },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text:
                "Multiple projects matched. Please pick one:\n" +
                JSON.stringify(
                  result.candidates!.map((c) => ({ id: c.id, name: c.name })),
                  null,
                  2
                ),
            },
          ],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- publish ----
  server.tool(
    "publish",
    "Trigger a deployment for a project. Returns a token to track progress. Does NOT wait for completion — use wait_for_publish after.",
    {
      project: z.union([z.string(), z.number()]).describe("Project name or numeric ID"),
      branch: z.string().optional().describe("Branch to deploy (defaults to project default branch)"),
      commit: z.string().optional().describe("Specific commit hash to deploy"),
      server_ids: z.array(z.number()).optional().describe("Deploy to specific server IDs only"),
    },
    async ({ project, branch, commit, server_ids }) => {
      try {
        // Resolve project
        const query = String(project);
        const resolved = await projectApi.resolveProject(query);
        if (!resolved.project) {
          return {
            content: [
              {
                type: "text" as const,
                text:
                  "Ambiguous project name. Candidates:\n" +
                  JSON.stringify(
                    resolved.candidates!.map((c) => ({ id: c.id, name: c.name })),
                    null,
                    2
                  ) +
                  "\nPlease use the exact project name or ID.",
              },
            ],
          };
        }

        const result = await deployApi.publish({
          projectId: resolved.project.id,
          branch,
          commit,
          serverIds: server_ids,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  token: result.token,
                  projectId: resolved.project.id,
                  projectName: resolved.project.name,
                  message: "Deployment triggered. Use wait_for_publish with this token to monitor progress.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- get_publish_status ----
  server.tool(
    "get_publish_status",
    "Get a single snapshot of the current deployment progress for a token.",
    { token: z.string().describe("The publish token returned by publish") },
    async ({ token }) => {
      try {
        const progress = await deployApi.getPublishProgress(token);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  state: stateLabel(progress.state),
                  stage: progress.stage,
                  message: progress.message,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- wait_for_publish ----
  server.tool(
    "wait_for_publish",
    "Poll deployment progress until it succeeds, fails, or times out. On failure, includes trace summary for diagnosis.",
    {
      token: z.string().describe("The publish token returned by publish"),
      timeout_sec: z.number().optional().default(600).describe("Max seconds to wait (default 600)"),
      poll_interval_sec: z.number().optional().default(3).describe("Seconds between polls (default 3)"),
    },
    async ({ token, timeout_sec, poll_interval_sec }) => {
      try {
        const result = await waitForPublish(deployApi, token, {
          timeoutSec: timeout_sec,
          pollIntervalSec: poll_interval_sec,
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- get_publish_trace ----
  server.tool(
    "get_publish_trace",
    "Get detailed publish trace records for a deployment token. Useful for diagnosing failures.",
    {
      token: z.string().describe("The publish token"),
      include_detail: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include full detail text for each trace record"),
    },
    async ({ token, include_detail }) => {
      try {
        const traces = await deployApi.getPublishTrace(token);
        let records = traces.list.map((t) => ({
          id: t.id,
          type: PublishTraceTypeLabel[t.type] ?? String(t.type),
          state: stateLabel(t.state),
          serverName: t.serverName ?? "",
          ext: t.ext,
          ...(include_detail ? { detail: t.detail } : {}),
        }));

        if (include_detail && records.length > 0) {
          // Fetch extended detail for each record
          for (const record of records) {
            try {
              const detail = await deployApi.getPublishTraceDetail(
                traces.list.find((t) => t.id === (record as any).id)!.id
              );
              (record as any).detail = detail.detail;
            } catch {
              // skip
            }
          }
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(records, null, 2) }],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- rebuild ----
  server.tool(
    "rebuild",
    "Rollback a deployment by rebuilding from a previous publish token.",
    { token: z.string().describe("The publish token to rollback to") },
    async ({ token }) => {
      try {
        const result = await deployApi.rebuild(token);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  type: result.type,
                  newToken: result.token,
                  message:
                    result.type === "symlink"
                      ? "Symlink rollback completed instantly."
                      : "Rebuild triggered. Use wait_for_publish with the new token to monitor.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- list_recent_deployments ----
  server.tool(
    "list_recent_deployments",
    "List recent deployment history for a project.",
    {
      project_id: z.number().describe("Project ID"),
      limit: z.number().optional().default(20).describe("Max records to return (default 20)"),
      state: z.number().optional().describe("Filter by state: 0=uninitialized, 1=deploying, 2=success, 3=fail"),
    },
    async ({ project_id, limit, state }) => {
      try {
        const data = await deployApi.getPreview({
          projectId: project_id,
          rows: limit,
          state,
        });
        const records = data.list.map((t) => ({
          token: t.token,
          state: stateLabel(t.state),
          type: PublishTraceTypeLabel[t.type] ?? String(t.type),
          publisherName: t.publisherName,
          insertTime: t.insertTime,
          ext: t.ext,
        }));
        return {
          content: [{ type: "text" as const, text: JSON.stringify(records, null, 2) }],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // ---- reset_project_state ----
  server.tool(
    "reset_project_state",
    "Reset a stuck project's deploy state back to idle. Use when a project is stuck in 'deploying' state.",
    { project_id: z.number().describe("Project ID to reset") },
    async ({ project_id }) => {
      try {
        await deployApi.resetState(project_id);
        return {
          content: [{ type: "text" as const, text: `Project ${project_id} state has been reset.` }],
        };
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}

function stateLabel(state: number): string {
  switch (state) {
    case DeployState.Uninitialized:
      return "uninitialized";
    case DeployState.Deploying:
      return "deploying";
    case DeployState.Success:
      return "success";
    case DeployState.Fail:
      return "fail";
    default:
      return String(state);
  }
}

function errorResult(err: unknown) {
  const message = err instanceof GoployError ? err.message : String(err);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}
