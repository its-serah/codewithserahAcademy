import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerification } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then(async () => {
        setStatus("success");
        if (user) await refreshUser();
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      await resendVerification();
      setResendMsg("Verification email sent. Check your inbox.");
    } catch (err: any) {
      setResendMsg(
        err.response?.data?.detail || "Failed to resend. Try again later.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-cream dark:bg-gray-900">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              status === "success"
                ? "bg-green-100 dark:bg-green-900/30"
                : status === "error"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-brand-light dark:bg-brand/20"
            }`}
          >
            {status === "loading" && (
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            )}
            {status === "success" && (
              <svg
                className="w-7 h-7 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="w-7 h-7 text-red-500 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">
          {status === "loading" && "Verifying your email…"}
          {status === "success" && "Email verified!"}
          {status === "error" && "Link expired"}
        </h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-7">
          {status === "loading" && "Just a moment, hold tight."}
          {status === "success" &&
            "Your account is fully activated. Welcome aboard!"}
          {status === "error" && "This link is invalid or has already expired."}
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 space-y-3">
          {status === "success" && (
            <Link
              to="/dashboard"
              className="block w-full text-center bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all"
            >
              Go to Dashboard
            </Link>
          )}

          {status === "error" && (
            <>
              {user ? (
                <>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-dark disabled:opacity-50 shadow-sm shadow-brand/20 transition-all"
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                  {resendMsg && (
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                      {resendMsg}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <Link
                    to="/login"
                    className="text-brand font-medium hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to request a new verification email.
                </p>
              )}
            </>
          )}

          {status !== "success" && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
              <Link to="/" className="hover:text-brand transition-colors">
                Back to home
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
