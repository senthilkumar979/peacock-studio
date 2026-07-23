import { Link } from 'react-router-dom';
import { LANDING_PATH } from '@/constants/routes';

interface CloudAuthConfigErrorProps {
  message: string;
  title?: string;
}

export const CloudAuthConfigError = ({
  message,
  title = 'Cloud sign-in is not configured',
}: CloudAuthConfigErrorProps) => {
  return (
    <div
      className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center shadow-sm"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-amber-950">{title}</h2>
      <p className="mt-2 text-sm text-amber-900/90">{message}</p>
      <Link
        to={LANDING_PATH}
        className="mt-6 inline-block text-sm font-semibold text-peacock-700 hover:text-peacock-800"
      >
        ← Back to Peacock Studio
      </Link>
    </div>
  );
};
