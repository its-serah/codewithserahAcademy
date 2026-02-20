import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <h1 className="text-5xl font-bold text-gray-900 text-center">
        Learn to Code with <span className="text-indigo-600">Serah</span>
      </h1>
      <p className="mt-4 text-xl text-gray-600 text-center max-w-2xl">
        Master programming step by step. Interactive courses with videos,
        readings, and progressive module unlocking.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/courses"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700"
        >
          Browse Courses
        </Link>
        {!user && (
          <Link
            to="/register"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
