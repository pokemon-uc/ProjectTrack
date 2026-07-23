import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AuthLayout from "../components/AuthLayout";

import {
  AuthBrand,
  AuthCard,
  AuthField,
  LockIcon,
  MailIcon,
} from "../components/AuthCardUI";

const DEMO_USERS = [
  {
    label: "Student",
    email: "priya@college.edu",
    password: "ProjectTrack@2026!",
    role: "student",
  },
  {
    label: "Guide",
    email: "ramesh@college.edu",
    password: "ProjectTrack@2026!",
    role: "guide",
  },
  {
    label: "Coordinator",
    email: "suresh@college.edu",
    password: "ProjectTrack@2026!",
    role: "coordinator",
  },
];

export default function Login() {
  const navigate = useNavigate();

  // This updates AuthContext after login
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email =
        "Email address is required.";
    }

    if (!password) {
      nextErrors.password =
        "Password is required.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      /*
        AuthContext.login:
        1. Calls /api/auth/login
        2. Stores the token
        3. Stores the user
        4. Updates the AuthContext user state
      */
      const user = await login(
        email.trim(),
        password
      );

      // Optional, but useful for other components
      localStorage.setItem(
        "role",
        user.role
      );

      navigate(`/${user.role}`, {
        replace: true,
      });
    } catch (error) {
      setErrors({
        form:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Incorrect email or password.",
      });
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(user) {
    setEmail(user.email);
    setPassword(user.password);
    setErrors({});
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthBrand />

        <h2 className="mb-7 text-center text-[27px] font-bold tracking-[-0.03em] text-[#111331]">
          Welcome back
        </h2>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <AuthField
            error={errors.email}
            icon={<MailIcon />}
          >
            <input
              type="email"
              value={email}
              placeholder="Email address"
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value);

                setErrors((current) => ({
                  ...current,
                  email: "",
                  form: "",
                }));
              }}
              className="
                min-w-0 flex-1
                bg-transparent
                text-[14px] text-slate-800
                outline-none
                placeholder:text-slate-400
              "
            />
          </AuthField>

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}

          {/* Password */}
          <div className="mt-4">
            <AuthField
              error={errors.password}
              icon={<LockIcon />}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                placeholder="Password"
                autoComplete="current-password"
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  setErrors((current) => ({
                    ...current,
                    password: "",
                    form: "",
                  }));
                }}
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-[14px] text-slate-800
                  outline-none
                  placeholder:text-slate-400
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                className="text-xs font-medium text-slate-400 hover:text-indigo-600"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </AuthField>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}

          {/* Forgot password */}
          <div className="mt-3 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-[13px] font-semibold text-[#4051c7] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Form error */}
          {errors.form && (
            <p
              role="alert"
              className="
                mt-4 rounded-lg
                bg-red-50 px-3 py-2
                text-center text-xs
                leading-5 text-red-600
              "
            >
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-5 w-full rounded-lg
              bg-gradient-to-r
              from-[#3d4ac4]
              to-[#3443bd]
              py-3 text-[15px]
              font-semibold text-white
              shadow-[0_6px_14px_rgba(55,65,190,0.28)]
              transition
              hover:brightness-105
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Signing in…"
              : "Sign In"}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {DEMO_USERS.map((user) => (
            <button
              key={user.role}
              type="button"
              onClick={() =>
                fillDemo(user)
              }
              className="
                rounded-full
                bg-slate-100
                px-3 py-1
                text-[11px]
                font-medium
                text-slate-600
                hover:bg-indigo-50
                hover:text-indigo-700
              "
            >
              Demo: {user.label}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-[13px] text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#4051c7] hover:underline"
          >
            Create account
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}