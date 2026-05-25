import type { ReactElement } from "react";

export default function Loading(): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-xl font-medium tracking-tight text-foreground">
          Loading Store
        </p>
      </div>
    </div>
  );
}
