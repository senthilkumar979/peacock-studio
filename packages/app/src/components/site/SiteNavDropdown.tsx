import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SiteNavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface SiteNavDropdownProps {
  label: string;
  href: string;
  items: SiteNavDropdownItem[];
  isActive?: boolean;
}

export const SiteNavDropdown = ({ label, href, items, isActive = false }: SiteNavDropdownProps) => (
  <div className="group relative">
    <Link
      to={href}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition hover:text-white ${
        isActive ? 'text-white' : 'text-slate-300'
      }`}
    >
      {label}
      <ChevronDown
        className="h-3.5 w-3.5 text-slate-400 transition group-hover:rotate-180 group-focus-within:rotate-180"
        aria-hidden
      />
    </Link>

    <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="w-[42rem] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-peacock-900 p-2 shadow-xl shadow-black/30">
        <div className="grid grid-cols-3 gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="rounded-lg px-3 py-2.5 transition hover:bg-white/10"
            >
              <span className="block text-sm font-medium leading-snug text-white">{item.label}</span>
              {item.description ? (
                <span className="mt-1 block text-xs leading-relaxed text-slate-400 line-clamp-2">
                  {item.description}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
