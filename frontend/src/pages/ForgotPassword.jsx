import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import {
  AuthBrand,
  AuthCard,
  AuthField,
  MailIcon,
} from "../components/AuthCardUI";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("The server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send the reset link."
        );
      }

      setSuccess(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "Cannot connect to the backend. Start your backend server first."
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthBrand />

        <h1 className="text-center text-[25px] font-bold tracking-[-0.03em] text-[#111331]">
          Forgot password?
        </h1>

        <p className="mt-2 text-center text-[13px] leading-5 text-slate-500">
          Enter your email address and we&apos;ll send you a
          password reset link.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-7">
          <AuthField error={error} icon={<MailIcon />}>
            <input
              type="email"
              value={email}
              placeholder="Email address"
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setSuccess("");
              }}
              className="
                min-w-0 flex-1 bg-transparent text-[14px]
                text-slate-800 outline-none
                placeholder:text-slate-400
              "
            />
          </AuthField>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs leading-5 text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-xs leading-5 text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-5 w-full rounded-lg
              bg-gradient-to-r from-[#3d4ac4] to-[#3443bd]
              py-3 text-[14px] font-semibold text-white
              shadow-[0_6px_14px_rgba(55,65,190,0.28)]
              transition hover:brightness-105
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <Link
            to="/login"
            className="text-[13px] font-semibold text-[#4051c7] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}