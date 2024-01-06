import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSuggestedUsers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  useEffect(() => {
    const getSuggestedUsers = async () => {
      setIsLoading(true);
      try {
        if (!authUser) return;

        // Assuming your following information is stored in a 'following' collection
        const followingRef = collection(firestore, "following");

        // Get the users the current user is following
        const followingQuery = query(
          followingRef,
          where("followerId", "==", authUser.id)
        );
        const followingSnapshot = await getDocs(followingQuery);
        const followingList = followingSnapshot.docs.map(
          (doc) => doc.data().followingId
        );

        // Get suggested users excluding the current user and those they are following
        const usersRef = collection(firestore, "users");
        const q = query(
          usersRef,
          where("id", "not-in", [authUser.id, ...followingList]),
          orderBy("id"),
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const users = [];

        querySnapshot.forEach((doc) => {
          users.push({ ...doc.data(), id: doc.id });
        });

        setSuggestedUsers(users);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    getSuggestedUsers();
  }, [authUser, showToast]);

  return { isLoading, suggestedUsers };
};

export default useGetSuggestedUsers;
