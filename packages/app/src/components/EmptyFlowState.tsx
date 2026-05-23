import { Link } from 'react-router-dom';

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
        to="/"
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);
