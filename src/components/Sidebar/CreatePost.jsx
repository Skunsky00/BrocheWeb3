import {
  Box,
  Button,
  CloseButton,
  Flex,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { CreatePostLogo } from "../../Assets/constants";
import { BsFillImageFill } from "react-icons/bs";
import { useRef, useState } from "react";
import usePreviewImg from "../../hooks/usePreviewImg";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import usePreviewMedia from "../../hooks/usePreviewMedia";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [label, setLabel] = useState("");
  const imageRef = useRef(null);
  const { handleMediaChange, selectedFile, setSelectedFile } =
    usePreviewMedia();
  const showToast = useShowToast();
  const { isLoading, handleCreatePost } = useCreatePost();

  const handlePostCreation = async () => {
    try {
      await handleCreatePost(selectedFile, caption, location, label);
      onClose();
      setCaption("");
      setLocation("");
      setLabel("");
      setSelectedFile(null);
    } catch (error) {
      showToast("Error", error.message, "error");
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
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />

        <ModalContent bg={"black"} border={"1px solid gray"}>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Textarea
              placeholder="Post caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <Textarea
              placeholder="Post location."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Textarea
              placeholder="Post label."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <Input
              type="file"
              accept="image/*, video/*" // Allow both image and video files
              hidden
              ref={imageRef}
              onChange={handleMediaChange}
            />

            <BsFillImageFill
              onClick={() => imageRef.current.click()}
              style={{
                marginTop: "15px",
                marginLeft: "5px",
                cursor: "pointer",
              }}
              size={16}
            />
            {selectedFile && (
              <Flex
                mt={5}
                w={"full"}
                position={"relative"}
                justifyContent={"center"}
              >
                <Image src={selectedFile} alt="Selected img" />
                <CloseButton
                  position={"absolute"}
                  top={2}
                  right={2}
                  onClick={() => {
                    setSelectedFile(null);
                  }}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={handlePostCreation} isLoading={isLoading}>
              Post
            </Button>
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
  //const addPost = useUserProfileStore((state) => state.addPost);
  const userProfile = useUserProfileStore((state) => state.userProfile);
  // const { pathname } = useLocation();

  const handleCreatePost = async (selectedFile, caption, location, label) => {
    if (isLoading || !authUser) return;
    if (!selectedFile) throw new Error("Please select an image");

    setIsLoading(true);

    try {
      const postCollectionRef = collection(firestore, "posts");

      // Create a new post document without ID
      const newPost = {
        caption: caption,
        location: location,
        label: label,
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

      if (newPost.imageUrl !== undefined) {
        updateData.imageUrl = newPost.imageUrl;
      }

      if (newPost.videoUrl !== undefined) {
        updateData.videoUrl = newPost.videoUrl;
      }

      // Ensure that at least one of the fields is defined before updating the document
      if (Object.keys(updateData).length > 0) {
        await updateDoc(postDocRef, updateData);
      }

      // Log the download URL and newPost object
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
