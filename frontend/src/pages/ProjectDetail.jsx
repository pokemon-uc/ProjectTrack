import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import SkeletonCard from "../components/SkeletonCard";
import { ErrorState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDateTime, formatDate, formatFileSize } from "../lib/formatters";

export default function ProjectDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [history, setHistory] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const isStudent = user?.role === "student";
  const isGuide = user?.role === "guide";
  const isCoordinator = user?.role === "coordinator";

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, h, s, t] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/status-history`),
        api.get(`/projects/${id}/submissions`),
        api.get(`/projects/${id}/threads`),
      ]);
      setProject(p.data.project ?? p.data);
      setHistory(h.data.history ?? h.data ?? []);
      setSubmissions(s.data.submissions ?? s.data ?? []);
      setThreads(t.data.threads ?? t.data ?? []);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, [id]);
  useEffect(() => {
    const tabByHash = {
      "#submissions": "submissions",
      "#milestones": "milestones",
      "#discussion": "discussions",
      "#discussions": "discussions",
      "#history": "history",
    };

    const requestedTab = tabByHash[location.hash];

    if (requestedTab) {
      setActiveTab(requestedTab);
    } else if (!location.hash) {
      setActiveTab("overview");
    }
  }, [location.hash]);

  const submitProject = async () => {
    try {
      await api.put(`/projects/${id}/submit`);
      addToast("Project submitted for review!", "success");
      loadAll();
    } catch {
      addToast("Failed to submit project", "error");
    }
  };

  const giveFeedback = async (subId, status) => {
    const comments = prompt(`Comments for "${status.replace(/_/g, " ")}":`);
    try {
      await api.post(`/submissions/${subId}/feedback`, {
        status,
        comments: comments || "",
      });
      addToast("Feedback saved", "success");
      loadAll();
    } catch {
      addToast("Failed to save feedback", "error");
    }
  };

  if (loading) {
    return (
      <DashboardLayout projectId={id}>
        <SkeletonCard lines={6} />
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout projectId={id}>
        <ErrorState message={error || "Project not found"} onRetry={loadAll} />
      </DashboardLayout>
    );
  }

  const tabs = [
    {
      key: "overview",
      label: "Overview",
    },
    {
      key: "submissions",
      label: `Submissions (${submissions.length})`,
    },
    {
      key: "milestones",
      label: "Milestones",
    },
    {
      key: "discussions",
      label: `Discussions (${threads.length})`,
    },
    {
      key: "history",
      label: "Status History",
    },
  ];

  return (
    <DashboardLayout projectId={id}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{project.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            {project.student_name && <span>👤 {project.student_name}</span>}
            {project.guide_name && <span>👨‍🏫 {project.guide_name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} className="text-sm px-3 py-1" />
          {isStudent && project.status === "draft" && (
            <button onClick={submitProject} className="btn-primary">
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              const tabHash = {
                overview: "",
                submissions: "#submissions",
                milestones: "#milestones",
                discussions: "#discussion",
                history: "#history",
              };

              setActiveTab(tab.key);

              navigate(`/projects/${id}${tabHash[tab.key]}`, { replace: true });
            }}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab project={project} />}
      {activeTab === "submissions" && (
        <SubmissionsTab
          projectId={id}
          submissions={submissions}
          isStudent={isStudent}
          isGuide={isGuide}
          reload={loadAll}
        />
      )}
      {activeTab === "milestones" && (
        <MilestonesTab
          projectId={id}
          isStudent={isStudent}
          canManage={isGuide || isCoordinator}
        />
      )}
      {activeTab === "discussions" && (
        <DiscussionsTab projectId={id} threads={threads} reload={loadAll} />
      )}
      {activeTab === "history" && <HistoryTab history={history} />}
    </DashboardLayout>
  );
}

function OverviewTab({ project }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {project.description && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Status</p>
            <StatusBadge status={project.status} />
          </div>
          <div>
            <p className="text-gray-400">Department</p>
            <p className="text-slate-700 font-medium">
              {project.department || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionsTab({
  projectId,
  submissions,
  isStudent,
  isGuide,
  reload,
}) {
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [type, setType] = useState("proposal");
  const [uploading, setUploading] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState({});

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      await api.post(`/projects/${projectId}/submissions`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      addToast("File uploaded successfully", "success");
      reload();
    } catch (err) {
      addToast(err.response?.data?.error ?? "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const toggleVersions = async (subId) => {
    if (expandedVersions[subId]) {
      setExpandedVersions((prev) => ({ ...prev, [subId]: null }));
      return;
    }
    try {
      const res = await api.get(`/submissions/${subId}/versions`);
      setExpandedVersions((prev) => ({
        ...prev,
        [subId]: res.data.versions ?? res.data ?? [],
      }));
    } catch {
      addToast("Failed to load versions", "error");
    }
  };

  const downloadVersion = async (version) => {
    try {
      const response = await api.get(
        `/submission-versions/${version.id}/download`,
        { responseType: "blob" },
      );
      const disposition = response.headers["content-disposition"] || "";
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const regularName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
      const fileName = encodedName
        ? decodeURIComponent(encodedName)
        : regularName || `submission-v${version.version_number}`;
      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      addToast(
        error.response?.data?.error || "Unable to download file",
        "error",
      );
    }
  };

  const giveFeedback = async (subId, status) => {
    const comments =
      prompt(`Comments for "${status.replace(/_/g, " ")}":`) || "";
    try {
      await api.post(`/submissions/${subId}/feedback`, { status, comments });
      addToast("Feedback saved", "success");
      reload();
    } catch {
      addToast("Failed to save feedback", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload zone (student only) */}
      {isStudent && (
        <form onSubmit={upload} className="card">
          <h3 className="font-semibold text-slate-800 mb-4">
            Upload New Submission
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
              >
                <option value="proposal">Proposal</option>
                <option value="milestone">Milestone</option>
                <option value="final_report">Final Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                File (PDF/DOCX/ZIP max 10MB)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="text-sm"
                accept=".pdf,.doc,.docx,.zip"
              />
            </div>
            <button disabled={!file || uploading} className="btn-primary">
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      )}

      {/* Submission list */}
      {submissions.length === 0 ? (
        <div className="card text-center py-10 text-gray-500 text-sm">
          No submissions yet.
        </div>
      ) : (
        submissions.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 capitalize">
                  {String(s.type).replace(/_/g, " ")}
                </span>
                <span className="text-sm text-gray-400 ml-2">
                  v{s.current_version}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {formatDate(s.submitted_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVersions(s.id)}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  {expandedVersions[s.id] ? "Hide versions" : "View versions"}
                </button>
                {isGuide && (
                  <>
                    <button
                      onClick={() => giveFeedback(s.id, "approved")}
                      className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => giveFeedback(s.id, "revision_needed")}
                      className="bg-amber-500 text-white px-2.5 py-1 rounded text-xs hover:bg-amber-600"
                    >
                      Changes
                    </button>
                    <button
                      onClick={() => giveFeedback(s.id, "rejected")}
                      className="bg-red-600 text-white px-2.5 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Version list */}
            {expandedVersions[s.id] && (
              <div className="mt-3 pl-4 border-l-2 border-indigo-200 space-y-1.5">
                {expandedVersions[s.id].map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span className="text-gray-600">
                      <span className="font-mono font-medium">
                        v{v.version_number}
                      </span>
                      <span className="mx-2 text-gray-400">·</span>
                      <span>{formatDateTime(v.uploaded_at)}</span>
                      {v.notes && (
                        <span className="text-gray-500 ml-2">— {v.notes}</span>
                      )}
                    </span>
                    {(v.has_file || v.file_path) && (
                      <button
                        type="button"
                        onClick={() => downloadVersion(v)}
                        className="text-indigo-600 hover:underline"
                      >
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
function MilestonesTab({ projectId, isStudent, canManage }) {
  const { addToast } = useToast();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/milestones`);
      setMilestones(response.data.milestones ?? []);
    } catch (error) {
      addToast(
        error.response?.data?.error || "Failed to load milestones",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const createNewMilestone = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      addToast("Enter a milestone title", "error");
      return;
    }

    setCreating(true);
    try {
      await api.post(`/projects/${projectId}/milestones`, {
        title: form.title.trim(),
        description: form.description.trim(),
        deadline: form.deadline || null,
      });
      setForm({ title: "", description: "", deadline: "" });
      setShowForm(false);
      addToast("Milestone created", "success");
      loadMilestones();
    } catch (error) {
      addToast(
        error.response?.data?.error || "Failed to create milestone",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const submitForReview = async (milestoneId) => {
    try {
      await api.put(`/milestones/${milestoneId}/submit`);
      addToast("Milestone submitted for review", "success");
      loadMilestones();
    } catch (error) {
      addToast(
        error.response?.data?.error || "Failed to submit milestone",
        "error",
      );
    }
  };

  const reviewMilestone = async (milestoneId, status) => {
    try {
      await api.put(`/milestones/${milestoneId}/review`, { status });
      addToast(
        status === "completed" ? "Milestone approved" : "Revision requested",
        "success",
      );
      loadMilestones();
    } catch (error) {
      addToast(
        error.response?.data?.error || "Failed to review milestone",
        "error",
      );
    }
  };

  if (loading) return <SkeletonCard lines={4} />;

  return (
    <div className="space-y-4 animate-fade-in">
      {canManage && (
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Project milestones
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create deadlines for the student and review submitted work.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "Add milestone"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={createNewMilestone}
              className="mt-5 grid gap-3 border-t border-gray-100 pt-5 lg:grid-cols-2"
            >
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Milestone title"
                className="input-field"
              />
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deadline: event.target.value,
                  }))
                }
                className="input-field"
              />
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description or expected deliverable"
                rows={3}
                className="input-field resize-none lg:col-span-2"
              />
              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-fit disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create milestone"}
              </button>
            </form>
          )}
        </div>
      )}

      {milestones.length === 0 ? (
        <div className="card py-10 text-center text-sm text-gray-500">
          {canManage
            ? "No milestones yet. Add the first project milestone."
            : "No milestones have been added by your guide yet."}
        </div>
      ) : (
        milestones.map((milestone) => (
          <div key={milestone.id} className="card">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-800">
                    {milestone.title}
                  </h3>
                  <StatusBadge status={milestone.status || "pending"} />
                  {milestone.is_overdue && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      Overdue
                    </span>
                  )}
                </div>

                {milestone.description && (
                  <p className="mt-2 text-sm text-gray-500">
                    {milestone.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  {milestone.deadline
                    ? `Due ${formatDate(milestone.deadline)}`
                    : "No deadline"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isStudent &&
                  ["pending", "revision_needed", "late"].includes(
                    milestone.status,
                  ) && (
                    <button
                      type="button"
                      onClick={() => submitForReview(milestone.id)}
                      className="btn-primary text-xs"
                    >
                      Submit for review
                    </button>
                  )}

                {canManage && milestone.status === "submitted" && (
                  <>
                    <button
                      type="button"
                      onClick={() => reviewMilestone(milestone.id, "completed")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reviewMilestone(milestone.id, "revision_needed")
                      }
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                    >
                      Request changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DiscussionsTab({ projectId, threads, reload }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [openThreadId, setOpenThreadId] = useState(null);
  const [replies, setReplies] = useState([]);
  const [msg, setMsg] = useState("");
  const [posting, setPosting] = useState(false);

  const startThread = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setPosting(true);
    try {
      await api.post(`/projects/${projectId}/threads`, { title });
      setTitle("");
      addToast("Discussion started!", "success");
      reload();
    } catch {
      addToast("Failed to start discussion", "error");
    } finally {
      setPosting(false);
    }
  };

  const openReplies = async (tid) => {
    if (openThreadId === tid) {
      setOpenThreadId(null);
      return;
    }
    setOpenThreadId(tid);
    try {
      const res = await api.get(`/threads/${tid}/replies`);
      setReplies(res.data.replies ?? res.data ?? []);
    } catch {
      addToast("Failed to load replies", "error");
    }
  };

  const postReply = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setPosting(true);
    try {
      await api.post(`/threads/${openThreadId}/replies`, { message: msg });
      setMsg("");
      addToast("Reply posted!", "success");
      openReplies(openThreadId);
    } catch {
      addToast("Failed to post reply", "error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New thread */}
      <form onSubmit={startThread} className="card">
        <h3 className="font-semibold text-slate-800 mb-3">
          Start a new discussion
        </h3>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to discuss?"
            className="input-field flex-1"
          />
          <button disabled={posting || !title.trim()} className="btn-primary">
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="card text-center py-10 text-gray-500 text-sm">
          No discussions yet. Start one to talk with your guide!
        </div>
      ) : (
        threads.map((t) => (
          <div key={t.id} className="card">
            <button
              onClick={() => openReplies(t.id)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800">{t.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Started {formatDate(t.created_at)}
                    {t.created_by_name && <> by {t.created_by_name}</>}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {openThreadId === t.id ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {openThreadId === t.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {replies.length === 0 ? (
                  <p className="text-sm text-gray-400">No replies yet.</p>
                ) : (
                  replies.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-sm text-slate-700">{r.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {r.user_name || "User"}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <form onSubmit={postReply} className="flex gap-2 pt-2">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Write a reply…"
                    className="input-field flex-1"
                  />
                  <button
                    disabled={posting || !msg.trim()}
                    className="btn-primary text-xs"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function HistoryTab({ history }) {
  return (
    <div className="animate-fade-in">
      {history.length === 0 ? (
        <div className="card text-center py-10 text-gray-500 text-sm">
          No status changes recorded yet.
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">
              Audit Trail ({history.length} events)
            </h3>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-indigo-100" />
            <div className="divide-y divide-gray-50">
              {history.map((h, i) => (
                <div key={h.id || i} className="relative pl-12 pr-5 py-3.5">
                  <div className="absolute left-3.5 top-4 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm capitalize text-gray-500">
                      {String(h.old_status ?? "—").replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-400">→</span>
                    <StatusBadge status={h.new_status} />
                  </div>
                  {h.remarks && (
                    <p className="text-sm text-gray-600 mt-1">{h.remarks}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <span>{h.changed_by_name || "System"}</span>
                    <span>·</span>
                    <span>{formatDateTime(h.changed_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
