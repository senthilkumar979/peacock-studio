import { Component, type ErrorInfo, type ReactNode } from 'react';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { DASHBOARD_PATH, isEmbedSharePath } from '@/constants/routes';
import { logSoftFailure } from '@/utils/appError';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
}

interface ChunkErrorBoundaryState {
  error: Error | null;
}

export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'string'
        ? error
        : '';
  return /ChunkLoadError|Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
    message,
  );
}

/**
 * Catches failed lazy route chunk loads and offers a retry (reload) without
 * taking down the whole app shell. Non-chunk errors rethrow to the parent
 * AppErrorBoundary.
 */
export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (!isChunkLoadError(error)) return;
    logSoftFailure('Route chunk load failed', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleRetry = (): void => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (!isChunkLoadError(error)) {
        // Propagate to the root AppErrorBoundary.
        throw error;
      }
      const embed = isEmbedSharePath(window.location.pathname);
      return (
        <HardErrorPage
          embed={embed}
          title="Failed to load this page"
          description={
            embed
              ? 'A required code bundle did not load. Check your connection, then refresh.'
              : 'A required code bundle did not load. Check your connection, then retry.'
          }
          detail={error.message}
          onRetry={this.handleRetry}
          homePath={DASHBOARD_PATH}
          homeLabel="Go to dashboard"
        />
      );
    }

    return this.props.children;
  }
}
