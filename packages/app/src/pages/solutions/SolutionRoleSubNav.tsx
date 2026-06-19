import type { SolutionRole } from './solutionsData';
import { useActiveSection } from './useActiveSection';

interface SolutionRoleSubNavProps {
  role: SolutionRole;
}

const SECTIONS = [
  { id: 'challenges', label: 'Challenges' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'why-peacock', label: 'Why Peacock' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'impact', label: 'Outcomes' },
  { id: 'get-started', label: 'Get started' },
] as const;

const SECTION_IDS = SECTIONS.map((section) => section.id);

export const SolutionRoleSubNav = ({ role }: SolutionRoleSubNavProps) => {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <nav
      aria-label={`${role.shortTitle} page sections`}
      className="sticky top-[4.25rem] z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-2.5 scrollbar-none">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-peacock-50 font-semibold text-peacock-800 ring-1 ring-peacock-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-peacock-800'
              }`}
            >
              {section.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
};
