import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props & { location: any }, State> {
  constructor(props: Props & { location: any }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to Sentry or other error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: Props & { location: any }) {
    // Reset error boundary when route changes
    if (this.props.location !== prevProps.location) {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const routeName = this.props.location?.pathname || 'Unknown';
      
      return (
        <div className='flex min-h-screen items-center justify-center bg-background p-4'>
          <Card className='w-full max-w-2xl'>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
                  <AlertTriangle className='h-6 w-6 text-destructive' />
                </div>
                <div>
                  <CardTitle className='text-2xl'>Something went wrong</CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    An error occurred while rendering this page
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg bg-muted p-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Route:</span>
                    <code className='text-sm'>{routeName}</code>
                  </div>
                  {this.state.error && (
                    <div className='flex items-start justify-between'>
                      <span className='text-sm font-medium'>Error:</span>
                      <code className='text-sm text-destructive max-w-md text-right'>
                        {this.state.error.message}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className='rounded-lg bg-muted p-4'>
                  <summary className='cursor-pointer text-sm font-medium'>
                    Stack Trace (Development Only)
                  </summary>
                  <pre className='mt-2 overflow-auto text-xs'>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className='flex space-x-3'>
                <Button onClick={this.handleReset} className='flex-1'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant='outline' className='flex-1'>
                  <Home className='mr-2 h-4 w-4' />
                  Go to Dashboard
                </Button>
              </div>

              <p className='text-xs text-muted-foreground text-center'>
                If this problem persists, please contact support with the error details above.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide location prop
export function ErrorBoundary({ children }: Props) {
  const location = useLocation();
  return (
    <ErrorBoundaryClass location={location}>
      {children}
    </ErrorBoundaryClass>
  );
}
