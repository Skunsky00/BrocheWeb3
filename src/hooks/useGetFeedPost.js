import { useEffect, useState, useRef } from "react";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const PAGE_SIZE = 8;

const useGetFeedPosts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const { feedPosts, setFeedPosts } = usePostStore();
  const showToast = useShowToast();
  const didLoadOnce = useRef(false);
  const loadingRef = useRef(false); // Prevents multiple calls

  const loadPosts = async () => {
    if (!hasMore || isLoading || loadingRef.current) return; // Prevent duplicate fetches

    setIsLoading(true);
    loadingRef.current = true; // Lock fetch call
    try {
      let q;
      if (lastDoc) {
        q = query(
          collection(firestore, "posts"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(firestore, "posts"),
          orderBy("timestamp", "desc"),
          limit(PAGE_SIZE)
        );
      }

      const querySnapshot = await getDocs(q);
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out duplicates
      setFeedPosts((prevFeedPosts) => {
        const uniquePosts = [...prevFeedPosts, ...newPosts].filter(
          (post, index, self) =>
            index === self.findIndex((p) => p.id === post.id)
        );
        return uniquePosts;
      });

      // Update cursor (last fetched document)
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // No more posts available
      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
      loadingRef.current = false; // Unlock fetch call
    }
  };

  useEffect(() => {
    if (didLoadOnce.current) return;
    didLoadOnce.current = true;

    setFeedPosts([]); // Reset posts before fetching
    setLastDoc(null);
    setHasMore(true);

    setTimeout(() => {
      loadPosts();
    }, 0);
  }, []);

  return { isLoading, posts: feedPosts, hasMore, loadPosts };
};

export default useGetFeedPosts;
