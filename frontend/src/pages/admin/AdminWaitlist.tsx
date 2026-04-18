import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  getWaitlist,
  addToWaitlist,
  removeFromWaitlist,
} from "../../api/endpoints";

interface WaitlistEntry {
  id: number;
  email: string;
  approved_at: string | null;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

export default function AdminWaitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getWaitlist()
      .then((res) => setEntries(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await addToWaitlist(email);
      setEmail("");
      setSuccess(`${email} added to waitlist.`);
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add email");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number, emailAddr: string) => {
    if (!confirm(`Remove ${emailAddr} from the waitlist?`)) return;
    await removeFromWaitlist(id);
    load();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-6"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Admin
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
          Admin
        </span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Waitlist
        </h1>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Add form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Add email to waitlist
        </p>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-3">
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
        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm mb-3">
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
            {success}
          </div>
        )}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="student@example.com"
            required
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex-shrink-0 bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* Entries list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📋</span>
            <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
              No emails on the waitlist yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand/20 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {entry.email[0].toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                    {entry.email}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(entry.id, entry.email)}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors ml-4"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
