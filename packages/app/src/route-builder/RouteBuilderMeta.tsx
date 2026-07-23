import { FieldInput, FieldTextarea, FormField } from '@/components/ui';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';

export const RouteBuilderMeta = () => {
  const route = useRouteBuilderStore((state) => state.route);
  const updateRouteDetails = useRouteBuilderStore((state) => state.updateRouteDetails);

  if (!route) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route</h2>
      <div className="mt-3 space-y-3">
        <FormField label="Title">
          <FieldInput
            type="text"
            value={route.title}
            onChange={(event) => updateRouteDetails(event.target.value, route.description)}
          />
        </FormField>
        <FormField label="Description">
          <FieldTextarea
            value={route.description}
            onChange={(event) => updateRouteDetails(route.title, event.target.value)}
            rows={2}
            placeholder="Optional summary for learners"
          />
        </FormField>
      </div>
    </section>
  );
};
