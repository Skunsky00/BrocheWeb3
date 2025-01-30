import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Flex,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import ReactPlayer from "react-player";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      setIsLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPost(postSnap.data());
          onOpen(); // Open modal when post is loaded
        } else {
          console.error("Post not found");
          navigate("/"); // Redirect if post doesn't exist
        }
      } catch (error) {
        console.error("Error fetching post:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate, onOpen]);

  if (isLoading) return <Text>Loading post...</Text>;
  if (!post) return <Text>Post not found</Text>;

  return (
    <Modal isOpen={isOpen} onClose={() => navigate("/")} size="full">
      <ModalOverlay />
      <ModalContent bg="blackAlpha.900">
        <ModalCloseButton color="white" />
        <ModalBody
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Flex
            width="100%"
            height="100vh"
            flexDirection={["column", "row"]} // Stack vertically on small screens, horizontally on large
          >
            {/* Video/Image Section */}
            <Box
              flex="3"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {post.videoUrl ? (
                <ReactPlayer
                  url={post.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <Image
                  src={post.imageUrl}
                  alt="Post Image"
                  maxH="100%"
                  objectFit="contain"
                />
              )}
            </Box>

            {/* Caption Section */}
            <Box
              flex="1"
              p={5}
              color="white"
              overflowY="auto"
              maxW="25%"
              textAlign="left"
              display={["none", "block"]} // Hide on small screens
              ml={4} // Add margin on larger screens
            >
              <Text fontSize="lg">{post.caption}</Text>
            </Box>

            {/* Caption for smaller screens */}
            <Box
              display={["block", "none"]} // Show on small screens only
              p={5}
              color="white"
              overflowY="auto"
              textAlign="left"
            >
              <Text fontSize="lg">{post.caption}</Text>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PostPage;
