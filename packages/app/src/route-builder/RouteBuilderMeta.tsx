import { useRouteBuilderStore } from '@/store/routeBuilderStore';

export const RouteBuilderMeta = () => {
  const route = useRouteBuilderStore((state) => state.route);
  const updateRouteDetails = useRouteBuilderStore((state) => state.updateRouteDetails);

  if (!route) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route</h2>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            value={route.title}
            onChange={(event) => updateRouteDetails(event.target.value, route.description)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={route.description}
            onChange={(event) => updateRouteDetails(route.title, event.target.value)}
            rows={2}
            placeholder="Optional summary for learners"
            className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
          />
        </label>
      </div>
    </section>
  );
};
