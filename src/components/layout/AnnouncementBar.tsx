import Link from "next/link";
import type { CSSProperties } from "react";
import type { TenantAnnouncementBarConfig } from "@/lib/tenant";

interface AnnouncementBarProps {
  basePath: string;
  announcementBar: TenantAnnouncementBarConfig;
}

function resolveHref(basePath: string, href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(basePath)) return href;
  if (href === "/") return basePath;
  return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
}

export function AnnouncementBar({
  basePath,
  announcementBar,
}: AnnouncementBarProps) {
  const barStyle: CSSProperties = {
    backgroundColor: announcementBar.backgroundColor,
    color: announcementBar.foregroundColor,
  };
  const href = announcementBar.href
    ? resolveHref(basePath, announcementBar.href)
    : undefined;

  return (
    <div className="border-b px-4 py-3 text-sm" style={barStyle}>
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
        <span className="font-medium">{announcementBar.message}</span>
        {href ? (
          <Link
            href={href}
            className="font-semibold underline underline-offset-4"
          >
            {announcementBar.linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
