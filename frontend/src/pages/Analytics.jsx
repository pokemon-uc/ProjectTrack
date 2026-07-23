import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  GraduationCap,
  TimerReset,
  UsersRound,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import SkeletonCard from "../components/SkeletonCard";
import { ErrorState } from "../components/EmptyState";
import api from "../api/axios";
import { formatStatus } from "../lib/formatters";

const STATUS_COLORS = {
  draft: "#94a3b8",
  submitted: "#6366f1",
  under_review: "#f59e0b",
  approved: "#14b8a6",
  in_progress: "#3b82f6",
  completed: "#10b981",
  rejected: "#ef4444",
};

const GRADE_COLORS = {
  A: "bg-emerald-500",
  B: "bg-indigo-500",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/analytics/dashboard");
      setData(response.data.dashboard ?? response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusChart = useMemo(() => {
    const rows = data?.status_breakdown ?? [];
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    if (!total) return "conic-gradient(#e2e8f0 0deg 360deg)";

    let current = 0;
    const segments = rows.map((row) => {
      const start = current;
      current += (row.count / total) * 360;
      return `${STATUS_COLORS[row.status] || "#8b5cf6"} ${start}deg ${current}deg`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [data]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard lines={8} />
          <SkeletonCard lines={8} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Analytics unavailable"} onRetry={load} />
      </DashboardLayout>
    );
  }

  const summary = data.summary ?? {};
  const statusRows = data.status_breakdown ?? [];
  const workload = data.guide_workload ?? [];
  const departments = data.department_completion ?? [];
  const missing = data.students_missing ?? [];
  const gradeRows = ["A", "B", "C", "D", "F"].map((letter) => ({
    letter,
    count:
      data.grade_distribution?.find((item) => item.grade_letter === letter)
        ?.count ?? 0,
  }));
  const maxWorkload = Math.max(
    ...workload.map((item) => item.project_count),
    1,
  );
  const maxGrades = Math.max(...gradeRows.map((item) => item.count), 1);

  const cards = [
    {
      label: "Avg Approval Time",
      value: `${summary.average_approval_hours ?? 0}h`,
      caption: "Submission to approval",
      icon: Clock3,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Waiting >7 Days",
      value: summary.waiting_over_7_days ?? 0,
      caption: "Needs coordinator attention",
      icon: TimerReset,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Delayed Projects",
      value: summary.delayed_projects ?? 0,
      caption: "Past milestone deadlines",
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Completion Rate",
      value: `${summary.completion_rate ?? 0}%`,
      caption: `${summary.completed_projects ?? 0} of ${summary.total_projects ?? 0} projects`,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Analytics
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Performance and progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live metrics calculated from projects, milestones, reviews, and
          grades.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, caption, icon: Icon, tone }) => (
          <div key={label} className="card">
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
            >
              <Icon size={19} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{label}</p>
            <p className="mt-1 text-[11px] text-slate-400">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Project status distribution
              </h2>
              <p className="text-xs text-slate-500">
                Current lifecycle position
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <div
              className="relative h-44 w-44 flex-none rounded-full"
              style={{ background: statusChart }}
            >
              <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-3xl font-bold text-slate-900">
                  {summary.total_projects ?? 0}
                </span>
                <span className="text-xs text-slate-400">projects</span>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              {statusRows.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_COLORS[row.status] || "#8b5cf6",
                    }}
                  />
                  <span className="flex-1 text-slate-500">
                    {formatStatus(row.status)}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UsersRound size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Guide workload</h2>
              <p className="text-xs text-slate-500">
                Assigned projects and review queue
              </p>
            </div>
          </div>

          {workload.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No guides found.
            </p>
          ) : (
            <div className="space-y-5">
              {workload.map((guide) => (
                <div key={guide.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {guide.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {guide.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">
                        {guide.project_count} projects
                      </p>
                      <p className="text-[11px] text-amber-600">
                        {guide.awaiting_review} awaiting review
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{
                        width: `${(guide.project_count / maxWorkload) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Department completion
              </h2>
              <p className="text-xs text-slate-500">
                Completed projects by student department
              </p>
            </div>
          </div>

          {departments.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No department data.
            </p>
          ) : (
            <div className="space-y-5">
              {departments.map((department) => (
                <div key={department.department}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {department.department}
                    </span>
                    <span className="text-slate-500">
                      {department.completed}/{department.total} ·{" "}
                      <strong className="text-slate-800">
                        {department.completion_rate}%
                      </strong>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${department.completion_rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Grade distribution
              </h2>
              <p className="text-xs text-slate-500">
                Average score: {summary.average_grade ?? 0}/100
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {gradeRows.map((grade) => (
              <div
                key={grade.letter}
                className="grid grid-cols-[28px_1fr_28px] items-center gap-3"
              >
                <span className="font-bold text-slate-700">{grade.letter}</span>
                <div className="h-7 overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className={`flex h-full items-center rounded-lg ${GRADE_COLORS[grade.letter]}`}
                    style={{ width: `${(grade.count / maxGrades) * 100}%` }}
                  />
                </div>
                <span className="text-right text-sm font-semibold text-slate-700">
                  {grade.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card !p-0 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Students missing deadlines
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Active milestones whose deadlines have passed
          </p>
        </div>

        {missing.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No missed deadlines
            </p>
            <p className="mt-1 text-xs text-slate-400">
              All active milestones are currently on schedule.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Late milestones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missing.map((student) => (
                  <tr key={`${student.project_id}-${student.student_email}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">
                        {student.student_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {student.student_email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {student.project_title}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {student.department}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        {student.late_count} late
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
