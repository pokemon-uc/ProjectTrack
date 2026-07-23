import { STATUS_STYLES } from '../lib/constants';

export default function StatusBadge({ status, className = '' }) {
  const key = String(status ?? '').toLowerCase().replace(/\s+/g, '_');
  const cls = STATUS_STYLES[key] || 'bg-gray-100 text-gray-700';
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} ${className}`}>
      {label}
    </span>
  );
}
