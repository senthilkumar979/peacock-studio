/** Format "Updated {date} · {name}" using a profile name resolved from email. */
export function formatUpdatedByLine(
  updatedAt: number,
  updatedByEmail: string | null | undefined,
  formatDate: (ms: number) => string,
  createdByEmail?: string | null,
  displayNamesByEmail: Record<string, string> = {},
  includeUpdatedPrefix = true,
  includeOwnerName = true,
): string {
  const when = formatDate(updatedAt);
  const name = resolveDisplayNameFromEmails(
    updatedByEmail,
    createdByEmail,
    displayNamesByEmail,
  );
  if (!name) return `${when}`;
  return `${includeUpdatedPrefix ? "Updated " : ""}${when} ${includeOwnerName ? `· ${name}` : ""}`;
}

export function resolveDisplayNameFromEmails(
  updatedByEmail?: string | null,
  createdByEmail?: string | null,
  displayNamesByEmail: Record<string, string> = {},
): string | null {
  for (const email of [updatedByEmail, createdByEmail]) {
    const key = email?.trim().toLowerCase();
    if (!key) continue;
    const name = displayNamesByEmail[key]?.trim();
    if (name) return name;
  }
  return null;
}
