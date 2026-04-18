import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { updateProfile, changePassword } from "../api/endpoints";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile fields
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [certificateName, setCertificateName] = useState(
    user?.certificate_name ?? "",
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError("Display name is required");
      return;
    }
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim() || null,
        certificate_name: certificateName.trim() || null,
      });
      await refreshUser();
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.detail || "Failed to change password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors";

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Profile
      </h1>

      {/* Profile Info */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-t-4 border-t-brand p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          Profile Information
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {profileError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
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
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {profileSuccess}
            </div>
          )}

          {/* Email — locked */}
          <div>
            <label className={labelClass}>Email</label>
            <div className="relative">
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Display name */}
          <div>
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="How you appear on the platform"
            />
          </div>

          {/* Username */}
          <div>
            <label className={labelClass}>Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                }
                className={`${inputClass} pl-7`}
                placeholder="yourhandle"
                maxLength={50}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Letters, numbers, and underscores only
            </p>
          </div>

          {/* Certificate name */}
          <div>
            <label className={labelClass}>Certificate Full Name</label>
            <input
              type="text"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              className={inputClass}
              placeholder="Your full legal name"
            />
            {/* Live preview */}
            <div className="mt-2 px-4 py-3 bg-cream dark:bg-gray-900 border border-dashed border-brand/40 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <span className="text-xs font-medium text-brand uppercase tracking-wide block mb-1">
                Certificate Preview
              </span>
              This certifies that{" "}
              <span className="font-semibold text-gray-900 dark:text-white italic">
                {certificateName.trim() || name.trim() || "Your Name"}
              </span>{" "}
              has successfully completed the course.
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors font-medium"
          >
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              theme === "dark" ? "bg-brand" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={theme === "dark"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
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
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {passwordSuccess}
            </div>
          )}

          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${inputClass} ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400 focus:ring-red-300"
                  : ""
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors font-medium"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
