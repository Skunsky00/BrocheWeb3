import { create } from "zustand";

const usePostStore = create((set) => ({
  posts: [], // For liked posts
  bookmarkedPosts: [], // For bookmarked posts
  feedPosts: [], // For feed pagination

  createPost: (post) =>
    set((state) => ({
      posts: [{ ...post, postOwnerUid: post.ownerUid }, ...state.posts],
    })),

  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
      bookmarkedPosts: state.bookmarkedPosts.filter((post) => post.id !== id),
      feedPosts: state.feedPosts.filter((post) => post.id !== id),
    })),

  setPosts: (postsOrUpdater) =>
    set((state) => ({
      posts:
        typeof postsOrUpdater === "function"
          ? postsOrUpdater(state.posts)
          : postsOrUpdater,
    })),

  setBookmarkedPosts: (bookmarkedPosts) => set({ bookmarkedPosts }),

  setFeedPosts: (feedPostsOrUpdater) =>
    set((state) => {
      const updatedFeedPosts =
        typeof feedPostsOrUpdater === "function"
          ? feedPostsOrUpdater(state.feedPosts)
          : feedPostsOrUpdater;

      return {
        feedPosts: [
          ...new Map(updatedFeedPosts.map((post) => [post.id, post])).values(),
        ],
      };
    }),

  updatePost: (updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      ),
      bookmarkedPosts: state.bookmarkedPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      ),
      feedPosts: state.feedPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      ),
    })),
}));

export default usePostStore;
