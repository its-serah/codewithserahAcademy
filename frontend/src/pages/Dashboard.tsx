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
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-600">Your enrolled courses</p>

      {enrollments.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-block text-indigo-600 hover:underline"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              to={`/courses/${e.course_slug}`}
              className="block bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{e.course_title}</h2>
                <span className="text-sm text-gray-500">
                  {Math.round(e.progress_percent)}%
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
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
