import { useEffect, useMemo, useState } from 'react';
import { isCloudLibraryActive } from '@/cloud/authContext';
import { fetchDisplayNamesByEmail } from '@/cloud/repositories/profileRepository';

/** Loads display names for the given emails from `user_profiles`. */
export function useProfileDisplayNames(
  emails: Array<string | null | undefined>,
): Record<string, string> {
  const emailKey = useMemo(() => {
    const unique = [
      ...new Set(
        emails
          .map((email) => email?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email)),
      ),
    ].sort();
    return unique.join('|');
  }, [emails]);

  const [namesByEmail, setNamesByEmail] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!emailKey || !isCloudLibraryActive()) {
      setNamesByEmail({});
      return;
    }

    let cancelled = false;
    const list = emailKey.split('|').filter(Boolean);

    void fetchDisplayNamesByEmail(list)
      .then((map) => {
        if (!cancelled) setNamesByEmail(map);
      })
      .catch(() => {
        if (!cancelled) setNamesByEmail({});
      });

    return () => {
      cancelled = true;
    };
  }, [emailKey]);

  return namesByEmail;
}
