import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const asArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
};

function GuideDashboard() {
  const [active, setActive] = useState('review');
  const [projectId, setProjectId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [msg, setMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [fb, setFb] = useState({ status: 'approved', comments: '' });
  const [activeSub, setActiveSub] = useState(null);
  const [grade, setGrade] = useState({ score: '', remarks: '' });

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(asArray(res.data, 'notifications'));
      setUnread(res.data.unread ?? 0);
    } catch { /* ignore */ }
  };
  useEffect(() => { loadNotifications(); }, []);

  const loadSubmissions = async (e) => {
    if (e) e.preventDefault();
    setMsg('');
    try {
      const res = await api.get(`/projects/${projectId}/submissions`);
      const list = asArray(res.data, 'submissions');
      setSubmissions(list);
      if (list.length === 0) setMsg('No submissions for this project.');
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to load'); }
  };

  const giveFeedback = async (subId) => {
    try {
      await api.post(`/submissions/${subId}/feedback`, fb);
      setMsg('Feedback submitted!');
      setActiveSub(null);
      await loadSubmissions();
    } catch (e) { setMsg(e.response?.data?.error || 'Feedback failed'); }
  };

  const gradeProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${projectId}/grade`, grade);
      const g = res.data.grade || res.data;
      setMsg(`Project graded: ${g.score}/100 (${g.grade_letter || ''})`);
      setGrade({ score: '', remarks: '' });
    } catch (e) { setMsg(e.response?.data?.error || 'Grade failed'); }
  };

  const markRead = async (id) => { try { await api.put(`/notifications/${id}/read`); await loadNotifications(); } catch { /* ignore */ } };

  const links = [
    { key: 'review', label: 'Review & Grade' },
    { key: 'notifications', label: `Notifications${unread ? ` (${unread})` : ''}` },
  ];

  return (
    <DashboardLayout title="Guide Dashboard" links={links} active={active} onNavigate={setActive}>
      {msg && <p className="bg-blue-50 text-blue-700 text-sm rounded p-2 mb-4">{msg}</p>}

      {active === 'review' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Open a Project</h3>
            <form onSubmit={loadSubmissions} className="flex gap-2 items-end">
              <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID (e.g. 1)" className="border border-slate-300 rounded px-3 py-2 text-sm" required />
              <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Load</button>
            </form>
          </div>

          {submissions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Submissions</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">ID</th><th>Type</th><th>Version</th><th></th></tr></thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 align-top">
                      <td className="py-2">{s.id}</td>
                      <td>{s.type}</td>
                      <td>{s.current_version}</td>
                      <td className="text-right">
                        <button onClick={() => setActiveSub(activeSub === s.id ? null : s.id)} className="text-blue-600 hover:underline">Give feedback</button>
                        {activeSub === s.id && (
                          <div className="mt-2 text-left space-y-2">
                            <select value={fb.status} onChange={(e) => setFb({ ...fb, status: e.target.value })} className="border border-slate-300 rounded px-2 py-1 text-sm w-full">
                              <option value="approved">approved</option>
                              <option value="rejected">rejected</option>
                              <option value="revision_needed">revision_needed</option>
                            </select>
                            <textarea value={fb.comments} onChange={(e) => setFb({ ...fb, comments: e.target.value })} placeholder="Comments" className="border border-slate-300 rounded px-2 py-1 text-sm w-full" rows="2" />
                            <button onClick={() => giveFeedback(s.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Submit feedback</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {projectId && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 max-w-md">
              <h3 className="font-semibold text-slate-700 mb-3">Grade Project #{projectId}</h3>
              <form onSubmit={gradeProject} className="space-y-2">
                <input type="number" min="0" max="100" value={grade.score} onChange={(e) => setGrade({ ...grade, score: e.target.value })} placeholder="Score (0-100)" className="border border-slate-300 rounded px-3 py-2 text-sm w-full" required />
                <textarea value={grade.remarks} onChange={(e) => setGrade({ ...grade, remarks: e.target.value })} placeholder="Remarks" className="border border-slate-300 rounded px-3 py-2 text-sm w-full" rows="2" />
                <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Submit Grade</button>
              </form>
            </div>
          )}
        </div>
      )}

      {active === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Notifications</h3>
          {notifications.length === 0 ? <p className="text-slate-500 text-sm">No notifications.</p> : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className={`border rounded p-3 text-sm flex justify-between ${n.is_read ? 'bg-slate-50' : 'bg-blue-50'}`}>
                  <div><div className="font-medium text-slate-800">{n.title}</div><div className="text-slate-600">{n.message}</div></div>
                  {!n.is_read && <button onClick={() => markRead(n.id)} className="text-blue-600 hover:underline">Mark read</button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default GuideDashboard;
