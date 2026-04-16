import { GoployClient } from "./index.js";
import { NotFoundError } from "./errors.js";
import type { DeployListData, ProjectData } from "./types.js";

export class ProjectApi {
  constructor(private readonly client: GoployClient) {}

  async getList(keyword?: string): Promise<ProjectData[]> {
    const data = await this.client.get<DeployListData>("/deploy/getList");
    const list = data.list ?? [];

    if (!keyword) {
      return list;
    }

    const lower = keyword.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        String(p.id) === keyword
    );
  }

  async resolveProject(
    query: string
  ): Promise<{ project: ProjectData; candidates?: undefined } | { project?: undefined; candidates: ProjectData[] }> {
    // Try exact ID match first
    const idNum = parseInt(query, 10);
    if (!isNaN(idNum) && String(idNum) === query.trim()) {
      const allProjects = await this.getList();
      const found = allProjects.find((p) => p.id === idNum);
      if (found) {
        return { project: found };
      }
      throw new NotFoundError(
        `Project with ID ${idNum} not found. Run list_projects to see available projects.`
      );
    }

    // Fuzzy name match
    const matches = await this.getList(query);

    if (matches.length === 0) {
      throw new NotFoundError(
        `No project matching "${query}". Run list_projects to see available projects.`
      );
    }

    if (matches.length === 1) {
      return { project: matches[0] };
    }

    // Check for exact name match among candidates
    const exact = matches.find(
      (p) => p.name.toLowerCase() === query.toLowerCase()
    );
    if (exact) {
      return { project: exact };
    }

    return { candidates: matches };
  }
}
