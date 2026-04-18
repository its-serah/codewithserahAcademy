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
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
