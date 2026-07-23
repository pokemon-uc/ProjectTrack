import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  Loader2,
  Search,
  UserRoundCheck,
  X,
} from "lucide-react";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import SkeletonCard from "../components/SkeletonCard";
import { ErrorState } from "../components/EmptyState";
import { formatStatus } from "../lib/formatters";
import { useToast } from "../context/ToastContext";

const REVIEW_STATUSES = new Set(["submitted", "under_review"]);

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [assigningProjectId, setAssigningProjectId] = useState(null);
  const [gradingProject, setGradingProject] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: "", remarks: "" });
  const [savingGrade, setSavingGrade] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectResponse, guideResponse] = await Promise.all([
        api.get("/projects/all"),
        api.get("/projects/guides"),
      ]);
      setProjects(projectResponse.data.projects ?? []);
      setGuides(guideResponse.data.guides ?? []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Failed to load coordinator dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: projects.length,
      unassigned: projects.filter((project) => !project.guide_id).length,
      awaiting: projects.filter((project) =>
        REVIEW_STATUSES.has(project.status),
      ).length,
      graded: projects.filter((project) => project.score !== null).length,
    }),
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.student_name?.toLowerCase().includes(query) ||
        project.student_email?.toLowerCase().includes(query) ||
        project.guide_name?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && project.guide_id) ||
        (assignmentFilter === "unassigned" && !project.guide_id);
      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [projects, search, statusFilter, assignmentFilter]);

  const assignGuide = async (projectId, guideId) => {
    if (!guideId) return;
    setAssigningProjectId(projectId);
    try {
      await api.put(`/projects/${projectId}/assign-guide`, {
        guide_id: Number(guideId),
      });
      addToast("Guide assigned", "success");
      await load();
    } catch (requestError) {
      addToast(
        requestError.response?.data?.error || "Failed to assign guide",
        "error",
      );
    } finally {
      setAssigningProjectId(null);
    }
  };

  const openGrade = (project) => {
    setGradingProject(project);
    setGradeForm({
      score: project.score ?? "",
      remarks: project.grade_remarks ?? "",
    });
  };

  const saveGrade = async (event) => {
    event.preventDefault();
    const score = Number(gradeForm.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      addToast("Score must be between 0 and 100", "error");
      return;
    }

    setSavingGrade(true);
    try {
      await api.post(`/projects/${gradingProject.id}/grade`, {
        score,
        remarks: gradeForm.remarks.trim(),
      });
      addToast("Final grade saved", "success");
      setGradingProject(null);
      await load();
    } catch (requestError) {
      addToast(
        requestError.response?.data?.error || "Failed to save grade",
        "error",
      );
    } finally {
      setSavingGrade(false);
    }
  };

  const cards = [
    {
      label: "Total Projects",
      value: stats.total,
      icon: BriefcaseBusiness,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Unassigned",
      value: stats.unassigned,
      icon: UserRoundCheck,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Awaiting Review",
      value: stats.awaiting,
      icon: ClipboardCheck,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Graded",
      value: stats.graded,
      icon: GraduationCap,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Coordinator Dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Project oversight
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Assign guides, monitor reviews, and record final grades.
        </p>
      </div>

      {loading ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
          <SkeletonCard lines={7} />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="card">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon size={19} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-semibold text-slate-900">All projects</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {visibleProjects.length} of {projects.length} projects
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search project or student"
                      className="input-field min-w-64 pl-9"
                    />
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="input-field"
                  >
                    <option value="all">All statuses</option>
                    {[
                      "draft",
                      "submitted",
                      "under_review",
                      "approved",
                      "in_progress",
                      "completed",
                      "rejected",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={assignmentFilter}
                    onChange={(event) =>
                      setAssignmentFilter(event.target.value)
                    }
                    className="input-field"
                  >
                    <option value="all">All assignments</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>
            </div>

            {visibleProjects.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No projects match these filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Project</th>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Guide assignment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Latest submission</th>
                      <th className="px-5 py-3">Final grade</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {project.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            #{project.id}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">
                            {project.student_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {project.student_email}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={project.guide_id ?? ""}
                              onChange={(event) =>
                                assignGuide(project.id, event.target.value)
                              }
                              disabled={assigningProjectId === project.id}
                              className="input-field min-w-48"
                            >
                              <option value="">Select guide</option>
                              {guides.map((guide) => (
                                <option key={guide.id} value={guide.id}>
                                  {guide.name} · {guide.email}
                                </option>
                              ))}
                            </select>
                            {assigningProjectId === project.id && (
                              <Loader2
                                size={16}
                                className="animate-spin text-indigo-600"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {project.latest_submission_type ? (
                            <>
                              <p className="font-medium capitalize">
                                {project.latest_submission_type.replace(
                                  /_/g,
                                  " ",
                                )}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Version {project.current_version}
                              </p>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {project.score !== null ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                              <span className="font-semibold text-slate-800">
                                {project.score}/100 · {project.grade_letter}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not graded</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/projects/${project.id}`)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              View <ExternalLink size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openGrade(project)}
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              {project.score !== null ? "Edit grade" : "Grade"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {gradingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <form
            onSubmit={saveGrade}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Final grade
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {gradingProject.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Student: {gradingProject.student_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingProject(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Score out of 100
              <input
                type="number"
                min="0"
                max="100"
                value={gradeForm.score}
                onChange={(event) =>
                  setGradeForm((current) => ({
                    ...current,
                    score: event.target.value,
                  }))
                }
                className="input-field mt-2 w-full"
                required
              />
            </label>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Remarks
              <textarea
                rows={4}
                value={gradeForm.remarks}
                onChange={(event) =>
                  setGradeForm((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
                placeholder="Final evaluation remarks"
                className="input-field mt-2 w-full resize-none"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setGradingProject(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingGrade}
                className="btn-primary disabled:opacity-60"
              >
                {savingGrade ? "Saving…" : "Save final grade"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
