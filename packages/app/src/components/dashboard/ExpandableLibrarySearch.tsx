import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExpandableLibrarySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ExpandableLibrarySearch = ({
  value,
  onChange,
  placeholder = "Search by title, description, or version…",
}: ExpandableLibrarySearchProps) => {
  const [isExpanded, setIsExpanded] = useState(() => Boolean(value.trim()));
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isExpanded) return;
    inputRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      if (!value.trim()) setIsExpanded(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [value]);

  const openSearch = () => setIsExpanded(true);

  const handleIconClick = () => {
    if (isExpanded) {
      inputRef.current?.focus();
      return;
    }
    openSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    if (value.trim()) onChange("");
    else setIsExpanded(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={rootRef} className="relative">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        animate={{ width: isExpanded ? 350 : 42 }}
        className={`flex h-[42px] items-center overflow-hidden rounded-xl border transition-colors ${
          isExpanded
            ? "border-peacock-300 bg-white ring-2 ring-peacock-500/15"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
        }`}
      >
        <button
          type="button"
          onClick={handleIconClick}
          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center text-slate-500 transition hover:text-peacock-700"
          aria-label="Search documentations"
          aria-expanded={isExpanded}
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.label
              key="search-field"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex w-full min-w-0 flex-1 items-center pr-3"
            >
              <span className="sr-only">Search documentations</span>
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </motion.label>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
