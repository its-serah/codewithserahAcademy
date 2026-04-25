import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getCourse, enroll, getModules } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

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
  const location = useLocation();
  const { showToast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getCourse(slug)
      .then((res) => setCourse(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    if (!user) {
      setEnrolled(false);
      return;
    }
    getModules(slug)
      .then((res) => {
        setModules(res.data);
        setEnrolled(true);
      })
      .catch(() => setEnrolled(false));
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!slug) return;
    setEnrolling(true);
    try {
      await enroll(slug);
      setEnrolled(true);
      showToast("Enrolled successfully!");
      const res = await getModules(slug);
      setModules(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 400 && status !== 409) {
        showToast("Failed to enroll. Please try again.", "error");
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!course)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 dark:text-gray-400">
        Course not found.
      </div>
    );

  const moduleList = modules || course.modules;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-6"
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
        All courses
      </Link>

      {/* Course header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-8 text-white shadow-lg shadow-brand/20 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-snug">{course.title}</h1>
          {course.description && (
            <p className="mt-2 text-white/75 leading-relaxed max-w-2xl">
              {course.description}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            {enrolled === null ? null : enrolled ? (
              <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Enrolled
              </span>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-white text-brand px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 disabled:opacity-60 transition-colors shadow-sm"
              >
                {enrolling ? "Enrolling…" : "Enroll now — it's free"}
              </button>
            )}
            <span className="text-white/60 text-sm">
              {moduleList.length}{" "}
              {moduleList.length === 1 ? "module" : "modules"}
            </span>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Course Modules
        </h2>

        {enrolled && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <svg
              className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-semibold">First-time access:</span> Please
              allow up to 24 hours for your modules to be unlocked after
              enrolling.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {moduleList.map((mod) => {
            const isUnlocked = mod.is_unlocked ?? false;
            const accessible = isUnlocked || !enrolled;
            return (
              <div
                key={mod.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  accessible
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    accessible
                      ? "bg-brand-light dark:bg-brand/20 text-brand"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {mod.order_index}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {mod.title}
                  </p>
                  {mod.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {mod.description}
                    </p>
                  )}
                </div>
                {enrolled &&
                  (isUnlocked ? (
                    <Link
                      to={`/courses/${slug}/modules/${mod.id}`}
                      className="flex-shrink-0 text-sm bg-brand text-white px-4 py-1.5 rounded-full hover:bg-brand-dark transition-colors font-medium"
                    >
                      Start
                    </Link>
                  ) : (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
