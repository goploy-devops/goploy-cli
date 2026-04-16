export interface GoployConfig {
  url: string;
  apiKey: string;
  namespaceId: number;
  insecureSkipVerify: boolean;
  debug: boolean;
}

export function loadConfig(overrides?: Partial<GoployConfig>): GoployConfig {
  const url = overrides?.url ?? process.env.GOPLOY_URL ?? "";
  const apiKey = overrides?.apiKey ?? process.env.GOPLOY_API_KEY ?? "";
  const nsRaw = overrides?.namespaceId ?? process.env.GOPLOY_NAMESPACE_ID ?? "1";
  const namespaceId = typeof nsRaw === "number" ? nsRaw : parseInt(nsRaw, 10);
  const insecureSkipVerify =
    overrides?.insecureSkipVerify ??
    process.env.GOPLOY_INSECURE_SKIP_VERIFY === "1";
  const debug = overrides?.debug ?? process.env.GOPLOY_DEBUG === "1";

  if (!url) {
    throw new Error(
      "GOPLOY_URL is required. Set it via environment variable or --url flag."
    );
  }
  if (!apiKey) {
    throw new Error(
      "GOPLOY_API_KEY is required. Set it via environment variable. Generate one in Goploy UI → User → API Key."
    );
  }
  if (isNaN(namespaceId) || namespaceId < 1) {
    throw new Error(
      "GOPLOY_NAMESPACE_ID must be a positive integer. Set it via environment variable or --namespace flag."
    );
  }

  return { url, apiKey, namespaceId, insecureSkipVerify, debug };
}
