const {
  getSummary,
  getStatusBreakdown,
  getGuideWorkload,
  getDepartmentCompletion,
  getGradeDistribution,
  getStudentsMissingDeadlines,
} = require("../models/analytics.model");

const number = (value) => Number(value ?? 0);

const getDashboard = async (req, res) => {
  try {
    const [
      summary,
      statusBreakdown,
      guideWorkload,
      departmentCompletion,
      gradeDistribution,
      studentsMissing,
    ] = await Promise.all([
      getSummary(),
      getStatusBreakdown(),
      getGuideWorkload(),
      getDepartmentCompletion(),
      getGradeDistribution(),
      getStudentsMissingDeadlines(),
    ]);

    res.json({
      dashboard: {
        summary: {
          total_projects: number(summary.total_projects),
          waiting_over_7_days: number(summary.waiting_over_7_days),
          delayed_projects: number(summary.delayed_projects),
          completed_projects: number(summary.completed_projects),
          completion_rate: number(summary.completion_rate),
          average_approval_hours: number(summary.average_approval_hours),
          average_grade: number(summary.average_grade),
        },
        status_breakdown: statusBreakdown.map((item) => ({
          status: item.status,
          count: number(item.count),
        })),
        guide_workload: guideWorkload.map((item) => ({
          ...item,
          project_count: number(item.project_count),
          awaiting_review: number(item.awaiting_review),
        })),
        department_completion: departmentCompletion.map((item) => ({
          ...item,
          total: number(item.total),
          completed: number(item.completed),
          completion_rate: number(item.completion_rate),
        })),
        grade_distribution: gradeDistribution.map((item) => ({
          grade_letter: item.grade_letter,
          count: number(item.count),
        })),
        students_missing: studentsMissing.map((item) => ({
          ...item,
          late_count: number(item.late_count),
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboard };
