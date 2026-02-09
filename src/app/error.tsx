"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in the future
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred while loading this page. You can try again, or go back home
          and continue browsing.
        </p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <p className="mt-2 text-xs text-muted-foreground/80 break-words">
            <span className="font-semibold">Error:</span> {error.message}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  );
}

