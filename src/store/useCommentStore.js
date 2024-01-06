// useCommentStore.js
import { create } from "zustand";

const useCommentStore = create((set) => ({
  comments: {},
  addComment: (postId, comment) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: [...(state.comments[postId] || []), comment],
      },
    })),
}));

export default useCommentStore;
