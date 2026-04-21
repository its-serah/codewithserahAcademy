import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getPosts, createPost, getCourses } from "../api/endpoints";

interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  author_name: string;
  author_emoji: string | null;
  course_id: number | null;
  comment_count: number;
  like_count: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCourseId, setPostCourseId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  const fetchPosts = (params: { course_id?: number; search?: string } = {}) => {
    setLoading(true);
    getPosts(params)
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params: { course_id?: number; search?: string } = {};
    if (courseFilter) params.course_id = Number(courseFilter);
    if (search.trim()) params.search = search.trim();
    const t = setTimeout(() => fetchPosts(params), 250);
    return () => clearTimeout(t);
  }, [search, courseFilter]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError("Title and body are required");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        body: body.trim(),
        course_id: postCourseId ? Number(postCourseId) : null,
      });
      setTitle("");
      setBody("");
      setPostCourseId("");
      setShowForm(false);
      const params: { course_id?: number; search?: string } = {};
      if (courseFilter) params.course_id = Number(courseFilter);
      if (search.trim()) params.search = search.trim();
      fetchPosts(params);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ask questions, share ideas, and learn together.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-all shadow-sm shadow-brand/20"
        >
          {showForm ? (
            <>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ask a Question
            </>
          )}
        </button>
      </div>

      {/* Create post form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Start a discussion
          </h2>
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
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
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className={inputClass}
              placeholder="What's your question?"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Details
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Share the details..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Course (optional)
            </label>
            <select
              value={postCourseId}
              onChange={(e) => setPostCourseId(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
          >
            {submitting ? "Posting…" : "Post Question"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={`${inputClass} sm:w-52`}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-14">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-light dark:bg-brand/20 text-brand mx-auto">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
          <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">
            No posts yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Be the first to start a discussion.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/posts/${post.id}`}
              className="block bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-brand/30 dark:hover:border-brand/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>{post.author_emoji ?? "👤"}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {post.author_name}
                </span>
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors mb-1.5">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 whitespace-pre-wrap mb-3">
                {post.body}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.comment_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
