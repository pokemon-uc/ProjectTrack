import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

function CoordinatorDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState('overview');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  }, []);

  const links = [{ key: 'overview', label: 'Overview' }];

  return (
    <DashboardLayout title="Coordinator Dashboard" links={links} active={active} onNavigate={setActive}>
      {error && <p className="text-red-600">{error}</p>}
      {!data && !error && <p className="text-slate-500">Loading...</p>}

      {data && (
        <>
          {/* stat cards row */}
          <div className="flex flex-wrap gap-4 mb-6">
            <StatCard value={data.totals.total_projects} label="Total Projects" />
            <StatCard value={data.totals.total_students} label="Total Students" />
            <StatCard value={data.totals.total_guides} label="Total Guides" />
            <StatCard value={data.delayedCount} label="Delayed Projects" />
            <StatCard value={data.averageGrade ?? '—'} label="Average Grade" />
          </div>

          {/* status breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-700 mb-3">Projects by Status</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Status</th><th className="py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.statusBreakdown.map((row) => (
                  <tr key={row.status} className="border-b last:border-0">
                    <td className="py-2 capitalize">{row.status}</td>
                    <td className="py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* department breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Projects by Department</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Department</th><th className="py-2">Projects</th>
                </tr>
              </thead>
              <tbody>
                {data.byDepartment.map((row) => (
                  <tr key={row.department} className="border-b last:border-0">
                    <td className="py-2">{row.department}</td>
                    <td className="py-2">{row.project_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default CoordinatorDashboard;
