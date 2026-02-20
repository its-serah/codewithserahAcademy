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
    await adminUpdateModule(Number(moduleId), {
      title: moduleTitle,
      description: moduleDesc,
    });
    load();
  };

  const handleAddBlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
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
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!mod)
    return (
      <div className="p-8 text-center text-gray-500">Module not found.</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to={`/admin/courses/${courseId}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to course
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">
        Edit Module {mod.order_index}: {mod.title}
      </h1>

      <form
        onSubmit={handleSaveModule}
        className="bg-white p-4 rounded-xl border border-gray-200 mb-8 space-y-3"
      >
        <input
          type="text"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Module title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={moduleDesc}
          onChange={(e) => setModuleDesc(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Module
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Content Blocks</h2>

      <div className="space-y-4 mb-8">
        {mod.content_blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white p-4 rounded-xl border border-gray-200"
          >
            {editingBlock?.id === block.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingBlock.title || ""}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Title"
                />
                {block.type === "reading" && (
                  <textarea
                    value={editingBlock.markdown_content || ""}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        markdown_content: e.target.value,
                      })
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                )}
                {block.type === "video" && (
                  <input
                    type="text"
                    value={editingBlock.youtube_video_id || ""}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        youtube_video_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="YouTube Video ID"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBlock}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingBlock(null)}
                    className="text-sm text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 mr-2">
                    {block.type}
                  </span>
                  <span className="font-medium">
                    {block.title || "(untitled)"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBlock({ ...block })}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAddBlock}
        className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3"
      >
        <h3 className="font-medium">Add Content Block</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="type"
              checked={blockType === "reading"}
              onChange={() => setBlockType("reading")}
            />
            Reading
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="type"
              checked={blockType === "video"}
              onChange={() => setBlockType("video")}
            />
            Video
          </label>
        </div>
        <input
          type="text"
          value={blockTitle}
          onChange={(e) => setBlockTitle(e.target.value)}
          placeholder="Block title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {blockType === "reading" && (
          <textarea
            value={blockContent}
            onChange={(e) => setBlockContent(e.target.value)}
            placeholder="Markdown content"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        {blockType === "video" && (
          <input
            type="text"
            value={blockVideoId}
            onChange={(e) => setBlockVideoId(e.target.value)}
            placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Block
        </button>
      </form>
    </div>
  );
}
