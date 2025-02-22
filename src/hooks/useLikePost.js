import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUpdatePostCollection from "./useUpdatePostCollection";
import usePostStore from "../store/postStore";

const useLikePost = (postId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [didLike, setDidLike] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { updatePostCollection } = useUpdatePostCollection(postId);

  // Get posts from all slices
  const posts = usePostStore((state) => state.posts);
  const feedPosts = usePostStore((state) => state.feedPosts);
  const bookmarkedPosts = usePostStore((state) => state.bookmarkedPosts);
  const updatePostStore = usePostStore((state) => state.updatePost);

  // Real-time listener for likes
  useEffect(() => {
    if (!postId) return;

    const likesCollectionRef = collection(
      firestore,
      `posts/${postId}/post-likes`
    );
    const unsubscribeLikes = onSnapshot(likesCollectionRef, (snapshot) => {
      const likesCount = snapshot.size; // Real-time count

      // Update the like count across all arrays
      updatePostStore((post) =>
        post.id === postId ? { ...post, likes: likesCount } : post
      );
    });

    return () => unsubscribeLikes();
  }, [postId, updatePostStore]);

  useEffect(() => {
    if (!authUser || !postId) return;
    checkIfUserLikedPost();
  }, [authUser, postId]);

  const checkIfUserLikedPost = async () => {
    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      const postLikesDoc = doc(firestore, `posts/${postId}/post-likes`, userId);
      const postLikesSnapshot = await getDoc(postLikesDoc);
      setDidLike(postLikesSnapshot.exists());
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const likePost = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      const postLikesDoc = doc(firestore, `posts/${postId}/post-likes`, userId);
      const userLikesDoc = doc(firestore, `users/${userId}/user-likes`, postId);

      // Look for the post in all slices
      const currentPost =
        posts.find((post) => post.id === postId) ||
        feedPosts.find((post) => post.id === postId) ||
        bookmarkedPosts.find((post) => post.id === postId);

      if (!currentPost) {
        console.warn("Post not found in any slice");
        return;
      }

      const currentLikes = currentPost?.likes ?? 0;
      // Optimistically update the like count
      updatePostStore({ ...currentPost, likes: currentLikes + 1 });

      await setDoc(postLikesDoc, {});
      await setDoc(userLikesDoc, {});

      setDidLike(true);
      updatePostCollection();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const unlikePost = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      const postLikesDoc = doc(firestore, `posts/${postId}/post-likes`, userId);
      const userLikesDoc = doc(firestore, `users/${userId}/user-likes`, postId);

      // Look for the post in all slices
      const currentPost =
        posts.find((post) => post.id === postId) ||
        feedPosts.find((post) => post.id === postId) ||
        bookmarkedPosts.find((post) => post.id === postId);

      if (!currentPost) {
        console.warn("Post not found in any slice");
        return;
      }

      const currentLikes = currentPost?.likes ?? 0;
      updatePostStore({
        ...currentPost,
        likes: Math.max(currentLikes - 1, 0),
      });

      await deleteDoc(postLikesDoc);
      await deleteDoc(userLikesDoc);

      setDidLike(false);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return { didLike, likePost, unlikePost, isUpdating };
};

export default useLikePost;
