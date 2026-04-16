import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { GoployClient } from "../src/client/index.js";
import { DeployApi } from "../src/client/deploy.js";
import { waitForPublish } from "../src/agent/poll.js";

const BASE_URL = "http://localhost:3001";

let pollCount = 0;

const server = setupServer(
  http.get(`${BASE_URL}/deploy/getPublishProgress`, ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("lastPublishToken");
    pollCount++;

    if (token === "fast-success") {
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 2, stage: "done", message: "OK" },
      });
    }

    if (token === "fast-fail") {
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 3, stage: "deploy", message: "Script error" },
      });
    }

    if (token === "slow-deploy") {
      // Stays deploying
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 1, stage: "pull", message: "Still pulling..." },
      });
    }

    if (token === "delayed-success") {
      // Succeed after 3 polls
      if (pollCount >= 3) {
        return HttpResponse.json({
          code: 0,
          message: "",
          data: { state: 2, stage: "done", message: "Deployed" },
        });
      }
      return HttpResponse.json({
        code: 0,
        message: "",
        data: { state: 1, stage: "pull", message: "Pulling..." },
      });
    }

    return HttpResponse.json({
      code: 0,
      message: "",
      data: { state: 1, stage: "unknown", message: "unknown token" },
    });
  }),

  http.get(`${BASE_URL}/deploy/getPublishTrace`, () => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: {
        list: [
          {
            id: 1,
            token: "t",
            projectId: 1,
            projectName: "p",
            detail: "error log here",
            state: 3,
            publisherId: 1,
            publisherName: "admin",
            type: 5,
            ext: "",
            insertTime: "",
            updateTime: "",
          },
        ],
      },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  pollCount = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

function makeDeployApi() {
  const client = new GoployClient({
    url: BASE_URL,
    apiKey: "test-key",
    namespaceId: 1,
    insecureSkipVerify: false,
    debug: false,
  });
  return new DeployApi(client);
}

describe("waitForPublish", () => {
  it("returns success immediately for fast-success token", async () => {
    const api = makeDeployApi();
    const result = await waitForPublish(api, "fast-success", {
      timeoutSec: 10,
      pollIntervalSec: 0.1,
    });
    expect(result.finalState).toBe("success");
    expect(result.stage).toBe("done");
  });

  it("returns fail with trace summary for fast-fail token", async () => {
    const api = makeDeployApi();
    const result = await waitForPublish(api, "fast-fail", {
      timeoutSec: 10,
      pollIntervalSec: 0.1,
    });
    expect(result.finalState).toBe("fail");
    expect(result.traceSummary).toContain("error log here");
  });

  it("times out for slow-deploy token", async () => {
    const api = makeDeployApi();
    const result = await waitForPublish(api, "slow-deploy", {
      timeoutSec: 0.3,
      pollIntervalSec: 0.1,
    });
    expect(result.finalState).toBe("still_deploying");
    expect(result.message).toContain("Timed out");
  });

  it("succeeds after multiple polls for delayed-success", async () => {
    const api = makeDeployApi();
    const progressStages: string[] = [];
    const result = await waitForPublish(api, "delayed-success", {
      timeoutSec: 10,
      pollIntervalSec: 0.05,
      onProgress: (p) => progressStages.push(p.stage),
    });
    expect(result.finalState).toBe("success");
    expect(progressStages.length).toBeGreaterThanOrEqual(3);
  });
});
