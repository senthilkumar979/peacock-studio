import { AuthenticatedAppFooter } from '@/components/footer/AuthenticatedAppFooter';
import { PublicAppFooter } from '@/components/footer/PublicAppFooter';
import { useIsAuthenticatedAppUser } from '@/hooks/useSessionMode';

export const AppFooter = () => {
  const isAuthenticated = useIsAuthenticatedAppUser();

  if (isAuthenticated) return <AuthenticatedAppFooter />;

  return <PublicAppFooter />;
};
