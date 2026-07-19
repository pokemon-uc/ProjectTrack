import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

// backend responses may be an array OR { key: [...] } — handle both
const asArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
};

function StudentDashboard() {
  const [active, setActive] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [msg, setMsg] = useState('');

  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', deadline: '' });
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('proposal');

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects/mine');
      setProjects(asArray(res.data, 'projects'));
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to load projects'); }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(asArray(res.data, 'notifications'));
      setUnread(res.data.unread ?? 0);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadProjects(); loadNotifications(); }, []);

  const openProject = async (p) => {
    setSelected(p);
    setActive('detail');
    setMsg('');
    try {
      const [m, c] = await Promise.all([
        api.get(`/projects/${p.id}/milestones`),
        api.get(`/projects/${p.id}/completion`),
      ]);
      setMilestones(asArray(m.data, 'milestones'));
      const cData = c.data;
const raw = typeof cData === 'number' ? cData
  : (cData.completion ?? cData.percent ?? cData.completionPercentage ?? cData.progress ?? 0);
const pct = parseFloat(String(raw)) || 0;
setCompletion(pct);
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to load project'); }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/projects', newProject);
      setNewProject({ title: '', description: '' });
      setMsg('Project created!');
      await loadProjects();
      setActive('projects');
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to create'); }
  };

  const addMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${selected.id}/milestones`, newMilestone);
      setNewMilestone({ title: '', description: '', deadline: '' });
      await openProject(selected);
    } catch (e) { setMsg(e.response?.data?.error || 'Failed to add milestone'); }
  };

  const completeMilestone = async (mid) => {
    try {
      await api.put(`/milestones/${mid}/complete`);
      await openProject(selected);
      await loadNotifications();
    } catch (e) { setMsg(e.response?.data?.error || 'Failed'); }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) { setMsg('Choose a file first'); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', fileType);
    try {
      await api.post(`/projects/${selected.id}/submissions`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setMsg('File uploaded!');
    } catch (e) { setMsg(e.response?.data?.error || 'Upload failed'); }
  };

  const submitProject = async () => {
    try {
      await api.put(`/projects/${selected.id}/submit`);
      setMsg('Project submitted!');
      await loadProjects();
    } catch (e) { setMsg(e.response?.data?.error || 'Submit failed'); }
  };

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); await loadNotifications(); } catch { /* ignore */ }
  };

  const links = [
    { key: 'projects', label: 'My Projects' },
    { key: 'new', label: 'New Project' },
    { key: 'notifications', label: `Notifications${unread ? ` (${unread})` : ''}` },
  ];

  return (
    <DashboardLayout title="Student Dashboard" links={links} active={active} onNavigate={setActive}>
      {msg && <p className="bg-blue-50 text-blue-700 text-sm rounded p-2 mb-4">{msg}</p>}

      {active === 'projects' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <StatCard value={projects.length} label="My Projects" />
            <StatCard value={unread} label="Unread Alerts" />
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">My Projects</h3>
            {projects.length === 0 ? <p className="text-slate-500 text-sm">No projects yet.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Title</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{p.title}</td>
                      <td className="capitalize">{p.status}</td>
                      <td className="text-right"><button onClick={() => openProject(p)} className="text-blue-600 hover:underline">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {active === 'new' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md">
          <h3 className="font-semibold text-slate-700 mb-3">Create New Project</h3>
          <form onSubmit={createProject} className="space-y-3">
            <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="Project title" className="w-full border border-slate-300 rounded px-3 py-2" required />
            <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Description" className="w-full border border-slate-300 rounded px-3 py-2" rows="3" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create</button>
          </form>
        </div>
      )}

      {active === 'detail' && selected && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <StatCard value={`${completion}%`} label="Completion" />
            <StatCard value={selected.status} label="Status" />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">{selected.title} — Milestones</h3>
            {milestones.length === 0 ? <p className="text-slate-500 text-sm mb-4">No milestones yet.</p> : (
              <table className="w-full text-sm mb-4">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Title</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2">{m.title}</td>
                      <td className="capitalize">{m.status}</td>
                      <td className="text-right">
                        {m.status !== 'completed' && <button onClick={() => completeMilestone(m.id)} className="text-blue-600 hover:underline">Mark complete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <form onSubmit={addMilestone} className="flex flex-wrap gap-2 items-end">
              <input value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} placeholder="Milestone title" className="border border-slate-300 rounded px-3 py-2 text-sm" required />
              <input type="date" value={newMilestone.deadline} onChange={(e) => setNewMilestone({ ...newMilestone, deadline: e.target.value })} className="border border-slate-300 rounded px-3 py-2 text-sm" />
              <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Add</button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Upload File</h3>
            <form onSubmit={uploadFile} className="flex flex-wrap gap-2 items-center">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
              <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="border border-slate-300 rounded px-2 py-2 text-sm">
                <option value="proposal">proposal</option>
                <option value="milestone">milestone</option>
                <option value="final_report">final_report</option>
              </select>
              <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Upload</button>
            </form>
          </div>

          <div>
            <button onClick={submitProject} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit Project</button>
            <button onClick={() => setActive('projects')} className="ml-2 text-slate-600 hover:underline">Back</button>
          </div>
        </div>
      )}

      {active === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Notifications</h3>
          {notifications.length === 0 ? <p className="text-slate-500 text-sm">No notifications.</p> : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className={`border rounded p-3 text-sm flex justify-between ${n.is_read ? 'bg-slate-50' : 'bg-blue-50'}`}>
                  <div>
                    <div className="font-medium text-slate-800">{n.title}</div>
                    <div className="text-slate-600">{n.message}</div>
                  </div>
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

export default StudentDashboard;
