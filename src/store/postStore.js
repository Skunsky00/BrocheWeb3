// usePostStore.js
import { create } from "zustand";

const usePostStore = create((set) => ({
  posts: [],
  createPost: (post) =>
    set((state) => ({
      posts: [{ ...post, postOwnerUid: post.ownerUid }, ...state.posts],
    })),
  deletePost: (id) =>
    set((state) => ({ posts: state.posts.filter((post) => post.id !== id) })),
  setPosts: (posts) => set({ posts }),
  updatePost: (updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      ),
    })),
  // addCommentToPost: (postId, comment) =>
  //   set((state) => ({
  //     posts: state.posts.map((post) =>
  //       post.id === postId
  //         ? { ...post, comments: [...post.comments, comment] }
  //         : post
  //     ),
  //   })),
}));

export default usePostStore;
