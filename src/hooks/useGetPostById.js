import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetPostById = (postId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(null);
  const showToast = useShowToast();

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      setPost(null);
      try {
        const postRef = await getDoc(doc(firestore, "posts", postId));
        if (postRef.exists()) {
          const postData = postRef.data();
          const ownerRef = doc(firestore, "users", postData.ownerUid); // Assume users collection
          const ownerSnap = await getDoc(ownerRef);
          const username = ownerSnap.exists()
            ? ownerSnap.data().username
            : null; // Get username if user exists

          setPost({ id: postRef.id, ...postData, username }); // Include username
        } else {
          showToast("Error", "Post not found", "error");
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    getPost();
  }, [showToast, postId]);

  return { isLoading, post };
};

export default useGetPostById;
