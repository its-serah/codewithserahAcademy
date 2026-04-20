import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminGetAnalytics } from "../../api/endpoints";

interface CourseStat {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  enrolled: number;
  completions: number;
  completion_rate: number;
  avg_feedback: number | null;
  feedback_count: number;
}

interface Analytics {
  totals: {
    students: number;
    enrollments: number;
    completions: number;
    courses: number;
  };
  courses: CourseStat[];
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <span className="w-11 h-11 rounded-xl bg-brand-light dark:bg-brand/20 text-brand flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGetAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !data)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Admin
      </Link>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
          Admin
        </span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={data.totals.students}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Enrollments"
          value={data.totals.enrollments}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
        <StatCard
          label="Completions"
          value={data.totals.completions}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          }
        />
        <StatCard
          label="Courses"
          value={data.totals.courses}
          icon={
            <svg
              className="w-5 h-5"
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
          }
        />
      </div>

      {/* Per-course breakdown */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Course Breakdown
          </h2>
        </div>

        {data.courses.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">
            No courses yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.courses.map((course) => (
              <div key={course.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-brand transition-colors truncate"
                      >
                        {course.title}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          course.is_published
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          {course.enrolled}
                        </strong>{" "}
                        enrolled
                      </span>
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          {course.completions}
                        </strong>{" "}
                        completed
                      </span>
                      {course.avg_feedback !== null && (
                        <Stars rating={course.avg_feedback} />
                      )}
                      {course.avg_feedback === null && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          No feedback yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion bar */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-28 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${course.completion_rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-brand w-9 text-right">
                      {course.completion_rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
