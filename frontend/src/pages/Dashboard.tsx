import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEnrollments } from "../api/endpoints";
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

  useEffect(() => {
    getEnrollments()
      .then((res) => setEnrollments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((s, e) => s + e.progress_percent, 0) /
            enrollments.length,
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Welcome card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-7 text-white shadow-lg shadow-brand/20">
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl font-bold">
              {user?.avatar_emoji && (
                <span className="mr-2">{user.avatar_emoji}</span>
              )}
              {user?.username ? `@${user.username}` : user?.name}
            </h1>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-white/60 text-xs">Courses</p>
            </div>
            {enrollments.length > 0 && (
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-white/60 text-xs">Avg progress</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your courses
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-14">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-light dark:bg-brand/20 text-brand mx-auto">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">
              No courses yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">
              Pick a course and start learning today.
            </p>
            <Link
              to="/courses"
              className="inline-block bg-brand text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors shadow-sm shadow-brand/20"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <Link
                key={e.id}
                to={`/courses/${e.course_slug}`}
                className="flex items-center gap-5 bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-brand/30 dark:hover:border-brand/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-lg flex-shrink-0">
                  {e.course_title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand transition-colors">
                    {e.course_title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${e.progress_percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-brand flex-shrink-0">
                      {Math.round(e.progress_percent)}%
                    </span>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            {
              to: "/profile",
              label: "Edit Profile",
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              ),
            },
            {
              to: "/courses",
              label: "All Courses",
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              ),
            },
          ] as const
        ).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand/30 hover:text-brand dark:hover:text-brand transition-all duration-200"
          >
            <span className="text-brand">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
