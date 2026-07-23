import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  FileClock,
  Flag,
  FolderKanban,
  LoaderCircle,
  MessageSquareText,
  Plus,
} from "lucide-react";

import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EMPTY_COMPLETION = {
  total: 0,
  completed: 0,
  completion: "0%",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] =
    useState(null);

  const [completion, setCompletion] =
    useState(EMPTY_COMPLETION);

  const [submissions, setSubmissions] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    latestFeedback,
    setLatestFeedback,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const loadDashboard =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [
          projectsResponse,
          notificationsResponse,
        ] = await Promise.all([
          api.get("/projects/mine"),
          api.get("/notifications"),
        ]);

        const projects =
          projectsResponse.data.projects ??
          [];

        const activeProject =
          projects.find(
            (item) =>
              ![
                "completed",
                "rejected",
              ].includes(item.status)
          ) ??
          projects[0] ??
          null;

        setProject(activeProject);

        setUnreadCount(
          Number(
            notificationsResponse.data
              .unread ?? 0
          )
        );

        if (!activeProject) {
          setCompletion(
            EMPTY_COMPLETION
          );

          setSubmissions([]);
          setLatestFeedback(null);

          return;
        }

        const [
          completionResponse,
          submissionsResponse,
        ] = await Promise.all([
          api.get(
            `/projects/${activeProject.id}/completion`
          ),

          api.get(
            `/projects/${activeProject.id}/submissions`
          ),
        ]);

        const loadedSubmissions =
          submissionsResponse.data
            .submissions ?? [];

        setCompletion(
          completionResponse.data ??
            EMPTY_COMPLETION
        );

        setSubmissions(
          loadedSubmissions
        );

        if (
          loadedSubmissions.length === 0
        ) {
          setLatestFeedback(null);
          return;
        }

        const feedbackResults =
          await Promise.allSettled(
            loadedSubmissions.map(
              (submission) =>
                api.get(
                  `/submissions/${submission.id}/feedback`
                )
            )
          );

        const feedback =
          feedbackResults
            .filter(
              (result) =>
                result.status ===
                "fulfilled"
            )
            .flatMap(
              (result) =>
                result.value.data
                  .feedback ?? []
            )
            .sort(
              (first, second) =>
                new Date(
                  second.created_at
                ) -
                new Date(
                  first.created_at
                )
            );

        setLatestFeedback(
          feedback[0] ?? null
        );
      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.error ||
            requestError.response?.data
              ?.message ||
            "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const latestSubmission =
    useMemo(() => {
      return (
        [...submissions].sort(
          (first, second) =>
            new Date(
              second.submitted_at
            ) -
            new Date(
              first.submitted_at
            )
        )[0] ?? null
      );
    }, [submissions]);

  const progress = useMemo(() => {
    if (
      typeof completion.completion ===
      "string"
    ) {
      return (
        Number(
          completion.completion.replace(
            "%",
            ""
          )
        ) || 0
      );
    }

    const total = Number(
      completion.total || 0
    );

    if (!total) return 0;

    return Math.round(
      (Number(
        completion.completed || 0
      ) /
        total) *
        100
    );
  }, [completion]);

  async function createProject(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      addToast(
        "Enter a project title.",
        "error"
      );

      return;
    }

    setCreating(true);

    try {
      await api.post("/projects", {
        title: form.title.trim(),
        description:
          form.description.trim(),
      });

      setForm({
        title: "",
        description: "",
      });

      setShowForm(false);

      addToast(
        "Project created successfully!",
        "success"
      );

      await loadDashboard();
    } catch (requestError) {
      addToast(
        requestError.response?.data
          ?.error ||
          "Unable to create the project.",
        "error"
      );
    } finally {
      setCreating(false);
    }
  }

  const firstName =
    user?.name
      ?.trim()
      ?.split(" ")[0] ||
    "Student";

  const projectPath = project
    ? `/projects/${project.id}`
    : null;

  return (
    <DashboardLayout
      projectId={project?.id}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4051c7]">
              Student Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#111331] sm:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your project,
              submissions, and guide
              feedback in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(
                (current) => !current
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4051c7] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#3443bd]"
          >
            <Plus size={17} />

            {showForm
              ? "Cancel"
              : "Create Project"}
          </button>
        </header>

        {showForm && (
          <form
            onSubmit={createProject}
            className="mb-5 rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(29,35,76,0.06)]"
          >
            <h2 className="font-bold text-[#111331]">
              Create a new project
            </h2>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.5fr_auto]">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      title:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Project title"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#4051c7] focus:ring-4 focus:ring-indigo-100"
              />

              <input
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      description:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Short project description"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#4051c7] focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={creating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111331] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {creating && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {creating
                  ? "Creating"
                  : "Create"}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <DashboardSkeleton />
        )}

        {!loading && error && (
          <div className="rounded-[18px] border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <MetricCard
                icon={FolderKanban}
                label="Current Project"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-[#111331]">
                      {project?.title ||
                        "No project created"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {project
                        ? "Continue managing your academic project."
                        : "Create your first project to get started."}
                    </p>
                  </div>

                  {project && (
                    <StatusBadge
                      status={
                        project.status
                      }
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    projectPath
                      ? navigate(
                          projectPath
                        )
                      : setShowForm(true)
                  }
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4051c7]"
                >
                  {project
                    ? "View project"
                    : "Create project"}

                  <ArrowRight
                    size={16}
                  />
                </button>
              </MetricCard>

              <MetricCard
                icon={Flag}
                label="Milestones"
              >
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-[#111331]">
                    {Number(
                      completion.completed ||
                        0
                    )}
                    /
                    {Number(
                      completion.total ||
                        0
                    )}
                  </p>

                  <span className="text-sm font-bold text-[#4051c7]">
                    {progress}%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4051c7] to-[#7282ed]"
                    style={{
                      width: `${Math.min(
                        progress,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </MetricCard>

              <MetricCard
                icon={FileClock}
                label="Latest Version"
              >
                <p className="text-3xl font-bold text-[#111331]">
                  {latestSubmission
                    ? `V${latestSubmission.current_version}`
                    : "No uploads"}
                </p>

                <p className="mt-2 text-sm capitalize text-slate-500">
                  {latestSubmission
                    ? String(
                        latestSubmission.type
                      ).replaceAll(
                        "_",
                        " "
                      )
                    : "Your latest report will appear here."}
                </p>
              </MetricCard>

              <MetricCard
                icon={Bell}
                label="Unread Notifications"
              >
                <p className="text-3xl font-bold text-[#111331]">
                  {unreadCount}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/notifications"
                    )
                  }
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#4051c7]"
                >
                  View notifications

                  <ArrowRight
                    size={16}
                  />
                </button>
              </MetricCard>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">
              <article className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(29,35,76,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4051c7]">
                    <MessageSquareText
                      size={20}
                    />
                  </div>

                  <h2 className="text-lg font-bold text-[#111331]">
                    Latest Guide Feedback
                  </h2>
                </div>

                {latestFeedback ? (
                  <div className="mt-5 rounded-2xl bg-[#f7f8fd] p-5">
                    <p className="leading-7 text-slate-700">
                      “
                      {latestFeedback.comments ||
                        "Your guide reviewed this submission."}
                      ”
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-sm">
                      <span className="font-semibold text-[#111331]">
                        {latestFeedback.guide_name ||
                          "Project guide"}
                      </span>

                      <span className="text-slate-400">
                        {formatDate(
                          latestFeedback.created_at
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-[#fafbff] px-5 py-8 text-center">
                    <p className="font-semibold text-[#111331]">
                      No feedback yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Guide feedback
                      will appear after
                      a submission is
                      reviewed.
                    </p>
                  </div>
                )}
              </article>

              <article className="rounded-[18px] bg-gradient-to-br from-[#4051c7] to-[#252d86] p-6 text-white shadow-[0_14px_38px_rgba(64,81,199,0.22)]">
                <h2 className="text-lg font-bold">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-indigo-100">
                  Open the key areas of
                  your project.
                </p>

                <div className="mt-5 space-y-2">
                  <QuickAction
                    label="Submit report"
                    disabled={
                      !projectPath
                    }
                    onClick={() =>
                      navigate(
                        `${projectPath}#submissions`
                      )
                    }
                  />

                  <QuickAction
                    label="View milestones"
                    disabled={
                      !projectPath
                    }
                    onClick={() =>
                      navigate(
                        `${projectPath}#milestones`
                      )
                    }
                  />

                  <QuickAction
                    label="Open discussion"
                    disabled={
                      !projectPath
                    }
                    onClick={() =>
                      navigate(
                        `${projectPath}#discussion`
                      )
                    }
                  />
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  children,
}) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(29,35,76,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(29,35,76,0.09)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4051c7]">
          <Icon
            size={20}
            strokeWidth={1.8}
          />
        </div>

        <p className="text-sm font-semibold text-slate-500">
          {label}
        </p>
      </div>

      {children}
    </article>
  );
}

function QuickAction({
  label,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}

      <ArrowRight size={16} />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-[18px] border border-slate-200 bg-white"
          />
        )
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}