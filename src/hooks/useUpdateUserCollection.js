// useUpdateUserCollection.js
import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useUpdateUserCollection = (currentUid) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateUserCollection = async () => {
    setIsUpdating(true);
    try {
      // Update the user collection in the database with isFollowed as a placeholder (false)
      await updateDoc(doc(firestore, "users", currentUid), {
        isFollowed: false,
      });
    } catch (error) {
      console.error("Error updating user collection:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateUserCollection, isUpdating };
};

export default useUpdateUserCollection;
