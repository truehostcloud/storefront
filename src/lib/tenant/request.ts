import { headers } from "next/headers";
import { getTenantConfigByHost } from "@/lib/tenant";
import { normalizeHost } from "@/lib/tenant/normalize";

const TRUST_PROXY_ENV_VALUES = ["TRUST_PROXY", "NEXT_TRUST_PROXY"] as const;

function isTruthyEnvValue(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

function isTrustedProxyEnabled(): boolean {
  return TRUST_PROXY_ENV_VALUES.some((key) =>
    isTruthyEnvValue(process.env[key]),
  );
}

function normalizeHeaderHost(value: string | null): string | null {
  if (!value) return null;
  if (value.includes(",")) return null;
  return normalizeHost(value, { preservePort: true });
}

export function getRequestHost(requestHeaders: Headers): string | null {
  const host = normalizeHeaderHost(requestHeaders.get("host"));
  if (!isTrustedProxyEnabled()) {
    return host;
  }

  const forwardedHost = normalizeHeaderHost(
    requestHeaders.get("x-forwarded-host"),
  );

  return forwardedHost ?? host;
}

export async function getTenantConfigFromRequest() {
  const requestHeaders = await headers();
  const host = getRequestHost(requestHeaders);

  if (!host) return null;
  return getTenantConfigByHost(host);
}
