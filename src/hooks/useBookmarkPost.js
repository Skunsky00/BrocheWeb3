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
      if (!userId || !postId) return;

      const postBookmarksDoc = doc(
        firestore,
        `users/${userId}/user-bookmarks`,
        postId
      );
      const bookmarkDoc = await getDoc(postBookmarksDoc);
      setDidBookmark(bookmarkDoc.exists());
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

      // Add bookmark to both post's subcollection and user's subcollection
      await Promise.all([
        setDoc(doc(firestore, `posts/${postId}/post-bookmarks`, userId), {}),
        setDoc(doc(firestore, `users/${userId}/user-bookmarks`, postId), {}),
      ]);

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

      // Remove bookmark from both post's subcollection and user's subcollection
      await Promise.all([
        deleteDoc(doc(firestore, `posts/${postId}/post-bookmarks`, userId)),
        deleteDoc(doc(firestore, `users/${userId}/user-bookmarks`, postId)),
      ]);

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
