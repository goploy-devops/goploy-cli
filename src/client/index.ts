import type { GoployConfig } from "../config.js";
import type { ApiResponse } from "./types.js";
import { AuthError, BusinessError, NetworkError, NotFoundError } from "./errors.js";

export class GoployClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly namespaceId: number;
  private readonly debug: boolean;

  constructor(config: GoployConfig) {
    this.baseUrl = config.url.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.namespaceId = config.namespaceId;
    this.debug = config.debug;
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string | number>;
      body?: unknown;
      timeout?: number;
    }
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (options?.params) {
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const headers: Record<string, string> = {
      "X-API-KEY": this.apiKey,
      "G-N-ID": String(this.namespaceId),
    };

    let bodyStr: string | undefined;
    if (options?.body !== undefined) {
      headers["Content-Type"] = "application/json";
      bodyStr = JSON.stringify(options.body);
    }

    if (this.debug) {
      const maskedKey = this.apiKey.slice(0, 4) + "****";
      console.error(
        `[goploy-cli] ${method} ${url.toString()} API-KEY=${maskedKey}`
      );
    }

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method,
        headers,
        body: bodyStr,
        signal: options?.timeout
          ? AbortSignal.timeout(options.timeout)
          : undefined,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new NetworkError(
          `Request timed out: ${method} ${path}. Check GOPLOY_URL or network.`
        );
      }
      throw new NetworkError(
        `Network error: ${method} ${path}. Check GOPLOY_URL and connectivity.`,
        err
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw new AuthError(
        `Authentication failed (HTTP ${res.status}). Check GOPLOY_API_KEY and namespace permissions.`
      );
    }

    if (res.status === 404) {
      throw new NotFoundError(`Not found: ${path}. Check GOPLOY_URL.`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new NetworkError(
        `HTTP ${res.status} from ${method} ${path}: ${text}`
      );
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (json.code !== 0) {
      throw new BusinessError(json.message || "Unknown business error", json.code);
    }

    return json.data;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number>,
    timeout?: number
  ): Promise<T> {
    return this.request<T>("GET", path, { params, timeout });
  }

  async post<T>(path: string, body?: unknown, timeout?: number): Promise<T> {
    return this.request<T>("POST", path, { body, timeout });
  }

  async put<T>(path: string, body?: unknown, timeout?: number): Promise<T> {
    return this.request<T>("PUT", path, { body, timeout });
  }
}
