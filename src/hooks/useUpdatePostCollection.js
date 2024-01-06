// useUpdatePostCollection.js
import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useUpdatePostCollection = (postId) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePostCollection = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(firestore, "posts", postId), {
        didLike: false,
      });
    } catch (error) {
      console.error("Error updating post collection:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updatePostCollection, isUpdating };
};

export default useUpdatePostCollection;
