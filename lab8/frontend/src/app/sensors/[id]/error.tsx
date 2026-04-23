"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sensor Transmission Error</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered a problem while fetching telemetry from the IoT gateway. This could be due to a lost connection or an invalid sensor ID.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </button>
        <button
          onClick={() => window.location.href = '/sensors'}
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        >
          Return to Hub
        </button>
      </div>
      
      <p className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
        Error Digest: {error.digest || 'no-digest-available'}
      </p>
    </div>
  );
}
