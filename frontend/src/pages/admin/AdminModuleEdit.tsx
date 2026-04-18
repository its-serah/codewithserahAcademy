import { useState, useEffect, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
  adminGetModule,
  adminUpdateModule,
  adminCreateBlock,
  adminUpdateBlock,
  adminDeleteBlock,
} from "../../api/endpoints";

interface ContentBlock {
  id: number;
  type: string;
  title: string | null;
  order_index: number;
  markdown_content: string | null;
  youtube_video_id: string | null;
}

interface ModuleData {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  content_blocks: ContentBlock[];
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

const labelClass =
  "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function AdminModuleEdit() {
  const { id: courseId, moduleId } = useParams<{
    id: string;
    moduleId: string;
  }>();
  const [mod, setMod] = useState<ModuleData | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [blockType, setBlockType] = useState<"reading" | "video">("reading");
  const [blockTitle, setBlockTitle] = useState("");
  const [blockContent, setBlockContent] = useState("");
  const [blockVideoId, setBlockVideoId] = useState("");
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingBlock, setAddingBlock] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!moduleId) return;
    adminGetModule(Number(moduleId))
      .then((res) => {
        setMod(res.data);
        setModuleTitle(res.data.title);
        setModuleDesc(res.data.description || "");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [courseId, moduleId]);

  const handleSaveModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
    setSaving(true);
    try {
      await adminUpdateModule(Number(moduleId), {
        title: moduleTitle,
        description: moduleDesc,
      });
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
    setAddingBlock(true);
    try {
      await adminCreateBlock({
        module_id: Number(moduleId),
        type: blockType,
        title: blockTitle || undefined,
        markdown_content: blockType === "reading" ? blockContent : undefined,
        youtube_video_id: blockType === "video" ? blockVideoId : undefined,
      });
      setBlockTitle("");
      setBlockContent("");
      setBlockVideoId("");
      load();
    } finally {
      setAddingBlock(false);
    }
  };

  const handleSaveBlock = async () => {
    if (!editingBlock) return;
    await adminUpdateBlock(editingBlock.id, {
      title: editingBlock.title,
      markdown_content: editingBlock.markdown_content,
      youtube_video_id: editingBlock.youtube_video_id,
    });
    setEditingBlock(null);
    load();
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!confirm("Delete this content block?")) return;
    await adminDeleteBlock(blockId);
    load();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!mod)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 dark:text-gray-400">
        Module not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        to={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
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
        Back to course
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
          Module {mod.order_index}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mod.title}
        </h1>
      </div>

      {/* Module info */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
          Module Details
        </h2>
        <form onSubmit={handleSaveModule} className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
            >
              {saving ? "Saving…" : "Save Module"}
            </button>
            {saveMsg && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Content blocks */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Content Blocks
          </h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {mod.content_blocks.length} blocks
          </span>
        </div>

        {mod.content_blocks.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 mb-5">
            No content blocks yet.
          </p>
        ) : (
          <div className="space-y-3 mb-6">
            {mod.content_blocks.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {editingBlock?.id === block.id ? (
                  <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={editingBlock.title || ""}
                        onChange={(e) =>
                          setEditingBlock({
                            ...editingBlock,
                            title: e.target.value,
                          })
                        }
                        className={inputClass}
                        placeholder="Block title"
                      />
                    </div>
                    {block.type === "reading" && (
                      <div>
                        <label className={labelClass}>Markdown Content</label>
                        <textarea
                          value={editingBlock.markdown_content || ""}
                          onChange={(e) =>
                            setEditingBlock({
                              ...editingBlock,
                              markdown_content: e.target.value,
                            })
                          }
                          rows={10}
                          className={`${inputClass} font-mono resize-y`}
                        />
                      </div>
                    )}
                    {block.type === "video" && (
                      <div>
                        <label className={labelClass}>YouTube Video ID</label>
                        <input
                          type="text"
                          value={editingBlock.youtube_video_id || ""}
                          onChange={(e) =>
                            setEditingBlock({
                              ...editingBlock,
                              youtube_video_id: e.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder="e.g. dQw4w9WgXcQ"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveBlock}
                        className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-all shadow-sm shadow-brand/20"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBlock(null)}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800">
                    <span className="w-7 h-7 rounded-lg bg-brand-light dark:bg-brand/20 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {block.order_index}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        block.type === "video"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      }`}
                    >
                      {block.type}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {block.title || "(untitled)"}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => setEditingBlock({ ...block })}
                        className="text-xs text-brand hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add block form */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
            Add Content Block
          </h3>
          <form onSubmit={handleAddBlock} className="space-y-4">
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex gap-4">
                {(["reading", "video"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                      blockType === t
                        ? "border-brand bg-brand-light dark:bg-brand/20 text-brand"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      className="sr-only"
                      checked={blockType === t}
                      onChange={() => setBlockType(t)}
                    />
                    {t === "reading" ? (
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
                    ) : (
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
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Block Title (optional)</label>
              <input
                type="text"
                value={blockTitle}
                onChange={(e) => setBlockTitle(e.target.value)}
                placeholder="e.g. Introduction"
                className={inputClass}
              />
            </div>
            {blockType === "reading" && (
              <div>
                <label className={labelClass}>Markdown Content</label>
                <textarea
                  value={blockContent}
                  onChange={(e) => setBlockContent(e.target.value)}
                  placeholder="Write your content in Markdown…"
                  rows={8}
                  className={`${inputClass} font-mono resize-y`}
                />
              </div>
            )}
            {blockType === "video" && (
              <div>
                <label className={labelClass}>YouTube Video ID</label>
                <input
                  type="text"
                  value={blockVideoId}
                  onChange={(e) => setBlockVideoId(e.target.value)}
                  placeholder="e.g. dQw4w9WgXcQ"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  The ID from the YouTube URL after ?v=
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={addingBlock}
              className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
            >
              {addingBlock ? "Adding…" : "Add Block"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
