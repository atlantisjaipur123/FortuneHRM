"use client";

import Link from "next/link";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground break-words">
          {error?.message || "An unexpected error occurred."}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => (typeof window !== "undefined" ? window.location.reload() : null)} className="px-4 py-2 rounded border">
            Reload
          </button>
          <Link href="/" className="px-4 py-2 rounded bg-primary text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}


