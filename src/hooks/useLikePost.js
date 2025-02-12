// useLikePost.js
import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot, // Add this import
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
  const { updatePostCollection, isUpdating: isUpdatingPostCollection } =
    useUpdatePostCollection(postId);

  const postStore = usePostStore((state) => state.posts);
  const updatePostStore = usePostStore((state) => state.updatePost);

  useEffect(() => {
    if (!postId) return;

    const likesCollectionRef = collection(
      firestore,
      `posts/${postId}/post-likes`
    );
    const unsubscribeLikes = onSnapshot(likesCollectionRef, (snapshot) => {
      const likesCount = snapshot.size;
      const currentPost = postStore.find((post) => post.id === postId);
      if (currentPost) {
        updatePostStore({ ...currentPost, likes: likesCount });
      }
    });
    return () => unsubscribeLikes();
  }, [postId]);

  const checkIfUserLikedPost = async () => {
    try {
      const userId = authUser?.id;

      if (userId && postId) {
        const postRef = doc(firestore, "posts", postId);

        onSnapshot(postRef, (doc) => {
          const currentLikes = doc.data().likes || 0;
          const updatedPost = {
            ...postStore.find((post) => post.id === postId),
            likes: currentLikes,
          };
          updatePostStore(updatedPost);
        });

        const postLikesCollection = doc(
          firestore,
          `posts/${postId}/post-likes`,
          userId
        );
        const postLikesDoc = await getDoc(postLikesCollection);
        const userLikedPost = postLikesDoc.exists();

        setDidLike(userLikedPost);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  useEffect(() => {
    if (authUser && postId) {
      checkIfUserLikedPost();
    }
  }, [authUser, postId]);

  const likePost = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const userId = authUser?.id;
      if (!userId || !postId) return;

      // Get current likes count
      const currentPost = postStore.find((post) => post.id === postId);
      const currentLikes = currentPost?.likes ?? 0;

      // Optimistically update local state
      updatePostStore({ ...currentPost, likes: currentLikes + 1 });

      // Firestore update
      const postLikesDoc = doc(firestore, `posts/${postId}/post-likes`, userId);
      await setDoc(postLikesDoc, {});

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

      // Get current likes count
      const currentPost = postStore.find((post) => post.id === postId);
      const currentLikes = currentPost?.likes ?? 0;

      // Optimistically update local state
      updatePostStore({ ...currentPost, likes: Math.max(currentLikes - 1, 0) });

      // Firestore update
      const postLikesDoc = doc(firestore, `posts/${postId}/post-likes`, userId);
      await deleteDoc(postLikesDoc);

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
