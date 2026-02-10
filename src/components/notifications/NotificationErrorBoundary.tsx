"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class NotificationErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Notification Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex flex-col items-center text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-sm">Notifications Error</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Something went wrong loading notifications.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useNotificationErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const ErrorBoundaryFallback = React.useCallback(() => {
    if (!error) return null;

    return (
      <Card className="p-4 border-destructive/50 bg-destructive/5">
        <div className="flex flex-col items-center text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="font-semibold text-sm">Notifications Error</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Something went wrong loading notifications.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetError}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }, [error, resetError]);

  return {
    error,
    setError,
    resetError,
    ErrorBoundaryFallback,
  };
}
