import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import {
  AuthBrand,
  AuthCard,
  AuthField,
  LockIcon,
  MailIcon,
  UserIcon,
} from "../components/AuthCardUI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The server returned an invalid response.");
  }
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "", form: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = "Full name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters.";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to create your account.",
        );
      }
      navigate("/login", { replace: true });
    } catch (error) {
      setErrors({
        form:
          error.message === "Failed to fetch"
            ? "Cannot connect to the backend."
            : error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthBrand />
        <h2 className="text-center text-[25px] font-bold tracking-[-0.03em] text-[#111331]">
          Create student account
        </h2>
        <p className="mt-1 text-center text-[13px] text-slate-500">
          Start submitting reports and tracking project milestones
        </p>
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-center text-[11px] leading-5 text-indigo-700">
          Guide and Coordinator accounts are created by the institution.
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5">
          <AuthField error={errors.name} icon={<UserIcon />}>
            <input
              type="text"
              value={form.name}
              placeholder="Full name"
              autoComplete="name"
              onChange={(event) => updateField("name", event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
            />
          </AuthField>
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}

          <div className="mt-3">
            <AuthField error={errors.email} icon={<MailIcon />}>
              <input
                type="email"
                value={form.email}
                placeholder="Email address"
                autoComplete="email"
                onChange={(event) => updateField("email", event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
              />
            </AuthField>
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}

          <div className="mt-3">
            <AuthField error={errors.password} icon={<LockIcon />}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="Password"
                autoComplete="new-password"
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-xs font-medium text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </AuthField>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}

          <div className="mt-3">
            <AuthField error={errors.confirmPassword} icon={<LockIcon />}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                placeholder="Confirm password"
                autoComplete="new-password"
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
              />
            </AuthField>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}

          {errors.form && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs leading-5 text-red-600">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#3d4ac4] to-[#3443bd] py-3 text-[14px] font-semibold text-white shadow-[0_6px_14px_rgba(55,65,190,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create student account"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-[13px] text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#4051c7] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
