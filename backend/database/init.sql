-- Users with roles
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'guide', 'coordinator')),
  department VARCHAR(80),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  guide_id INT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'approved',
    'in_progress', 'completed', 'rejected'
  )),
  status_changed_at TIMESTAMP DEFAULT NOW(),
  status_changed_by INT REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT TRAIL
CREATE TABLE project_status_history (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by INT REFERENCES users(id) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  remarks TEXT
);

-- Milestones (deadline engine)
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'submitted', 'completed', 'revision_needed', 'late'
  )),
  is_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions (current version pointer)
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id INT REFERENCES milestones(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('proposal', 'milestone', 'final_report')),
  current_version INT DEFAULT 1,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- VERSIONING: V1, V2, V3 all retained
CREATE TABLE submission_versions (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_path TEXT,
  notes TEXT,
  uploaded_by INT REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Feedback (guide approval/rejection)
CREATE TABLE feedbacks (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
  guide_id INT REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected', 'revision_needed')),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DISCUSSION THREADS
CREATE TABLE discussion_threads (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discussion_replies (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'proposal_approved', 'proposal_rejected', 'changes_requested',
    'milestone_completed', 'milestone_revision',
    'deadline_reminder', 'deadline_missed',
    'guide_assigned', 'project_graded', 'new_reply'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link_project_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Final grades
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  guide_id INT REFERENCES users(id),
  score INT CHECK (score BETWEEN 0 AND 100),
  grade_letter VARCHAR(2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);