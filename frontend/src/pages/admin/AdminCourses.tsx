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

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
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
    await adminCreateCourse({ title, description: desc || undefined });
    setTitle("");
    setDesc("");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    await adminDeleteCourse(id);
    load();
  };

  const togglePublish = async (course: Course) => {
    await adminUpdateCourse(course.id, { is_published: !course.is_published });
    load();
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Courses</h1>

      <form
        onSubmit={handleCreate}
        className="bg-white p-4 rounded-xl border border-gray-200 mb-6 space-y-3"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Course
        </button>
      </form>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between"
          >
            <div>
              <Link
                to={`/admin/courses/${course.id}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {course.title}
              </Link>
              <p className="text-sm text-gray-500">
                {course.module_count} modules
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => togglePublish(course)}
                className={`text-xs px-3 py-1 rounded-full ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {course.is_published ? "Published" : "Draft"}
              </button>
              <Link
                to={`/admin/courses/${course.id}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(course.id)}
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
