"use server";

import { headers } from "next/headers";
import { getTenantConfigByHost } from "@/lib/tenant";

export async function getTenantConfigFromRequest() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) return null;
  return getTenantConfigByHost(host);
}
