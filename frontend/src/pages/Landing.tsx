import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 bg-cream dark:bg-gray-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand/8 dark:bg-brand/4 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-brand/5 dark:bg-brand/3 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        {!logoFailed ? (
          <img
            src="/logo.png"
            alt="CodewithSerah Academy"
            className="h-24 sm:h-32 w-auto object-contain mb-8"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className="mb-8 w-32 h-32 rounded-3xl bg-brand flex items-center justify-center shadow-xl shadow-brand/25">
            <span className="text-white text-3xl font-extrabold tracking-tight">
              CwS
            </span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/courses"
            className="bg-brand text-white px-7 py-3 rounded-full text-sm font-semibold shadow-md shadow-brand/20 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            Browse Courses
          </Link>
          {!user && (
            <Link
              to="/register"
              className="border-2 border-brand/25 text-brand dark:text-brand-light px-7 py-3 rounded-full text-sm font-semibold hover:border-brand hover:bg-brand-light dark:hover:bg-brand/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
