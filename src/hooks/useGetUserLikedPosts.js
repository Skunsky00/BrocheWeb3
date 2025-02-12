import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetUserLikedPosts = (activeTab) => {
  const [isLoading, setIsLoading] = useState(false);
  const { posts, setPosts } = usePostStore();
  const showToast = useShowToast();
  const userProfile = useUserProfileStore((state) => state.userProfile);

  useEffect(() => {
    if (activeTab !== "liked" || !userProfile) {
      setPosts([]); // Clear posts when switching tabs
      return;
    }

    const getLikedPosts = async () => {
      setIsLoading(true);
      setPosts([]);

      try {
        const likesQuery = query(
          collection(firestore, `users/${userProfile.id}/user-likes`)
        );
        const likesSnapshot = await getDocs(likesQuery);

        const likedPostIds = likesSnapshot.docs
          .map((doc) => doc.id)
          .filter((id) => id);
        console.log("Liked Post IDs Array:", likedPostIds);

        if (likedPostIds.length === 0) {
          console.log("No liked posts found.");
          setIsLoading(false);
          return;
        }

        const postsQuery = query(
          collection(firestore, "posts"),
          where("id", "in", likedPostIds)
        );

        const postsSnapshot = await getDocs(postsQuery);
        const likedPosts = postsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        likedPosts.sort((a, b) => b.timestamp - a.timestamp);
        setPosts(likedPosts);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getLikedPosts();
  }, [activeTab, setPosts, userProfile, showToast]);

  return { isLoading, posts };
};

export default useGetUserLikedPosts;
