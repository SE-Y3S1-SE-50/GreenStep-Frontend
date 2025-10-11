// src/api/posts.ts
import axios from "axios";
import { getApiUrl } from "../../config/api";

// ----------------------
// Fetch All Posts
// ----------------------
export const getAllPosts = async () => {
  try {
    const response = await axios.get(getApiUrl("/api/posts"));
    return response.data;
  } catch (error: any) {
    console.error("Error fetching posts:", error.response?.data || error.message);
    throw error;
  }
};

// ----------------------
// Create a New Post
// NOTE: accepts (userId, text) but sends { user, text } to match backend
// ----------------------
export const createPost = async (userId: string, text: string) => {
  try {
    const payload = { user: userId, text };
    const response = await axios.post(getApiUrl("/api/posts/create"), payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating post:", error.response?.data || error.message);
    throw error;
  }
};

// ----------------------
// Delete a Post (optional)
// ----------------------
export const deletePost = async (postId: string) => {
  try {
    const response = await axios.delete(getApiUrl(`/api/posts/${postId}`));
    return response.data;
  } catch (error: any) {
    console.error("Error deleting post:", error.response?.data || error.message);
    throw error;
  }
};
