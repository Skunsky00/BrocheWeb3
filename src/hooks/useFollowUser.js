import { useState, useEffect } from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUpdateUserCollection from "./useUpdateUserCollection";
import { collection, getDocs, query, where } from "firebase/firestore";

const useFollowUser = (userId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const { updateUserCollection, isUpdating: isUpdatingUserCollection } =
    useUpdateUserCollection(authUser?.id);
  const showToast = useShowToast();

  const checkIfUserIsFollowed = async () => {
    try {
      const currentUid = authUser?.id;

      if (currentUid && userId) {
        const followingDocRef = doc(
          firestore,
          "following",
          currentUid,
          "user-following",
          userId
        );
        const snapshot = await getDoc(followingDocRef);
        const isFollowed = snapshot.exists();
        setIsFollowing(isFollowed);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  useEffect(() => {
    // Check if the user is followed when the component mounts
    if (authUser && userId) {
      checkIfUserIsFollowed();
    }
  }, [authUser, userId]);

  const followUser = async () => {
    setIsUpdating(true);
    try {
      await setDoc(
        doc(firestore, "following", authUser.id, "user-following", userId),
        {}
      );
      await setDoc(
        doc(firestore, "followers", userId, "user-followers", authUser.id),
        {}
      );
      await updateUserCollection();
      setIsFollowing(true);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const unfollowUser = async () => {
    setIsUpdating(true);
    try {
      await deleteDoc(
        doc(firestore, "following", authUser.id, "user-following", userId)
      );
      await deleteDoc(
        doc(firestore, "followers", userId, "user-followers", authUser.id)
      );
      await updateUserCollection();
      setIsFollowing(false);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const countFollowers = async (userId) => {
    try {
      const followersQuery = query(
        collection(firestore, "followers", userId, "user-followers")
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followersCount = followersSnapshot.size;
      return followersCount;
    } catch (error) {
      console.error("Error counting followers:", error);
      return 0; // Return 0 in case of an error
    }
  };

  const countFollowing = async (userId) => {
    try {
      const followingQuery = query(
        collection(firestore, "following", userId, "user-following")
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingCount = followingSnapshot.size;
      return followingCount;
    } catch (error) {
      console.error("Error counting following:", error);
      return 0; // Return 0 in case of an error
    }
  };

  return {
    followUser,
    unfollowUser,
    isFollowing,
    isUpdating,
    countFollowers,
    countFollowing,
  };
};

export default useFollowUser;
