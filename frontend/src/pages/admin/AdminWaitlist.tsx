import { useState, useEffect, type FormEvent } from "react";
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

export default function AdminWaitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    try {
      await addToWaitlist(email);
      setEmail("");
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add");
    }
  };

  const handleRemove = async (id: number) => {
    await removeFromWaitlist(id);
    load();
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Waitlist Management</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add email to waitlist"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        {entries.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 flex items-center justify-between"
            >
              <span className="text-gray-900">{entry.email}</span>
              <button
                onClick={() => handleRemove(entry.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
