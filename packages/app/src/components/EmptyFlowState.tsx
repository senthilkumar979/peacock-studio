import { Link } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';

interface EmptyFlowStateProps {
  title: string;
  description: string;
}

export const EmptyFlowState = ({ title, description }: EmptyFlowStateProps) => (
  <div className="flex flex-1 items-center justify-center p-8">
    <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link
        to={DASHBOARD_PATH}
        className="btn-peacock mt-4"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);
