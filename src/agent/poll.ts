import { DeployApi } from "../client/deploy.js";
import { DeployState, PublishTraceTypeLabel } from "../client/types.js";
import type { PublishProgressData } from "../client/types.js";

export interface WaitResult {
  finalState: "success" | "fail" | "still_deploying";
  stage: string;
  message: string;
  traceSummary?: string;
}

export async function waitForPublish(
  deployApi: DeployApi,
  token: string,
  options?: {
    timeoutSec?: number;
    pollIntervalSec?: number;
    onProgress?: (progress: PublishProgressData) => void;
  }
): Promise<WaitResult> {
  const timeoutMs = (options?.timeoutSec ?? 600) * 1000;
  const intervalMs = (options?.pollIntervalSec ?? 3) * 1000;
  const start = Date.now();

  let lastProgress: PublishProgressData = {
    state: DeployState.Deploying,
    stage: "",
    message: "",
  };

  while (Date.now() - start < timeoutMs) {
    const progress = await deployApi.getPublishProgress(token);
    lastProgress = progress;
    options?.onProgress?.(progress);

    if (progress.state === DeployState.Success) {
      return {
        finalState: "success",
        stage: progress.stage,
        message: progress.message,
      };
    }

    if (progress.state === DeployState.Fail) {
      let traceSummary: string | undefined;
      try {
        const traces = await deployApi.getPublishTrace(token);
        const failedTraces = traces.list.filter((t) => t.state === DeployState.Fail);
        traceSummary = failedTraces
          .map(
            (t) =>
              `[${PublishTraceTypeLabel[t.type] ?? t.type}] ${t.detail}${t.serverName ? ` (${t.serverName})` : ""}`
          )
          .join("\n");
      } catch {
        // Trace fetch failed, continue without summary
      }

      return {
        finalState: "fail",
        stage: progress.stage,
        message: progress.message,
        traceSummary,
      };
    }

    await sleep(intervalMs);
  }

  return {
    finalState: "still_deploying",
    stage: lastProgress.stage,
    message: `Timed out after ${options?.timeoutSec ?? 600}s. Deployment is still running on server.`,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
