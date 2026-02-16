import { Component, ReactNode } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error logged to state
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="max-w-md w-full border-l-danger">
            <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-text-secondary mb-6">
              An unexpected error occurred in this module.
            </p>
            <div className="bg-tertiary-bg p-4 rounded-lg mb-6 overflow-auto max-h-40">
              <code className="text-xs text-danger font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="w-full justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
