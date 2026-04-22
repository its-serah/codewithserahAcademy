import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import logo from "../assets/logocodewithserahoct.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-700/70 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-28">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center flex-shrink-0"
          onClick={close}
        >
          <img
            src={logo}
            alt="CodewithSerah Academy"
            className="h-24 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {user ? (
            <>
              <NavLink to="/courses" active={location.pathname === "/courses"}>
                Courses
              </NavLink>
              <NavLink
                to="/dashboard"
                active={location.pathname === "/dashboard"}
              >
                Dashboard
              </NavLink>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  active={location.pathname.startsWith("/admin")}
                >
                  Admin
                </NavLink>
              )}
              <Link
                to="/profile"
                className={`ml-1 flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-brand text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-light dark:hover:bg-brand/20 hover:text-brand dark:hover:text-brand"
                }`}
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
            <div className="flex items-center gap-2 ml-auto">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  location.pathname === "/login"
                    ? "border-brand text-brand bg-brand/5"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand hover:text-brand dark:hover:text-brand"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark hover:shadow-md hover:shadow-brand/20 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 space-y-1">
          {user ? (
            <>
              {/* User pill */}
              <Link
                to="/profile"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-brand-light dark:bg-brand/20 mb-3"
              >
                <span className="text-2xl leading-none">
                  {user.avatar_emoji ?? "👤"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand truncate">
                    {user.username ? `@${user.username}` : user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </Link>

              <MobileNavLink
                to="/courses"
                onClick={close}
                active={location.pathname === "/courses"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Courses
              </MobileNavLink>
              <MobileNavLink
                to="/dashboard"
                onClick={close}
                active={location.pathname === "/dashboard"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </MobileNavLink>
              {user.role === "admin" && (
                <MobileNavLink
                  to="/admin"
                  onClick={close}
                  active={location.pathname.startsWith("/admin")}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin
                </MobileNavLink>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink
                to="/login"
                onClick={close}
                active={location.pathname === "/login"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </MobileNavLink>
              <Link
                to="/register"
                onClick={close}
                className="flex items-center justify-center gap-2 mt-2 bg-brand text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors shadow-sm shadow-brand/20"
              >
                Get Started Free →
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function ThemeToggle({
  theme,
  toggleTheme,
}: {
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function NavLink({
  to,
  children,
  active,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-brand bg-brand/20 dark:bg-brand/25 font-semibold"
          : "text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand hover:bg-brand/8 dark:hover:bg-brand/10"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
  active,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "text-brand bg-brand/20 dark:bg-brand/25 font-semibold"
          : "text-gray-700 dark:text-gray-300 hover:text-brand hover:bg-brand/8 dark:hover:bg-brand/10"
      }`}
    >
      {children}
    </Link>
  );
}
