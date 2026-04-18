import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourse, enroll, getModules } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

interface Module {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  is_unlocked?: boolean;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  modules: Module[];
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getCourse(slug)
      .then((res) => setCourse(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug || !user) return;
    getModules(slug)
      .then((res) => {
        setModules(res.data);
        setEnrolled(true);
      })
      .catch(() => setEnrolled(false));
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!slug) return;
    setEnrolling(true);
    try {
      await enroll(slug);
      setEnrolled(true);
      const res = await getModules(slug);
      setModules(res.data);
    } catch {
      /* already enrolled */
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Course not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/courses"
        className="text-sm text-brand hover:underline inline-flex items-center gap-1"
      >
        ← All courses
      </Link>

      <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 border-t-4 border-t-brand">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {course.title}
        </h1>
        {course.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {course.description}
          </p>
        )}

        {!enrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="mt-6 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors font-medium"
          >
            {enrolling ? "Enrolling..." : "Enroll in Course"}
          </button>
        )}
        {enrolled && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Enrolled
          </span>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Modules
        </h2>
        <div className="space-y-3">
          {(modules || course.modules).map((mod) => {
            const isUnlocked = mod.is_unlocked ?? false;
            const accessible = isUnlocked || !enrolled;
            return (
              <div
                key={mod.id}
                className={`p-4 rounded-xl border transition-colors ${
                  accessible
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        accessible
                          ? "bg-brand-light text-brand dark:bg-brand/20"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {mod.order_index}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {enrolled &&
                    (isUnlocked ? (
                      <Link
                        to={`/courses/${slug}/modules/${mod.id}`}
                        className="text-sm bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-dark transition-colors flex-shrink-0"
                      >
                        Start
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500 flex-shrink-0 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Locked
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
