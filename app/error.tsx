"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console; wire to an error reporter (Sentry etc.) in prod.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex max-w-2xl flex-col items-center py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        An unexpected error occurred. Please try again — if it keeps happening, contact support.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>}
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
