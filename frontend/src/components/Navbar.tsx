import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
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

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/courses"
                className="text-gray-600 hover:text-brand transition-colors"
              >
                Courses
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-brand transition-colors"
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-brand transition-colors"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-500">{user.name}</span>
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
                className="text-gray-600 hover:text-brand transition-colors"
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
