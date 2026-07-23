// ─── Design Tokens (from Knowledge Base Ch1) ───

export const COLORS = {
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  neutral: '#6B7280',
};

export const STATUS_STYLES = {
  draft:           'bg-gray-100 text-gray-700',
  submitted:       'bg-blue-100 text-blue-700',
  under_review:    'bg-amber-100 text-amber-700',
  approved:        'bg-green-100 text-green-700',
  in_progress:     'bg-indigo-100 text-indigo-700',
  completed:       'bg-teal-100 text-teal-700',
  rejected:        'bg-red-100 text-red-700',
  revision_needed: 'bg-orange-100 text-orange-700',
  pending:         'bg-gray-100 text-gray-600',
  late:            'bg-red-100 text-red-700',
};

export const STATUS_ICONS = {
  draft: '📝', submitted: '📤', under_review: '🔍',
  approved: '✅', in_progress: '🚀', completed: '🏆',
  rejected: '❌', revision_needed: '🔄',
};

export const ROLES = ['student', 'guide', 'coordinator'];

export const DEPARTMENTS = [
  'Computer Science',
  'Information Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

export const PROJECT_STATUSES = [
  'draft', 'submitted', 'under_review', 'approved',
  'in_progress', 'completed', 'rejected',
];

export const NOTIFICATION_TYPES = {
  proposal_approved:  { icon: '✅', color: 'text-green-600' },
  proposal_rejected:  { icon: '❌', color: 'text-red-600' },
  changes_requested:  { icon: '🔄', color: 'text-orange-600' },
  milestone_completed:{ icon: '✅', color: 'text-green-600' },
  milestone_revision: { icon: '🔄', color: 'text-amber-600' },
  deadline_reminder:  { icon: '⏰', color: 'text-amber-600' },
  deadline_missed:    { icon: '🔴', color: 'text-red-600' },
  guide_assigned:     { icon: '👤', color: 'text-blue-600' },
  project_graded:     { icon: '🎯', color: 'text-green-600' },
  new_reply:          { icon: '💬', color: 'text-indigo-600' },
};
