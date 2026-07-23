import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { DEPARTMENTS } from '../lib/constants';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Profile state
  const [editField, setEditField] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const hasChanges = name !== user?.name || email !== user?.email || department !== (user?.department || '');

  // Password state
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ name, email, department: department || null });
      setEditField(null);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error ?? 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.newPw.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (passwords.newPw !== passwords.confirm) { setPasswordError('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPw,
      });
      setPasswords({ current: '', newPw: '', confirm: '' });
      addToast('Password updated successfully', 'success');
    } catch (err) {
      setPasswordError(err.response?.data?.error ?? 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/me');
      logout();
      setShowDelete(false);
      navigate('/login', { state: { message: 'Your account and all data have been permanently deleted.' } });
    } catch {
      addToast('Failed to delete account. Please try again.', 'error');
      setDeleting(false);
    }
  };

  const passwordStrength = () => {
    const p = passwords.newPw;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
    if (p.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4', textColor: 'text-amber-500' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full', textColor: 'text-emerald-500' };
    return { label: 'Medium', color: 'bg-amber-500', width: 'w-3/4', textColor: 'text-amber-500' };
  };
  const strength = passwordStrength();

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>

        {/* Profile */}
        <section className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Profile Information</h3>
              <p className="text-sm text-gray-500">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Name</p>
                {editField === 'name' ? (
                  <input value={name} onChange={e => setName(e.target.value)} className="input-field" autoFocus />
                ) : (
                  <p className="text-slate-700 font-medium">{name || '—'}</p>
                )}
              </div>
              <button onClick={() => setEditField(editField === 'name' ? null : 'name')} className="text-indigo-600 text-sm hover:underline ml-4">
                {editField === 'name' ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Email</p>
                {editField === 'email' ? (
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" autoFocus />
                ) : (
                  <p className="text-slate-700 font-medium">{email || '—'}</p>
                )}
              </div>
              <button onClick={() => setEditField(editField === 'email' ? null : 'email')} className="text-indigo-600 text-sm hover:underline ml-4">
                {editField === 'email' ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Role (read-only) */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Role</p>
              <p className="text-slate-500 capitalize bg-gray-50 inline-block px-3 py-1 rounded-lg text-sm">
                {user?.role}
                <span className="text-gray-400 text-xs ml-2">(cannot be changed)</span>
              </p>
            </div>

            {/* Department */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Department</p>
                {editField === 'department' ? (
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="input-field" autoFocus>
                    <option value="">None</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <p className="text-slate-700 font-medium">{department || '—'}</p>
                )}
              </div>
              <button onClick={() => setEditField(editField === 'department' ? null : 'department')} className="text-indigo-600 text-sm hover:underline ml-4">
                {editField === 'department' ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          {hasChanges && (
            <button onClick={saveProfile} disabled={savingProfile} className="btn-primary mt-6">
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </section>

        {/* Change Password */}
        <section className="card">
          <h3 className="font-semibold text-slate-800 mb-1">Change Password</h3>
          <p className="text-sm text-gray-500 mb-6">Update your login password</p>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{passwordError}</div>
          )}

          <form onSubmit={changePassword} className="space-y-3">
            <input
              type="password" required placeholder="Current password"
              value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
              className="input-field"
            />
            <div>
              <input
                type="password" required placeholder="New password"
                value={passwords.newPw} onChange={e => setPasswords({ ...passwords, newPw: e.target.value })}
                className="input-field"
              />
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                  </div>
                  <p className={`text-xs mt-0.5 ${strength.textColor}`}>Strength: {strength.label}</p>
                </div>
              )}
            </div>
            <input
              type="password" required placeholder="Confirm new password"
              value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              className="input-field"
            />
            <button disabled={savingPassword} className="btn-primary">
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="card border-red-200 bg-red-50/30">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-700">Delete Account</h3>
              <p className="text-sm text-red-600/70 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <p className="font-medium mb-1">This will permanently delete:</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-500">
              <li>All your projects and submissions</li>
              <li>All uploaded files and versions</li>
              <li>All discussion threads and replies</li>
              <li>All notifications</li>
              <li>Your profile and account</li>
            </ul>
          </div>
          <button onClick={() => setShowDelete(true)} className="btn-danger">
            Delete My Account
          </button>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-4 border-t border-gray-100">
          <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
          <span className="hover:text-gray-600 cursor-pointer">Contact</span>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        title="Are you absolutely sure?"
        message="This will permanently delete your account and all associated data including your projects, submissions, files, discussions, and notifications. This action CANNOT be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete Everything'}
        variant="danger"
        requireTyping="DELETE"
        onConfirm={deleteAccount}
        onCancel={() => setShowDelete(false)}
      />
    </DashboardLayout>
  );
}
