import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">Create Account</h1>

        {error && <p className="bg-red-100 text-red-600 text-sm rounded p-2 mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 text-sm rounded p-2 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={change} placeholder="Full name"
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <input name="email" type="email" value={form.email} onChange={change} placeholder="Email"
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <input name="password" type="password" value={form.password} onChange={change} placeholder="Password"
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <input name="department" value={form.department} onChange={change} placeholder="Department (e.g. ISE)"
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select name="role" value={form.role} onChange={change}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="student">Student</option>
            <option value="guide">Guide</option>
            <option value="coordinator">Coordinator</option>
          </select>
          <button type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
