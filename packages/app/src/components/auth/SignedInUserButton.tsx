import { LogOut } from 'lucide-react';
import { useClerk, UserButton } from '@clerk/react';
import { markIntentionalSignOut } from '@/cloud/sessionIntent';

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
        <UserButton.Action
          label="Sign out"
          labelIcon={<LogOut className="h-4 w-4" aria-hidden />}
          onClick={() => {
            markIntentionalSignOut();
            void signOut({ redirectUrl: '/' });
          }}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};
