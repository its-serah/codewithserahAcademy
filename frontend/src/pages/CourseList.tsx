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
  is_coming_soon: boolean;
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Courses
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pick a course and start learning today.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-light dark:bg-brand/20 text-brand mx-auto">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </span>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
            No courses available yet.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Check back soon — content is coming.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) =>
            course.is_coming_soon ? (
              <div
                key={course.id}
                className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-70 cursor-not-allowed select-none"
              >
                {/* lock overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                    Coming Soon
                  </span>
                </div>

                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold opacity-50">
                      {course.title[0]}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-brand/30 dark:hover:border-brand/30 hover:-translate-y-1 transition-all duration-200"
              >
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                    <span className="text-white text-6xl font-bold opacity-80">
                      {course.title[0]}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h10"
                        />
                      </svg>
                      {course.module_count}{" "}
                      {course.module_count === 1 ? "module" : "modules"}
                    </span>
                    <span className="text-xs font-semibold text-brand bg-brand-light dark:bg-brand/20 px-2.5 py-1 rounded-full">
                      View course →
                    </span>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
