import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEnrollments, resendVerification } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

interface Enrollment {
  id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
  enrolled_at: string;
  progress_percent: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setResendMsg("Verification email sent. Check your inbox.");
    } catch {
      setResendMsg("Failed to send. Please try again later.");
    } finally {
      setResending(false);
      setTimeout(() => setResendMsg(""), 4000);
    }
  };

  useEffect(() => {
    getEnrollments()
      .then((res) => setEnrollments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {user && !user.is_verified && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.98-1.742 2.98H3.48c-1.53 0-2.493-1.646-1.743-2.98L8.257 3.1zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Please verify your email address. Check your inbox or
            <button
              onClick={handleResend}
              disabled={resending}
              className="underline font-medium hover:text-amber-900 dark:hover:text-amber-300 disabled:opacity-60"
            >
              {resending ? "sending..." : "Resend verification email"}
            </button>
          </div>
          {resendMsg && <span className="text-xs">{resendMsg}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome,{" "}
          <span className="text-brand">
            {user?.username ? `@${user.username}` : user?.name}
          </span>
        </h1>
        <Link
          to="/profile"
          className="text-sm text-brand hover:underline flex items-center gap-1"
        >
          Edit profile →
        </Link>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Your enrolled courses
      </p>

      {enrollments.length === 0 ? (
        <div className="mt-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-block bg-brand text-white px-6 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              to={`/courses/${e.course_slug}`}
              className="block bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {e.course_title}
                </h2>
                <span className="text-sm font-medium text-brand">
                  {Math.round(e.progress_percent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full transition-all"
                  style={{ width: `${e.progress_percent}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
