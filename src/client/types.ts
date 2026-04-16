// ---- Generic API response ----

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  rows: number;
}

export interface PaginationTotal extends Pagination {
  total: number;
}

// ---- Deploy ----

export enum DeployState {
  Uninitialized = 0,
  Deploying = 1,
  Success = 2,
  Fail = 3,
}

export enum PublishTraceType {
  Queue = 0,
  BeforePull = 1,
  Pull = 2,
  AfterPull = 3,
  BeforeDeploy = 4,
  Deploy = 5,
  AfterDeploy = 6,
  DeployFinish = 7,
  PublishFinish = 8,
}

export const PublishTraceTypeLabel: Record<number, string> = {
  [PublishTraceType.Queue]: "Queue",
  [PublishTraceType.BeforePull]: "Before Pull",
  [PublishTraceType.Pull]: "Pull",
  [PublishTraceType.AfterPull]: "After Pull",
  [PublishTraceType.BeforeDeploy]: "Before Deploy",
  [PublishTraceType.Deploy]: "Deploy",
  [PublishTraceType.AfterDeploy]: "After Deploy",
  [PublishTraceType.DeployFinish]: "Deploy Finish",
  [PublishTraceType.PublishFinish]: "Publish Finish",
};

export interface PublishTraceData {
  id: number;
  token: string;
  projectId: number;
  projectName: string;
  detail: string;
  state: number;
  publisherId: number;
  publisherName: string;
  type: number;
  ext: string;
  serverName?: string;
  insertTime: string;
  updateTime: string;
}

export interface PublishProgressData {
  state: DeployState;
  stage: string;
  message: string;
}

export interface PublishResult {
  token: string;
}

export interface RebuildResult {
  type: string;
  token: string;
}

// ---- Project ----

export interface ProjectData {
  id: number;
  namespaceId: number;
  name: string;
  repoType: string;
  url: string;
  path: string;
  environment: number;
  branch: string;
  label: string;
  symlinkPath: string;
  review: number;
  transferType: string;
  autoDeploy: number;
  publisherId: number;
  publisherName: string;
  deployState: number;
  lastPublishToken: string;
  state: number;
  insertTime: string;
  updateTime: string;
}

export interface DeployListData {
  list: ProjectData[];
}

export interface PreviewListData {
  list: PublishTraceData[];
  pagination: PaginationTotal;
}

export interface TraceListData {
  list: PublishTraceData[];
}

export interface TraceDetailData {
  detail: string;
}
