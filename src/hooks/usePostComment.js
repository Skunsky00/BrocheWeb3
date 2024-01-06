// usePostComment.js
import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import {
  Timestamp,
  collection,
  doc,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import usePostStore from "../store/postStore";
import useCommentStore from "../store/useCommentStore";

const usePostComment = () => {
  const [isCommenting, setIsCommenting] = useState(false);
  const showToast = useShowToast();
  const authUser = useAuthStore((state) => state.user);
  const setComments = useCommentStore((state) => state.addComment);
  const setPosts = usePostStore((state) => state.setPosts);

  const handlePostComment = async (postId, commentText) => {
    if (isCommenting) return;
    if (!authUser) {
      showToast("Error", "You must be logged in to comment", "error");
      return;
    }

    setIsCommenting(true);

    const newComment = {
      commentOwnerUid: authUser.id,
      timestamp: Timestamp.now(),
      postId,
      commentText,
    };

    try {
      // Fetch the post from the Zustand store
      const post = usePostStore
        .getState()
        .posts.find((post) => post.id === postId);

      console.log("Post before check:", post);

      // Check if post and postOwnerUid exist
      if (post && post.ownerUid) {
        newComment.postOwnerUid = post.ownerUid;

        // Add the comment directly to the "post-comments" subcollection in Firestore
        const postCommentsCollection = collection(
          firestore,
          `posts/${postId}/post-comments`
        );

        const addedCommentRef = await addDoc(
          postCommentsCollection,
          newComment
        );
        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
          comments: increment(1),
        });

        // Update the local state using CommentStore
        setComments(postId, {
          id: addedCommentRef.id,
          ...newComment,
        });
      } else {
        console.log("Invalid post data:", post);
        showToast("Error", "Invalid post data", "error");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsCommenting(false);
    }
  };

  return { isCommenting, handlePostComment };
};

export default usePostComment;
