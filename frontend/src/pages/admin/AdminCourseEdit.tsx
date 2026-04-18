import { useState, useEffect, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
  adminGetCourse,
  adminUpdateCourse,
  adminCreateModule,
  adminDeleteModule,
} from "../../api/endpoints";

interface ModuleSummary {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
}

interface CourseData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  modules: ModuleSummary[];
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

const labelClass =
  "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function AdminCourseEdit() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    adminGetCourse(Number(id))
      .then((res) => {
        setCourse(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description || "");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminUpdateCourse(Number(id), { title, description });
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newModuleTitle) return;
    setAddingModule(true);
    try {
      await adminCreateModule({ course_id: Number(id), title: newModuleTitle });
      setNewModuleTitle("");
      load();
    } finally {
      setAddingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: number, modTitle: string) => {
    if (!confirm(`Delete module "${modTitle}"?`)) return;
    await adminDeleteModule(moduleId);
    load();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        to="/admin/courses"
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
        All courses
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
          Admin
        </span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {course.title}
        </h1>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            course.is_published
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}
        >
          {course.is_published ? "Published" : "Draft"}
        </span>
      </div>

      {/* Course info form */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
          Course Details
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saveMsg && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Modules */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Modules
          </h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {course.modules.length} total
          </span>
        </div>

        <form onSubmit={handleAddModule} className="flex gap-2 mb-5">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="New module title…"
            required
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={addingModule}
            className="flex-shrink-0 bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
          >
            {addingModule ? "Adding…" : "Add"}
          </button>
        </form>

        {course.modules.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            No modules yet. Add the first one above.
          </p>
        ) : (
          <div className="space-y-2">
            {course.modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <span className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand/20 text-brand flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {mod.order_index}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {mod.title}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    to={`/admin/courses/${id}/modules/${mod.id}`}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    Edit Content
                  </Link>
                  <button
                    onClick={() => handleDeleteModule(mod.id, mod.title)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
