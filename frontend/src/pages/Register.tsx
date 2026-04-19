import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const perks = [
  "Waitlist access only",
  "Video lessons at your own pace",
  "Progressive module unlocking",
  "Certificate on course completion",
  "Student community included",
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateEmail = (v: string) => {
    if (!v) return "Email is required";
    if (!EMAIL_REGEX.test(v)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "Password is required";
    if (v.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nameErr = name.trim() ? "" : "Name is required";
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passErr);
    if (nameErr || emailErr || passErr) return;
    setError("");
    setLoading(true);
    try {
      const res = await register(email, password, name);
      setToken(res.data.access_token);
      showToast(`Welcome, ${name.trim()}! Your account is ready.`);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasErr: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
      hasErr
        ? "border-red-400 focus:ring-red-200 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300"
        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand/30 focus:border-brand"
    }`;

  const ErrorIcon = () => (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand to-brand-dark flex-col justify-between p-12 text-white">
        <div />
        <div>
          <h2 className="text-3xl font-bold leading-snug mb-3">
            Start learning
            <br />
            with Serah
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Create your account and get started.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 text-sm text-white/85"
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/40 text-xs">© CodewithSerah Academy</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-cream dark:bg-gray-900">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  required
                  className={inputCls(!!nameError)}
                />
                {nameError && <ErrorIcon />}
              </div>
              {nameError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError)
                      setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  required
                  className={inputCls(!!emailError)}
                />
                {emailError && <ErrorIcon />}
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError)
                      setPasswordError(validatePassword(e.target.value));
                  }}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  required
                  minLength={6}
                  className={inputCls(!!passwordError)}
                />
                {passwordError && <ErrorIcon />}
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-dark disabled:opacity-50 shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/25 transition-all duration-200 mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              Only waitlisted emails can register. You'll receive a welcome
              &amp; verification email.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
