const {
  getTotals, getStatusBreakdown, getDelayedProjects, getAverageGrade, getProjectsByDepartment,
} = require('../models/analytics.model');

// the coordinator's KPI dashboard — all stats in one response
const getDashboard = async (req, res) => {
  try {
    const totals = await getTotals();
    const statusBreakdown = await getStatusBreakdown();
    const delayedProjects = await getDelayedProjects();
    const averageGrade = await getAverageGrade();
    const byDepartment = await getProjectsByDepartment();

    res.json({
      totals,
      statusBreakdown,
      delayedCount: delayedProjects.length,
      delayedProjects,
      averageGrade,
      byDepartment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboard };