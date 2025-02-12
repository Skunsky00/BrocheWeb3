import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";

const useBookmarkPost = (postId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [didBookmark, setDidBookmark] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const postStore = usePostStore((state) => state.posts);
  const updatePostStore = usePostStore((state) => state.updatePost);

  const checkIfUserBookmarkedPost = async () => {
    try {
      const userId = authUser?.id;
      if (userId && postId) {
        const postRef = doc(firestore, "posts", postId);
        onSnapshot(postRef, (doc) => {
          const updatedPost = {
            ...postStore.find((post) => post.id === postId),
          };
          updatePostStore(updatedPost);
        });

        const postBookmarksDoc = doc(
          firestore,
          `posts/${postId}/post-bookmarks`,
          userId
        );
        const bookmarkDoc = await getDoc(postBookmarksDoc);
        setDidBookmark(bookmarkDoc.exists());
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  useEffect(() => {
    if (authUser && postId) {
      checkIfUserBookmarkedPost();
    }
  }, [authUser, postId]);

  const bookmarkPost = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      await setDoc(
        doc(firestore, `posts/${postId}/post-bookmarks`, userId),
        {}
      );
      setDidBookmark(true);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const unbookmarkPost = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      await deleteDoc(doc(firestore, `posts/${postId}/post-bookmarks`, userId));
      setDidBookmark(false);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return { didBookmark, bookmarkPost, unbookmarkPost, isUpdating };
};

export default useBookmarkPost;
