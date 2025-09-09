import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external error reporting service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send to Sentry or other error reporting service
      console.log('Error logged to service:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    const details = document.getElementById('error-details');
    if (details) {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. This has been logged and we'll look into it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1 hover-scale"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <Button 
                onClick={this.handleReload} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <div className="border-t pt-4">
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Show Technical Details
                </Button>
                
                <div 
                  id="error-details" 
                  style={{ display: 'none' }} 
                  className="mt-4 p-3 bg-muted rounded-lg"
                >
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                        {this.state.error?.toString()}
                      </pre>
                    </div>
                    
                    {this.state.error?.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Log to error reporting service
    try {
      // Send to external service
      console.log('Error reported:', {
        error: error.toString(),
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    } catch (loggingError) {
      console.error('Failed to report error:', loggingError);
    }
  };

  return { handleError };
}