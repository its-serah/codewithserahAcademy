import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getPosts, createPost, getCourses } from "../api/endpoints";

interface Author {
  id: number;
  name: string;
  username: string | null;
  avatar_emoji: string | null;
}

interface Post {
  id: number;
  title: string;
  body: string;
  author: Author;
  course_id: number | null;
  course_title?: string | null;
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

  useEffect(() => {
    setLoading(true);
    const params: { course_id?: number; search?: string } = {};
    if (courseFilter) params.course_id = Number(courseFilter);
    if (search.trim()) params.search = search.trim();
    const t = setTimeout(() => {
      getPosts(params)
        .then((res) => setPosts(res.data))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    }, 250);
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
      const res = await createPost({
        title: title.trim(),
        body: body.trim(),
        course_id: postCourseId ? Number(postCourseId) : null,
      });
      setPosts((p) => [res.data, ...p]);
      setTitle("");
      setBody("");
      setPostCourseId("");
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
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
          className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? "Cancel" : "Ask a Question"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-t-4 border-t-brand p-6 mb-6 space-y-4"
        >
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              className={inputClass}
              placeholder="Share the details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors font-medium"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className={`${inputClass} flex-1 min-w-[200px]`}
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={`${inputClass} sm:w-60`}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
          <p className="text-gray-500 dark:text-gray-400">
            No posts yet. Be the first to start a discussion.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/posts/${post.id}`}
              className="block bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span aria-hidden="true">
                  {post.author.avatar_emoji ?? "👤"}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {post.author.username
                    ? `@${post.author.username}`
                    : post.author.name}
                </span>
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
                {post.course_title && (
                  <>
                    <span>·</span>
                    <span className="text-brand">{post.course_title}</span>
                  </>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 whitespace-pre-wrap">
                {post.body}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>♥ {post.like_count}</span>
                <span>💬 {post.comment_count}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
