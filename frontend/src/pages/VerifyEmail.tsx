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
        err.response?.data?.detail || "Failed to resend verification email.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-cream dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-brand">
          Verify Email
        </h1>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border-t-4 border-brand space-y-5">
          {status === "loading" && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Verifying your email...
            </p>
          )}

          {status === "success" && (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                Email verified! You can now fully access your account.
              </div>
              <Link
                to="/dashboard"
                className="block w-full text-center bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                This link is invalid or has expired.
              </div>

              {user ? (
                <>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors font-medium"
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                  {resendMsg && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {resendMsg}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <Link to="/login" className="text-brand hover:underline">
                    Sign in
                  </Link>{" "}
                  to request a new verification email.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
