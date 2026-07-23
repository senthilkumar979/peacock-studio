import type { LucideIcon } from 'lucide-react';
import type { OrgContributorRow } from '@/cloud/repositories/organizationRepository';

export function contributorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function topContributorHint(rows: OrgContributorRow[], unit: string): string | null {
  const leader = rows[0];
  if (!leader || leader.count <= 0) return null;
  return `${leader.displayName} · ${leader.count} ${unit}`;
}

export interface ContributorBoard {
  title: string;
  subtitle: string;
  unit: string;
  icon: LucideIcon;
  accent: string;
  rows: OrgContributorRow[];
}
