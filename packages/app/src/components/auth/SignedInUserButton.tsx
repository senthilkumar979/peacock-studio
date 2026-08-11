import { useEffect } from 'react';
import { useClerk, UserButton } from '@clerk/react';
import { markIntentionalSignOut } from '@/cloud/sessionIntent';
import { notifyInfo } from '@/utils/notify';

interface SignedInUserButtonProps {
  avatarClassName?: string;
}

/**
 * Clerk UserButton that marks intentional sign-out so CloudSyncProvider
 * does not show a false "session ended" toast.
 *
 * Do not add a custom "Sign out" MenuItems action — that duplicates Clerk's
 * built-in item. Side effects run by wrapping `clerk.signOut` instead.
 */
export const SignedInUserButton = ({
  avatarClassName = 'h-9 w-9 ring-2 ring-white/30',
}: SignedInUserButtonProps) => {
  const clerk = useClerk();

  useEffect(() => {
    const originalSignOut = clerk.signOut.bind(clerk);
    clerk.signOut = ((...args: Parameters<typeof clerk.signOut>) => {
      markIntentionalSignOut();
      notifyInfo(
        'Signed out',
        'Your local guest library remains on this device.',
      );
      return originalSignOut(...args);
    }) as typeof clerk.signOut;

    return () => {
      clerk.signOut = originalSignOut;
    };
  }, [clerk]);

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: avatarClassName,
        },
      }}
    />
  );
};
