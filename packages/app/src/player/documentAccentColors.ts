export interface DocumentAccentColors {
  borderLeft: string;
  borderLeftMuted: string;
  borderCardActive: string;
  ringActive: string;
  icon: string;
  iconBg: string;
  iconBgActive: string;
  label: string;
  textActive: string;
  bgActive: string;
  bgSubtle: string;
  stepBadgeActive: string;
}

const DOCUMENT_ACCENTS: DocumentAccentColors[] = [
  {
    borderLeft: 'border-peacock-500',
    borderLeftMuted: 'border-peacock-200',
    borderCardActive: 'border-peacock-400',
    ringActive: 'ring-peacock-200',
    icon: 'text-peacock-700',
    iconBg: 'bg-peacock-100',
    iconBgActive: 'bg-peacock-600',
    label: 'text-peacock-700',
    textActive: 'text-peacock-900',
    bgActive: 'bg-peacock-50',
    bgSubtle: 'bg-peacock-50/80',
    stepBadgeActive: 'bg-peacock-600',
  },
  {
    borderLeft: 'border-violet-500',
    borderLeftMuted: 'border-violet-200',
    borderCardActive: 'border-violet-400',
    ringActive: 'ring-violet-200',
    icon: 'text-violet-700',
    iconBg: 'bg-violet-100',
    iconBgActive: 'bg-violet-600',
    label: 'text-violet-700',
    textActive: 'text-violet-900',
    bgActive: 'bg-violet-50',
    bgSubtle: 'bg-violet-50/80',
    stepBadgeActive: 'bg-violet-600',
  },
  {
    borderLeft: 'border-cyan-500',
    borderLeftMuted: 'border-cyan-200',
    borderCardActive: 'border-cyan-400',
    ringActive: 'ring-cyan-200',
    icon: 'text-cyan-700',
    iconBg: 'bg-cyan-100',
    iconBgActive: 'bg-cyan-600',
    label: 'text-cyan-700',
    textActive: 'text-cyan-900',
    bgActive: 'bg-cyan-50',
    bgSubtle: 'bg-cyan-50/80',
    stepBadgeActive: 'bg-cyan-600',
  },
  {
    borderLeft: 'border-amber-500',
    borderLeftMuted: 'border-amber-200',
    borderCardActive: 'border-amber-400',
    ringActive: 'ring-amber-200',
    icon: 'text-amber-700',
    iconBg: 'bg-amber-100',
    iconBgActive: 'bg-amber-600',
    label: 'text-amber-700',
    textActive: 'text-amber-900',
    bgActive: 'bg-amber-50',
    bgSubtle: 'bg-amber-50/80',
    stepBadgeActive: 'bg-amber-600',
  },
  {
    borderLeft: 'border-rose-500',
    borderLeftMuted: 'border-rose-200',
    borderCardActive: 'border-rose-400',
    ringActive: 'ring-rose-200',
    icon: 'text-rose-700',
    iconBg: 'bg-rose-100',
    iconBgActive: 'bg-rose-600',
    label: 'text-rose-700',
    textActive: 'text-rose-900',
    bgActive: 'bg-rose-50',
    bgSubtle: 'bg-rose-50/80',
    stepBadgeActive: 'bg-rose-600',
  },
  {
    borderLeft: 'border-emerald-500',
    borderLeftMuted: 'border-emerald-200',
    borderCardActive: 'border-emerald-400',
    ringActive: 'ring-emerald-200',
    icon: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconBgActive: 'bg-emerald-600',
    label: 'text-emerald-700',
    textActive: 'text-emerald-900',
    bgActive: 'bg-emerald-50',
    bgSubtle: 'bg-emerald-50/80',
    stepBadgeActive: 'bg-emerald-600',
  },
  {
    borderLeft: 'border-orange-500',
    borderLeftMuted: 'border-orange-200',
    borderCardActive: 'border-orange-400',
    ringActive: 'ring-orange-200',
    icon: 'text-orange-700',
    iconBg: 'bg-orange-100',
    iconBgActive: 'bg-orange-600',
    label: 'text-orange-700',
    textActive: 'text-orange-900',
    bgActive: 'bg-orange-50',
    bgSubtle: 'bg-orange-50/80',
    stepBadgeActive: 'bg-orange-600',
  },
  {
    borderLeft: 'border-fuchsia-500',
    borderLeftMuted: 'border-fuchsia-200',
    borderCardActive: 'border-fuchsia-400',
    ringActive: 'ring-fuchsia-200',
    icon: 'text-fuchsia-700',
    iconBg: 'bg-fuchsia-100',
    iconBgActive: 'bg-fuchsia-600',
    label: 'text-fuchsia-700',
    textActive: 'text-fuchsia-900',
    bgActive: 'bg-fuchsia-50',
    bgSubtle: 'bg-fuchsia-50/80',
    stepBadgeActive: 'bg-fuchsia-600',
  },
];

function hashIdentifier(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getAccentColors(id: string, salt: string): DocumentAccentColors {
  const paletteIndex = hashIdentifier(`${salt}:${id}`) % DOCUMENT_ACCENTS.length;
  return DOCUMENT_ACCENTS[paletteIndex] ?? DOCUMENT_ACCENTS[0]!;
}

export function getBranchAccentColors(branchId: string): DocumentAccentColors {
  return getAccentColors(branchId, 'branch');
}

export function getPathAccentColors(pathId: string): DocumentAccentColors {
  return getAccentColors(pathId, 'path');
}
