import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { updateProfile, changePassword } from "../api/endpoints";

const EMOJIS = [
  { emoji: "🦁", title: "The Leader" },
  { emoji: "🦊", title: "The Thinker" },
  { emoji: "🐬", title: "The Explorer" },
  { emoji: "🦋", title: "The Creative" },
  { emoji: "🐉", title: "The Achiever" },
  { emoji: "🌙", title: "The Dreamer" },
  { emoji: "⚡", title: "The Energizer" },
  { emoji: "🎯", title: "The Focused" },
  { emoji: "🌊", title: "The Go-Getter" },
  { emoji: "🔥", title: "The Passionate" },
  { emoji: "🌸", title: "The Gentle Soul" },
  { emoji: "🎭", title: "The Expressive" },
  { emoji: "🦉", title: "The Wise One" },
  { emoji: "🚀", title: "The Innovator" },
  { emoji: "💎", title: "The Gem" },
  { emoji: "🌈", title: "The Optimist" },
  { emoji: "🐻", title: "The Loyal" },
  { emoji: "🦅", title: "The Free Spirit" },
  { emoji: "🌺", title: "The Nurturer" },
  { emoji: "🎸", title: "The Rebel" },
  { emoji: "🏆", title: "The Champion" },
  { emoji: "🌟", title: "The Star" },
  { emoji: "🐙", title: "The Problem Solver" },
  { emoji: "🦚", title: "The Perfectionist" },
  { emoji: "🐺", title: "The Lone Wolf" },
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [certificateName, setCertificateName] = useState(
    user?.certificate_name ?? "",
  );
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(
    user?.avatar_emoji ?? null,
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const selectedPersonality = EMOJIS.find((e) => e.emoji === avatarEmoji);

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
        avatar_emoji: avatarEmoji,
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
        <form onSubmit={handleProfileSave} className="space-y-5">
          {profileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {profileSuccess}
            </div>
          )}

          {/* Avatar Emoji Picker */}
          <div>
            <label className={labelClass}>Your Avatar</label>

            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-4xl border-2 border-brand/30">
                {avatarEmoji ?? (
                  <span className="text-gray-400 dark:text-gray-500">?</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-brand">
                {selectedPersonality?.title ?? "Pick your personality"}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {EMOJIS.map((item) => {
                const selected = item.emoji === avatarEmoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(selected ? null : item.emoji)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      selected
                        ? "ring-2 ring-brand bg-brand-light dark:bg-brand/20 border-brand"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand/40 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    aria-pressed={selected}
                    aria-label={item.title}
                  >
                    <span className="text-2xl leading-none">{item.emoji}</span>
                    <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 text-center leading-tight">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email — locked */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
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
