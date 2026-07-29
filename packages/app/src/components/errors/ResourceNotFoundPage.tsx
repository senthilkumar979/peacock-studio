import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { DASHBOARD_PATH } from '@/constants/routes';

interface ResourceNotFoundPageProps {
  title: string;
  description: string;
  isEmbed?: boolean;
}

/** Hard error UI for primary resources the user navigated to that are missing. */
export const ResourceNotFoundPage = ({
  title,
  description,
  isEmbed = false,
}: ResourceNotFoundPageProps) => (
  <HardErrorPage
    embed={isEmbed}
    title={title}
    description={description}
    homePath={DASHBOARD_PATH}
    homeLabel="Go to dashboard"
  />
);
