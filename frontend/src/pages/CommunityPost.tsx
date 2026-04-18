import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPost,
  likePost,
  deletePost,
  addComment,
  deleteComment,
} from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

interface Author {
  id: number;
  name: string;
  username: string | null;
  avatar_emoji: string | null;
}

interface Comment {
  id: number;
  body: string;
  author: Author;
  parent_id: number | null;
  created_at: string;
  replies?: Comment[];
}

interface Post {
  id: number;
  title: string;
  body: string;
  author: Author;
  course_id: number | null;
  course_title?: string | null;
  like_count: number;
  liked_by_me: boolean;
  comments: Comment[];
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function buildTree(flat: Comment[]): Comment[] {
  const byId = new Map<number, Comment>();
  flat.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots: Comment[] = [];
  byId.forEach((c) => {
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

export default function CommunityPost() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const load = async () => {
    try {
      const res = await getPost(postId);
      setPost(res.data);
    } catch {
      setError("Post not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    setPost({
      ...post,
      liked_by_me: !post.liked_by_me,
      like_count: post.like_count + (post.liked_by_me ? -1 : 1),
    });
    try {
      await likePost(post.id);
    } catch {
      load();
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(post.id);
      navigate("/community");
    } catch {
      alert("Failed to delete");
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, { body: commentBody.trim() });
      setCommentBody("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, { body: replyBody.trim(), parent_id: parentId });
      setReplyBody("");
      setReplyingTo(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      await load();
    } catch {
      alert("Failed to delete");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-4"
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
          Back to community
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error || "Post not found"}
        </div>
      </div>
    );
  }

  const tree = buildTree(post.comments);
  const isOwnPost = user?.id === post.author.id;

  const renderComment = (comment: Comment, depth = 0) => {
    const isOwn = user?.id === comment.author.id;
    return (
      <div
        key={comment.id}
        className={depth > 0 ? "ml-6 pl-4 border-l-2 border-brand/20" : ""}
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>{comment.author.avatar_emoji ?? "👤"}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {comment.author.username
                ? `@${comment.author.username}`
                : comment.author.name}
            </span>
            <span>·</span>
            <span>{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3 leading-relaxed">
            {comment.body}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {depth === 0 && user && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="text-brand hover:underline font-medium"
              >
                {replyingTo === comment.id ? "Cancel" : "Reply"}
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReply(comment.id);
              }}
              className="mt-3 space-y-2"
            >
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={2}
                required
                placeholder="Write a reply…"
                className={`${inputClass} resize-none`}
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {submitting ? "Posting…" : "Post Reply"}
              </button>
            </form>
          )}
        </div>
        {comment.replies?.map((r) => renderComment(r, depth + 1))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/community"
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
        Back to community
      </Link>

      {/* Post */}
      <article className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="text-base">{post.author.avatar_emoji ?? "👤"}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {post.author.username
              ? `@${post.author.username}`
              : post.author.name}
          </span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
          {post.course_title && (
            <>
              <span>·</span>
              <span className="text-brand font-medium">
                {post.course_title}
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {post.title}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-5">
          {post.body}
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-all ${
              post.liked_by_me
                ? "bg-brand text-white border-brand shadow-sm shadow-brand/20"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand hover:text-brand"
            }`}
          >
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
          </button>
          {isOwnPost && (
            <button
              onClick={handleDeletePost}
              className="text-sm text-red-400 hover:text-red-600 transition-colors px-1"
            >
              Delete post
            </button>
          )}
        </div>
      </article>

      {/* Add comment */}
      {user && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Join the discussion
          </h2>
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              required
              placeholder="Share your thoughts…"
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </form>
        </section>
      )}

      {/* Comments */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          {post.comments.length}{" "}
          {post.comments.length === 1 ? "Comment" : "Comments"}
        </h2>
        {tree.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No comments yet. Be the first to reply.
          </p>
        ) : (
          tree.map((c) => renderComment(c))
        )}
      </section>
    </div>
  );
}
