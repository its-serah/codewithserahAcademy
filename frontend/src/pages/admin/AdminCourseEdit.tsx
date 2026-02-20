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

export default function AdminCourseEdit() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newModuleTitle, setNewModuleTitle] = useState("");
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
    await adminUpdateCourse(Number(id), { title, description });
    load();
  };

  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newModuleTitle) return;
    await adminCreateModule({ course_id: Number(id), title: newModuleTitle });
    setNewModuleTitle("");
    load();
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Delete this module?")) return;
    await adminDeleteModule(moduleId);
    load();
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!course)
    return (
      <div className="p-8 text-center text-gray-500">Course not found.</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/admin/courses"
        className="text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to courses
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Edit: {course.title}</h1>

      <form
        onSubmit={handleSave}
        className="bg-white p-4 rounded-xl border border-gray-200 mb-8 space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Modules</h2>

      <form onSubmit={handleAddModule} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Module
        </button>
      </form>

      <div className="space-y-2">
        {course.modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                {mod.order_index}
              </span>
              <span className="font-medium">{mod.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/admin/courses/${id}/modules/${mod.id}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                Edit Content
              </Link>
              <button
                onClick={() => handleDeleteModule(mod.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
