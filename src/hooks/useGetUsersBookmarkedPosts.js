import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetUserBookmarkedPosts = (activeTab) => {
  const [isLoading, setIsLoading] = useState(false);
  const { bookmarkedPosts, setBookmarkedPosts } = usePostStore();
  const showToast = useShowToast();
  const userProfile = useUserProfileStore((state) => state.userProfile);

  useEffect(() => {
    if (activeTab !== "bookmarked" || !userProfile) {
      setBookmarkedPosts([]); // Clear posts when switching tabs
      return;
    }

    const getBookmarkedPosts = async () => {
      setIsLoading(true);
      setBookmarkedPosts([]);

      try {
        const bookmarksQuery = query(
          collection(firestore, `users/${userProfile.id}/user-bookmarks`)
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);

        const bookmarkedPostIds = bookmarksSnapshot.docs.map((doc) => doc.id);
        console.log("Bookmarked Post IDs:", bookmarkedPostIds);

        if (bookmarkedPostIds.length === 0) {
          console.log("No bookmarked posts found.");
          setIsLoading(false);
          return;
        }

        const postsQuery = query(
          collection(firestore, "posts"),
          where("id", "in", bookmarkedPostIds)
        );

        const postsSnapshot = await getDocs(postsQuery);
        const fetchedPosts = postsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        fetchedPosts.sort((a, b) => b.timestamp - a.timestamp);
        setBookmarkedPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
        showToast("Error", error.message, "error");
        setBookmarkedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getBookmarkedPosts();
  }, [activeTab, setBookmarkedPosts, userProfile, showToast]);

  return { isLoading, bookmarkedPosts };
};

export default useGetUserBookmarkedPosts;
