import { ClipboardList, Radar } from 'lucide-react';

export type FlowContextTab = 'deliverables' | 'session';

interface FlowContextTabBarProps {
  activeTab: FlowContextTab;
  onTabChange: (tab: FlowContextTab) => void;
  showDeliverables: boolean;
  showSession: boolean;
}

export const FlowContextTabBar = ({
  activeTab,
  onTabChange,
  showDeliverables,
  showSession,
}: FlowContextTabBarProps) => {
  if (!showDeliverables || !showSession) return null;

  const tabs: { id: FlowContextTab; label: string; icon: typeof ClipboardList }[] = [
    { id: 'deliverables', label: 'Deliverables', icon: ClipboardList },
    { id: 'session', label: 'Session', icon: Radar },
  ];

  return (
    <div className="flex rounded-xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur-sm">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm shadow-slate-900/10'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
};
