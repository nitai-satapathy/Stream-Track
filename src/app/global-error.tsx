"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// This is a global fallback for unrecoverable errors in the app router.
export default function GlobalError({ error }: GlobalErrorProps) {
  // Avoid using hooks here; this component must be very simple.
  if (process.env.NODE_ENV === "development") {
    console.error("Global app error:", error);
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">Stream Track crashed</h1>
          <p className="text-muted-foreground">
            An unrecoverable error occurred. Please refresh the page or return to the homepage.
          </p>
          {process.env.NODE_ENV === "development" && error?.message && (
            <p className="mt-2 text-xs text-muted-foreground/80 break-words">
              <span className="font-semibold">Error:</span> {error.message}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            variant="default"
          >
            Refresh page
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}

