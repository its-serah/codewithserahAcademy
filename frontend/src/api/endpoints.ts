import api from "./client";

// Auth
export const register = (email: string, password: string, name: string) =>
  api.post("/auth/register", { email, password, name });

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const getMe = () => api.get("/auth/me");

export const updateProfile = (data: {
  name: string;
  username?: string | null;
  certificate_name?: string | null;
  avatar_emoji?: string | null;
}) => api.patch("/auth/profile", data);

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token: string, new_password: string) =>
  api.post("/auth/reset-password", { token, new_password });

export const verifyEmail = (token: string) =>
  api.post("/auth/verify-email", { token });

export const resendVerification = () => api.post("/auth/resend-verification");

// Community
export const getPosts = (params?: {
  course_id?: number;
  search?: string;
  skip?: number;
}) => api.get("/community/posts", { params });

export const getPost = (id: number) => api.get(`/community/posts/${id}`);

export const createPost = (data: {
  title: string;
  body: string;
  course_id?: number | null;
}) => api.post("/community/posts", data);

export const deletePost = (id: number) => api.delete(`/community/posts/${id}`);

export const likePost = (id: number) => api.post(`/community/posts/${id}/like`);

export const addComment = (
  postId: number,
  data: { body: string; parent_id?: number | null },
) => api.post(`/community/posts/${postId}/comments`, data);

export const deleteComment = (id: number) =>
  api.delete(`/community/comments/${id}`);

export const changePassword = (
  current_password: string,
  new_password: string,
) => api.post("/auth/change-password", { current_password, new_password });

// Courses
export const getCourses = () => api.get("/courses");
export const getCourse = (slug: string) => api.get(`/courses/${slug}`);

// Enrollments
export const enroll = (slug: string) => api.post(`/courses/${slug}/enroll`);
export const getEnrollments = () => api.get("/enrollments");

// Modules
export const getModules = (slug: string) => api.get(`/courses/${slug}/modules`);
export const getModule = (slug: string, moduleId: number) =>
  api.get(`/courses/${slug}/modules/${moduleId}`);

// Progress
export const completeBlock = (blockId: number) =>
  api.post(`/progress/${blockId}/complete`);
export const getCourseProgress = (courseId: number) =>
  api.get(`/progress/course/${courseId}`);

// Admin - Waitlist
export const getWaitlist = () => api.get("/admin/waitlist");
export const addToWaitlist = (email: string) =>
  api.post("/admin/waitlist", { email });
export const removeFromWaitlist = (id: number) =>
  api.delete(`/admin/waitlist/${id}`);

// Admin - Courses
export const adminGetCourses = () => api.get("/admin/courses");
export const adminGetCourse = (id: number) => api.get(`/admin/courses/${id}`);
export const adminCreateCourse = (data: {
  title: string;
  description?: string;
}) => api.post("/admin/courses", data);
export const adminUpdateCourse = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/courses/${id}`, data);
export const adminDeleteCourse = (id: number) =>
  api.delete(`/admin/courses/${id}`);

// Admin - Modules
export const adminGetModule = (id: number) => api.get(`/admin/modules/${id}`);
export const adminCreateModule = (data: {
  course_id: number;
  title: string;
  description?: string;
}) => api.post("/admin/modules", data);
export const adminUpdateModule = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/modules/${id}`, data);
export const adminDeleteModule = (id: number) =>
  api.delete(`/admin/modules/${id}`);
export const adminReorderModules = (module_ids: number[]) =>
  api.post("/admin/modules/reorder", { module_ids });

// Feedback
export const submitFeedback = (
  moduleId: number,
  data: { rating: number; comment?: string },
) => api.post(`/modules/${moduleId}/feedback`, data);
export const getMyFeedback = (moduleId: number) =>
  api.get(`/modules/${moduleId}/feedback/mine`);

// Admin - Analytics
export const adminGetAnalytics = () => api.get("/admin/analytics");

// Admin - Feedback
export const adminGetModuleFeedback = (moduleId: number) =>
  api.get(`/admin/modules/${moduleId}/feedback`);

// Admin - Content Blocks
export const adminCreateBlock = (data: {
  module_id: number;
  type: string;
  title?: string;
  markdown_content?: string;
  youtube_video_id?: string;
}) => api.post("/admin/content-blocks", data);
export const adminUpdateBlock = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/content-blocks/${id}`, data);
export const adminDeleteBlock = (id: number) =>
  api.delete(`/admin/content-blocks/${id}`);
