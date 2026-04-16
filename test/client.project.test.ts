import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { GoployClient } from "../src/client/index.js";
import { ProjectApi } from "../src/client/project.js";
import { NotFoundError } from "../src/client/errors.js";

const BASE_URL = "http://localhost:3001";

const projectList = [
  {
    id: 1,
    name: "far-boo",
    branch: "main",
    deployState: 2,
    autoDeploy: 0,
    lastPublishToken: "t1",
    namespaceId: 1,
    repoType: "git",
    url: "",
    path: "",
    environment: 0,
    label: "",
    symlinkPath: "",
    review: 0,
    transferType: "",
    publisherId: 0,
    publisherName: "",
    state: 1,
    insertTime: "",
    updateTime: "",
  },
  {
    id: 2,
    name: "far-baz",
    branch: "develop",
    deployState: 0,
    autoDeploy: 1,
    lastPublishToken: "",
    namespaceId: 1,
    repoType: "git",
    url: "",
    path: "",
    environment: 0,
    label: "",
    symlinkPath: "",
    review: 0,
    transferType: "",
    publisherId: 0,
    publisherName: "",
    state: 1,
    insertTime: "",
    updateTime: "",
  },
  {
    id: 3,
    name: "backend-api",
    branch: "main",
    deployState: 0,
    autoDeploy: 0,
    lastPublishToken: "",
    namespaceId: 1,
    repoType: "git",
    url: "",
    path: "",
    environment: 0,
    label: "",
    symlinkPath: "",
    review: 0,
    transferType: "",
    publisherId: 0,
    publisherName: "",
    state: 1,
    insertTime: "",
    updateTime: "",
  },
];

const server = setupServer(
  http.get(`${BASE_URL}/deploy/getList`, () => {
    return HttpResponse.json({
      code: 0,
      message: "",
      data: { list: projectList },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeApi() {
  const client = new GoployClient({
    url: BASE_URL,
    apiKey: "test-key",
    namespaceId: 1,
    insecureSkipVerify: false,
    debug: false,
  });
  return new ProjectApi(client);
}

describe("ProjectApi.getList", () => {
  it("returns all projects without keyword", async () => {
    const api = makeApi();
    const projects = await api.getList();
    expect(projects).toHaveLength(3);
  });

  it("filters by keyword (name match)", async () => {
    const api = makeApi();
    const projects = await api.getList("far");
    expect(projects).toHaveLength(2);
    expect(projects.map((p) => p.name)).toContain("far-boo");
    expect(projects.map((p) => p.name)).toContain("far-baz");
  });

  it("filters by keyword (ID match)", async () => {
    const api = makeApi();
    const projects = await api.getList("3");
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("backend-api");
  });

  it("returns empty for no match", async () => {
    const api = makeApi();
    const projects = await api.getList("zzz-nonexistent");
    expect(projects).toHaveLength(0);
  });
});

describe("ProjectApi.resolveProject", () => {
  it("resolves exact name", async () => {
    const api = makeApi();
    const result = await api.resolveProject("far-boo");
    expect(result.project).toBeDefined();
    expect(result.project!.id).toBe(1);
  });

  it("resolves by ID", async () => {
    const api = makeApi();
    const result = await api.resolveProject("2");
    expect(result.project).toBeDefined();
    expect(result.project!.name).toBe("far-baz");
  });

  it("returns candidates for ambiguous query", async () => {
    const api = makeApi();
    const result = await api.resolveProject("far");
    expect(result.candidates).toBeDefined();
    expect(result.candidates).toHaveLength(2);
  });

  it("throws NotFoundError for unknown project", async () => {
    const api = makeApi();
    await expect(api.resolveProject("nonexistent")).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError for unknown ID", async () => {
    const api = makeApi();
    await expect(api.resolveProject("9999")).rejects.toThrow(NotFoundError);
  });
});
