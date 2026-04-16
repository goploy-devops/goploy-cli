import { GoployClient } from "./index.js";
import type {
  DeployListData,
  PreviewListData,
  PublishProgressData,
  PublishResult,
  RebuildResult,
  TraceDetailData,
  TraceListData,
} from "./types.js";

export class DeployApi {
  constructor(private readonly client: GoployClient) {}

  async getList(): Promise<DeployListData> {
    return this.client.get<DeployListData>("/deploy/getList");
  }

  async publish(params: {
    projectId: number;
    branch?: string;
    commit?: string;
    serverIds?: number[];
  }): Promise<PublishResult> {
    return this.client.post<PublishResult>("/deploy/publish", {
      projectId: params.projectId,
      branch: params.branch ?? "",
      commit: params.commit ?? "",
      serverIds: params.serverIds ?? [],
    });
  }

  async rebuild(token: string): Promise<RebuildResult> {
    return this.client.post<RebuildResult>("/deploy/rebuild", { token });
  }

  async getPublishProgress(token: string): Promise<PublishProgressData> {
    return this.client.get<PublishProgressData>("/deploy/getPublishProgress", {
      lastPublishToken: token,
    });
  }

  async getPublishTrace(token: string): Promise<TraceListData> {
    return this.client.get<TraceListData>("/deploy/getPublishTrace", {
      lastPublishToken: token,
    });
  }

  async getPublishTraceDetail(id: number): Promise<TraceDetailData> {
    return this.client.get<TraceDetailData>("/deploy/getPublishTraceDetail", {
      id,
    });
  }

  async getPreview(params: {
    projectId: number;
    page?: number;
    rows?: number;
    state?: number;
  }): Promise<PreviewListData> {
    return this.client.get<PreviewListData>("/deploy/getPreview", {
      projectId: params.projectId,
      page: params.page ?? 1,
      rows: params.rows ?? 20,
      ...(params.state !== undefined ? { state: params.state } : {}),
    });
  }

  async resetState(projectId: number): Promise<void> {
    await this.client.put<unknown>("/deploy/resetState", { projectId });
  }
}
