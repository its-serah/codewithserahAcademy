import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          {/* Replace /logo.png with your actual logo file */}
          <img
            src="/logo.png"
            alt="CodewithSerah"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const placeholder = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
          <div
            className="hidden h-10 w-36 bg-brand rounded-lg items-center justify-center text-white text-sm font-semibold tracking-wide"
            style={{ display: "none" }}
          >
            YOUR LOGO
          </div>
        </Link>

        <div className="flex items-center gap-5">
          {/* Dark/light mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/courses"
                className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
              >
                Courses
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/community"
                className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
              >
                Community
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand dark:hover:text-brand transition-colors flex items-center gap-1.5"
              >
                <span aria-hidden="true">{user.avatar_emoji ?? "👤"}</span>
                {user.username ? `@${user.username}` : user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-brand transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
