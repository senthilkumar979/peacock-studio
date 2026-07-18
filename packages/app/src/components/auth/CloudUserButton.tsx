import { UserButton } from '@clerk/react';
import { isCloudSyncEnabled } from '@/cloud/config';

export const CloudUserButton = () => {
  if (!isCloudSyncEnabled()) return null;

  return (
    <div className="absolute right-6 top-6 z-10">
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'h-9 w-9 ring-2 ring-white/30',
          },
        }}
      />
    </div>
  );
};
