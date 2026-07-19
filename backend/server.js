const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);   
// simple test route
app.get('/', (req, res) => {
  res.send('ProjectTrack API is running 🚀');
});
const submissionRoutes = require('./routes/submission.routes');
app.use('/api', submissionRoutes);
const projectRoutes = require('./routes/project.routes');

app.use('/api/projects', projectRoutes);
const milestoneRoutes = require('./routes/milestone.routes');
app.use('/api', milestoneRoutes);
// lets teachers open/download uploaded files in the browser
app.use('/uploads', express.static('uploads'));
const notificationRoutes = require('./routes/notification.routes');
app.use('/api', notificationRoutes);
const analyticsRoutes = require('./routes/analytics.routes');
app.use('/api', analyticsRoutes);
// test the database connection
const feedbackRoutes = require('./routes/feedback.routes');
app.use('/api', feedbackRoutes);

const gradeRoutes = require('./routes/grade.routes');
app.use('/api', gradeRoutes);
const discussionRoutes = require('./routes/discussion.routes');
app.use('/api', discussionRoutes);
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));