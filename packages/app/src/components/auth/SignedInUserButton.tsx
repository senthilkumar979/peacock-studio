import { useClerk, UserButton } from '@clerk/react';
import { markIntentionalSignOut } from '@/cloud/sessionIntent';
import { notifyInfo } from '@/utils/notify';

interface SignedInUserButtonProps {
  avatarClassName?: string;
}

/**
 * Clerk UserButton that marks intentional sign-out so CloudSyncProvider
 * does not show a false "session ended" toast.
 */
export const SignedInUserButton = ({
  avatarClassName = 'h-9 w-9 ring-2 ring-white/30',
}: SignedInUserButtonProps) => {
  const { signOut } = useClerk();

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: avatarClassName,
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Action label="manageAccount" />
        {/* Use reserved `signOut` label so we reorder the default item — a custom
            "Sign out" string would render a duplicate next to Clerk's built-in. */}
        <UserButton.Action
          label="signOut"
          onClick={() => {
            markIntentionalSignOut();
            notifyInfo(
              'Signed out',
              'Your local guest library remains on this device.',
            );
            void signOut({ redirectUrl: '/' });
          }}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};
