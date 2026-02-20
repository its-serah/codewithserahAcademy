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
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!course)
    return (
      <div className="p-8 text-center text-gray-500">Course not found.</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-gray-600">{course.description}</p>

      {!enrolled && (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {enrolling ? "Enrolling..." : "Enroll in Course"}
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <div className="space-y-3">
          {(modules || course.modules).map((mod) => {
            const isUnlocked = mod.is_unlocked ?? false;
            return (
              <div
                key={mod.id}
                className={`p-4 rounded-lg border ${isUnlocked || !enrolled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isUnlocked || !enrolled ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-400"}`}
                    >
                      {mod.order_index}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-sm text-gray-500">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {enrolled &&
                    (isUnlocked ? (
                      <Link
                        to={`/courses/${slug}/modules/${mod.id}`}
                        className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
                      >
                        Start
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Locked</span>
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
