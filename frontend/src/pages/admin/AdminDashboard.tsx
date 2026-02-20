import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/waitlist"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold">Waitlist</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage approved emails for registration
          </p>
        </Link>
        <Link
          to="/admin/courses"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold">Courses</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage courses, modules, and content
          </p>
        </Link>
      </div>
    </div>
  );
}
