import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import type { RouteBuilderViewMode, RouteStatus } from '@/types/route';

interface RouteBuilderToolbarProps {
  routeId: string;
  viewMode: RouteBuilderViewMode;
  onViewModeChange: (mode: RouteBuilderViewMode) => void;
}

export const RouteBuilderToolbar = ({
  routeId,
  viewMode,
  onViewModeChange,
}: RouteBuilderToolbarProps) => {
  const route = useRouteBuilderStore((state) => state.route);
  const setRouteStatus = useRouteBuilderStore((state) => state.setRouteStatus);

  if (!route) return null;

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRouteStatus(event.target.value as RouteStatus);
  };

  return (
    <AppHeader
      eyebrow="RouteHub Builder"
      title={route.title}
      description={route.description || undefined}
      homeLink
      routeId={routeId}
      route={route}
    >
      <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            viewMode === 'list' ? 'bg-peacock-50 text-peacock-800' : 'text-slate-600'
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('canvas')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            viewMode === 'canvas' ? 'bg-peacock-50 text-peacock-800' : 'text-slate-600'
          }`}
        >
          Canvas
        </button>
      </div>
      <select
        value={route.status}
        onChange={handleStatusChange}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        aria-label="Route status"
      >
        <option value="draft">Draft</option>
        <option value="live">Live</option>
      </select>
      <Link
        to={`/routes/${routeId}`}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Preview route
      </Link>
    </AppHeader>
  );
};
