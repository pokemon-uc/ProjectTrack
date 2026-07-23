import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import { ErrorState } from '../components/EmptyState';
import { formatRelative } from '../lib/formatters';
import { NOTIFICATION_TYPES } from '../lib/constants';

export default function NotificationsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/notifications')
      .then(res => setItems(res.data.notifications ?? res.data ?? []))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      load();
    } catch {
      addToast('Failed to mark as read', 'error');
    }
  };

  const markAll = async () => {
    try {
      await api.put('/notifications/read-all');
      addToast('All notifications marked as read', 'success');
      load();
    } catch {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const unread = items.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-indigo-600 text-sm font-medium hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-80" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="All caught up!"
          message="No new notifications. We'll notify you when your guide reviews your submission or when milestones are due."
        />
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const typeInfo = NOTIFICATION_TYPES[n.type] || { icon: '📢', color: 'text-gray-600' };
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-4 transition-all hover:shadow-md ${
                  !n.is_read ? 'border-l-4 border-l-indigo-500 bg-indigo-50/50' : ''
                }`}
              >
                <span className="text-xl mt-0.5">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">{formatRelative(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => markOne(n.id)}
                        className="text-indigo-600 text-xs font-medium hover:underline whitespace-nowrap mt-1"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
