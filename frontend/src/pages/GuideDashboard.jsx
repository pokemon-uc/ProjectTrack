import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  Search,
  UserRound,
} from "lucide-react";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "review", label: "Awaiting Review" },
  { value: "changes", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
];

export default function GuideDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/projects/assigned");
      setProjects(response.data.projects ?? []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to load your assigned projects.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const stats = useMemo(() => {
    const awaiting = projects.filter((project) =>
      ["submitted", "under_review"].includes(project.status),
    ).length;
    const changes = projects.filter(
      (project) => project.latest_feedback_status === "revision_needed",
    ).length;
    const approved = projects.filter(
      (project) =>
        project.latest_feedback_status === "approved" ||
        ["approved", "in_progress", "completed"].includes(project.status),
    ).length;

    return { assigned: projects.length, awaiting, changes, approved };
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.student_name?.toLowerCase().includes(query) ||
        project.student_email?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "review" &&
          ["submitted", "under_review"].includes(project.status)) ||
        (filter === "changes" &&
          project.latest_feedback_status === "revision_needed") ||
        (filter === "approved" &&
          (project.latest_feedback_status === "approved" ||
            ["approved", "in_progress", "completed"].includes(project.status)));

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const firstName = user?.name?.trim()?.split(" ")[0] || "Guide";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4051c7]">
            Guide Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111331] sm:text-4xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review assigned projects, submissions, and student progress.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="Assigned Projects"
            value={stats.assigned}
          />
          <StatCard
            icon={ClipboardCheck}
            label="Awaiting Review"
            value={stats.awaiting}
            accent="amber"
          />
          <StatCard
            icon={UserRound}
            label="Changes Requested"
            value={stats.changes}
            accent="rose"
          />
          <StatCard
            icon={CheckCircle2}
            label="Approved"
            value={stats.approved}
            accent="emerald"
          />
        </section>

        <section className="mt-5 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(29,35,76,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111331]">
                Assigned Projects
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Open a submitted project to review its latest version.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search project or student"
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#4051c7] focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === item.value
                    ? "bg-[#4051c7] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadProjects}
                className="mt-4 rounded-xl bg-[#4051c7] px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <FolderKanban size={36} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-[#111331]">
                {projects.length
                  ? "No projects match this filter"
                  : "No projects assigned yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {projects.length
                  ? "Try another search or status filter."
                  : "Projects will appear when a coordinator assigns them to you."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#fafbff] lg:flex-row lg:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-[#111331]">
                        {project.title}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.student_name || "Student"}
                      {project.student_email && ` · ${project.student_email}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm lg:w-[310px]">
                    <div>
                      <p className="text-xs text-slate-400">
                        Latest submission
                      </p>
                      <p className="mt-1 font-semibold capitalize text-slate-700">
                        {project.latest_submission_type
                          ? `${project.latest_submission_type.replaceAll(
                              "_",
                              " ",
                            )} · V${project.current_version}`
                          : "No submission"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Submitted</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {formatDate(project.latest_submitted_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!project.latest_submission_type}
                    onClick={() =>
                      navigate(`/projects/${project.id}#submissions`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4051c7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3443bd] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Review
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent = "indigo" }) {
  const styles = {
    indigo: "bg-indigo-50 text-[#4051c7]",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(29,35,76,0.06)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <p className="mt-4 text-3xl font-bold text-[#111331]">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
