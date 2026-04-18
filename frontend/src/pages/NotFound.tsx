import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-cream dark:bg-gray-900">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-brand/20 dark:text-brand/10 leading-none select-none">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist or was moved.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand/30 hover:text-brand transition-all"
          >
            ← Go back
          </button>
          <Link
            to="/"
            className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
