import { HardErrorPage, type HardErrorPageProps } from '@/components/errors/HardErrorPage';

/** Back-compat alias for the dedicated hard error UI. */
export const GenericErrorPage = (props: HardErrorPageProps) => <HardErrorPage {...props} />;
