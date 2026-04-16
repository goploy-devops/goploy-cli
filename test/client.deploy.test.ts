import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { GoployClient } from "../src/client/index.js";
import { DeployApi } from "../src/client/deploy.js";
import { AuthError, BusinessError, NetworkError } from "../src/client/errors.js";

const BASE_URL = "http://localhost:3001";
const API_KEY = "test-api-key-1234";
const NAMESPACE_ID = 1;

const handlers = [
  http.get(`${BASE_URL}/deploy/getList`, ({ request }) => {
    const apiKey = request.headers.get("X-API-KEY");
    const nsId = request.headers.get("G-N-ID");

    if (apiKey !== API_KEY) {
      return HttpResponse.json({}, { status: 401 });
    }

    return HttpResponse.json({
      code: 0,
      message: "",
      data: {
        list: [
          {
            id: 1,
            name: "test-project",
            branch: "main",
            deployState: 2,
            autoDeploy: 0,
            lastPublishToken: "token-abc",
          },
          {
            id: 2,
            name: "another-project",
            branch: "develop",
            deployState: 0,
            autoDeploy: 1,
            lastPublishToken: "",
          },
        ],
      },
    });
  }),

  http.post(`${BASE_URL}/deploy/publish`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.projectId) {
      return HttpResponse.json({
        code: 10000,
        message: "projectId is required",
        data: null,
      });
    }

    return HttpResponse.json({
      code: 0,
      message: "",
      data: { token: "publish-token-xyz" },
    });
  }),

  http.post(`${BASE_URL}/deploy/rebuild`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      code: 0,
      message: "",
      data: { type: "symlink", token: "rebuild-token-123" },
    });
  }),

  http.get(`${BASE_URL}/deploy/getPublishProgress`, ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("lastPublishToken");

    if (token === "success-token") {
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 2, stage: "done", message: "Deployment successful" },
      });
    }
    if (token === "fail-token") {
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 3, stage: "deploy", message: "Script exited with code 1" },
      });
    }

    return HttpResponse.json({
      code: 0,
      message: "",
      data: { state: 1, stage: "pull", message: "Pulling code..." },
    });
  }),

  http.get(`${BASE_URL}/deploy/getPublishTrace`, ({ request }) => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: {
        list: [
          {
            id: 100,
            token: "t1",
            projectId: 1,
            projectName: "test-project",
            detail: "queued",
            state: 2,
            publisherId: 1,
            publisherName: "admin",
            type: 0,
            ext: "",
            insertTime: "2024-01-01 00:00:00",
            updateTime: "2024-01-01 00:00:01",
          },
        ],
      },
    });
  }),

  http.get(`${BASE_URL}/deploy/getPublishTraceDetail`, ({ request }) => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: { detail: "full detail text here" },
    });
  }),

  http.get(`${BASE_URL}/deploy/getPreview`, ({ request }) => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: {
        list: [
          {
            token: "prev-token-1",
            state: 2,
            type: 8,
            publisherName: "admin",
            insertTime: "2024-01-01 12:00:00",
            ext: '{"branch":"main"}',
          },
        ],
        pagination: { page: 1, rows: 20, total: 1 },
      },
    });
  }),

  http.put(`${BASE_URL}/deploy/resetState`, async () => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: null,
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeClient() {
  return new GoployClient({
    url: BASE_URL,
    apiKey: API_KEY,
    namespaceId: NAMESPACE_ID,
    insecureSkipVerify: false,
    debug: false,
  });
}

describe("DeployApi", () => {
  it("getList returns projects", async () => {
    const api = new DeployApi(makeClient());
    const data = await api.getList();
    expect(data.list).toHaveLength(2);
    expect(data.list[0].name).toBe("test-project");
  });

  it("publish returns token", async () => {
    const api = new DeployApi(makeClient());
    const result = await api.publish({ projectId: 1 });
    expect(result.token).toBe("publish-token-xyz");
  });

  it("publish with missing projectId returns business error", async () => {
    const api = new DeployApi(makeClient());
    await expect(api.publish({ projectId: 0 })).rejects.toThrow(BusinessError);
  });

  it("rebuild returns type and token", async () => {
    const api = new DeployApi(makeClient());
    const result = await api.rebuild("some-token");
    expect(result.type).toBe("symlink");
    expect(result.token).toBe("rebuild-token-123");
  });

  it("getPublishProgress returns state", async () => {
    const api = new DeployApi(makeClient());
    const progress = await api.getPublishProgress("any-token");
    expect(progress.state).toBe(1);
    expect(progress.stage).toBe("pull");
  });

  it("getPublishTrace returns list", async () => {
    const api = new DeployApi(makeClient());
    const traces = await api.getPublishTrace("any-token");
    expect(traces.list).toHaveLength(1);
    expect(traces.list[0].type).toBe(0);
  });

  it("getPublishTraceDetail returns detail", async () => {
    const api = new DeployApi(makeClient());
    const detail = await api.getPublishTraceDetail(100);
    expect(detail.detail).toBe("full detail text here");
  });

  it("getPreview returns paginated list", async () => {
    const api = new DeployApi(makeClient());
    const data = await api.getPreview({ projectId: 1 });
    expect(data.list).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("resetState succeeds", async () => {
    const api = new DeployApi(makeClient());
    await expect(api.resetState(1)).resolves.toBeUndefined();
  });
});

describe("GoployClient auth", () => {
  it("throws AuthError on 401", async () => {
    const client = new GoployClient({
      url: BASE_URL,
      apiKey: "wrong-key",
      namespaceId: NAMESPACE_ID,
      insecureSkipVerify: false,
      debug: false,
    });
    const api = new DeployApi(client);
    await expect(api.getList()).rejects.toThrow(AuthError);
  });

  it("injects X-API-KEY and G-N-ID headers", async () => {
    let capturedHeaders: Record<string, string> = {};
    server.use(
      http.get(`${BASE_URL}/deploy/getList`, ({ request }) => {
        capturedHeaders = {
          "X-API-KEY": request.headers.get("X-API-KEY") ?? "",
          "G-N-ID": request.headers.get("G-N-ID") ?? "",
        };
        return HttpResponse.json({ code: 0, message: "", data: { list: [] } });
      })
    );

    const api = new DeployApi(makeClient());
    await api.getList();

    expect(capturedHeaders["X-API-KEY"]).toBe(API_KEY);
    expect(capturedHeaders["G-N-ID"]).toBe(String(NAMESPACE_ID));
  });
});
