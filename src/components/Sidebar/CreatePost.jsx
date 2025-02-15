import React, { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Image,
  Textarea,
  Input,
  CloseButton,
  useDisclosure,
  Tooltip,
  Box,
} from "@chakra-ui/react";
import { BsFillImageFill } from "react-icons/bs";
import LocationInput from "../LocationInput/LocationInput";

// Firebase imports
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

// Custom hooks and stores
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import { CreatePostLogo } from "../../Assets/constants";

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Track which view is active: "media" or "details"
  const [currentStep, setCurrentStep] = useState("media");
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [label, setLabel] = useState("");
  const fileInputRef = useRef(null);

  // Get post creation function and loading state from our custom hook
  const { isLoading, handleCreatePost } = useCreatePost();

  // Handle file selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset modal state on close
  const handleModalClose = () => {
    setCurrentStep("media");
    setSelectedFile(null);
    setCaption("");
    setLocation("");
    setLabel("");
    onClose();
  };

  const onPost = async () => {
    try {
      await handleCreatePost(selectedFile, caption, location, label);
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Tooltip
        hasArrow
        label={"Create"}
        placement="right"
        ml={1}
        openDelay={500}
        display={{ base: "block", md: "none" }}
      >
        <Flex
          alignItems={"center"}
          gap={4}
          _hover={{ bg: "whiteAlpha.400" }}
          borderRadius={6}
          p={2}
          w={{ base: 10, md: "full" }}
          justifyContent={{ base: "center", md: "flex-start" }}
          onClick={onOpen}
        >
          <CreatePostLogo />
          <Box display={{ base: "none", md: "block" }}>Create</Box>
        </Flex>
      </Tooltip>
      <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="black" border="1px solid gray">
          <ModalHeader>
            {currentStep === "media" ? "Select Media" : "Add Post Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {currentStep === "media" ? (
              <Flex direction="column" align="center">
                <input
                  type="file"
                  accept="image/*, video/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleMediaChange}
                />
                <BsFillImageFill
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    marginTop: "15px",
                    cursor: "pointer",
                  }}
                  size={30}
                />
                {selectedFile && (
                  <Flex mt={5} position="relative">
                    <Image
                      src={selectedFile}
                      alt="Selected media"
                      boxSize="200px"
                    />
                    <CloseButton
                      position="absolute"
                      top={0}
                      right={0}
                      onClick={() => setSelectedFile(null)}
                    />
                  </Flex>
                )}
              </Flex>
            ) : (
              <>
                <Textarea
                  placeholder="Post caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  mb={3}
                />
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter post location..."
                />
                <Textarea
                  placeholder="Post label..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {currentStep === "media" ? (
              <Button
                mr={3}
                onClick={() => setCurrentStep("details")}
                disabled={!selectedFile}
              >
                Next
              </Button>
            ) : (
              <Button mr={3} onClick={onPost} isLoading={isLoading}>
                Post
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;

function useCreatePost() {
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const createPost = usePostStore((state) => state.createPost);
  const userProfile = useUserProfileStore((state) => state.userProfile);

  const handleCreatePost = async (selectedFile, caption, location, label) => {
    if (isLoading || !authUser) return;
    if (!selectedFile) throw new Error("Please select an image");

    setIsLoading(true);

    try {
      const postCollectionRef = collection(firestore, "posts");

      // Create a new post document without ID
      const newPost = {
        caption,
        location,
        label,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
        ownerUid: authUser.id,
      };

      // Add the new post document to the collection and get the auto-generated ID
      const postDocRef = await addDoc(postCollectionRef, newPost);
      const postId = postDocRef.id;

      // Adjust storage paths based on the file type
      const mediaPath = selectedFile.startsWith("data:image")
        ? "images"
        : "videos";
      const mediaRef = ref(storage, `${mediaPath}/${postId}`);

      // Update the post document with the generated ID
      await updateDoc(postDocRef, { id: postId });

      // Update the user document with the new post ID
      const userDocRef = doc(firestore, "users", authUser.id);
      await updateDoc(userDocRef, { posts: arrayUnion(postId) });

      // Upload media to storage
      await uploadString(mediaRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(mediaRef);

      // Update the post document with media URL
      if (selectedFile.startsWith("data:image")) {
        newPost.imageUrl = downloadURL;
      } else {
        newPost.videoUrl = downloadURL;
      }

      const updateData = {};
      if (newPost.imageUrl !== undefined)
        updateData.imageUrl = newPost.imageUrl;
      if (newPost.videoUrl !== undefined)
        updateData.videoUrl = newPost.videoUrl;

      // Update the post document with media URL if available
      if (Object.keys(updateData).length > 0) {
        await updateDoc(postDocRef, updateData);
      }

      console.log("Download URL:", downloadURL);
      console.log("newPost:", newPost);

      if (userProfile?.id === authUser.id) {
        createPost({ ...newPost, id: postId });
      }

      showToast("Success", "Post created successfully", "success");
    } catch (error) {
      console.error("Firestore Error:", error);
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleCreatePost };
}
