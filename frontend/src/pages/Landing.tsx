import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-cream dark:bg-gray-900 px-4">
      <h1 className="text-5xl font-bold text-gray-900 text-center">
        Learn to Code with <span className="text-brand">Serah</span>
      </h1>
      <p className="mt-4 text-xl text-gray-600 text-center max-w-2xl">
        Master programming step by step. Interactive courses with videos,
        readings, and progressive module unlocking.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/courses"
          className="bg-brand text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-brand-dark transition-colors"
        >
          Browse Courses
        </Link>
        {!user && (
          <Link
            to="/register"
            className="border-2 border-brand text-brand px-6 py-3 rounded-lg text-lg font-medium hover:bg-brand-light transition-colors"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
