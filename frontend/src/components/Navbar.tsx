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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/70 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="CodewithSerah"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const placeholder = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
          <div
            className="hidden h-9 w-32 bg-brand rounded-xl items-center justify-center text-white text-xs font-bold tracking-widest uppercase"
            style={{ display: "none" }}
          >
            YOUR LOGO
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg
                className="w-4.5 h-4.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4.5 h-4.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {user ? (
            <>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/community">Community</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

              <Link
                to="/profile"
                className="ml-1 flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-sm font-medium hover:bg-brand/20 dark:hover:bg-brand/30 transition-colors"
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {user.avatar_emoji ?? "👤"}
                </span>
                <span className="max-w-[120px] truncate">
                  {user.username ? `@${user.username}` : user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link
                to="/register"
                className="ml-2 bg-brand text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark hover:shadow-md hover:shadow-brand/20 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand hover:bg-brand-light/50 dark:hover:bg-brand/10 transition-colors"
    >
      {children}
    </Link>
  );
}
