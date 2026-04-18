import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  adminGetCourses,
  adminCreateCourse,
  adminDeleteCourse,
  adminUpdateCourse,
} from "../../api/endpoints";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  module_count: number;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminGetCourses()
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminCreateCourse({ title, description: desc || undefined });
      setTitle("");
      setDesc("");
      setShowForm(false);
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, courseTitle: string) => {
    if (!confirm(`Delete "${courseTitle}"? This cannot be undone.`)) return;
    await adminDeleteCourse(id);
    load();
  };

  const togglePublish = async (course: Course) => {
    await adminUpdateCourse(course.id, { is_published: !course.is_published });
    load();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to="/admin"
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
        Admin
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
            Admin
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Courses
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {courses.length} total
          </span>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-all shadow-sm shadow-brand/20"
        >
          {showForm ? (
            <>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Course
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 space-y-3"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
            Create new course
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduction to Python"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What will students learn?"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
          >
            {creating ? "Creating…" : "Create Course"}
          </button>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 py-14">
          <span className="text-4xl">📚</span>
          <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
            No courses yet. Create the first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-base flex-shrink-0">
                {course.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/admin/courses/${course.id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-brand transition-colors truncate block"
                >
                  {course.title}
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {course.module_count}{" "}
                  {course.module_count === 1 ? "module" : "modules"} · /
                  {course.slug}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish(course)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    course.is_published
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </button>
                <Link
                  to={`/admin/courses/${course.id}`}
                  className="text-xs text-brand hover:underline font-medium px-1"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors px-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
