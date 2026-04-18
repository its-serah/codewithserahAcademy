import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/endpoints";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  module_count: number;
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading courses...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        Courses
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Pick a course and start learning
      </p>

      {courses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No courses available yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug}`}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                  <span className="text-white text-5xl font-bold">
                    {course.title[0]}
                  </span>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {course.module_count} modules
                  </span>
                  <span className="text-xs font-medium text-brand bg-brand-light dark:bg-brand/20 px-2 py-0.5 rounded-full">
                    View course →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
