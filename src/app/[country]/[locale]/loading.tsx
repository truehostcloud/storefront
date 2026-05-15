import { headers } from "next/headers";
import { getTenantConfigByHost } from "@/lib/tenant/olitt";
import { getRequestHost } from "@/lib/tenant/request";
import { getTenantBrandName } from "@/lib/tenant/surface";

export default async function Loading() {
  const requestHeaders = await headers();
  const host = getRequestHost(requestHeaders) ?? "";
  const tenantConfig = host ? await getTenantConfigByHost(host) : null;
  const storeName = getTenantBrandName(tenantConfig) ?? "Store";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-xl font-medium tracking-tight text-foreground">
          Loading {storeName}
        </p>
      </div>
    </div>
  );
}
