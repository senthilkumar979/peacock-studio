import { Component, type ErrorInfo, type ReactNode } from 'react';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { DASHBOARD_PATH } from '@/constants/routes';
import { logAppError } from '@/utils/appError';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message ? String(error.message) : null,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logAppError('Uncaught React render error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, message: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <HardErrorPage
          title="This page crashed"
          description="A rendering error stopped Peacock. You can retry this view or return to your dashboard."
          detail={this.state.message}
          onRetry={this.handleRetry}
          homePath={DASHBOARD_PATH}
          homeLabel="Go to dashboard"
        />
      );
    }

    return this.props.children;
  }
}
