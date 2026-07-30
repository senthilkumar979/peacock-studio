import type { FlowMapNodeStatus } from '@peacock/shared';
import { FLOW_MAP_STATUS_OPTIONS } from '@/workflow-artifacts/flowMapCanvasTheme';

interface FlowMapStatusPickerProps {
  value?: FlowMapNodeStatus;
  onChange: (status: FlowMapNodeStatus | undefined) => void;
  disabled?: boolean;
}

export const FlowMapStatusPicker = ({ value, onChange, disabled }: FlowMapStatusPickerProps) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      Review status
    </label>
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next ? (next as FlowMapNodeStatus) : undefined);
      }}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-peacock-400 focus:outline-none focus:ring-2 focus:ring-peacock-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">No status</option>
      {FLOW_MAP_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
