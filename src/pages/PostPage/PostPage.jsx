import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
  Avatar,
  Divider,
  VStack,
} from "@chakra-ui/react";
import ReactPlayer from "react-player";
import Comment from "../../components/Comments/Comment"; // Import your Comment component
import CaptionPost from "../../components/Comments/CaptionPost";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null); // To hold user data
  const [comments, setComments] = useState([]); // To hold comments
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      setIsLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost(postData);

          // Fetch user data based on ownerUid
          const userRef = doc(firestore, "users", postData.ownerUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data());
          } else {
            console.error("User not found");
          }

          // Fetch comments for the post
          const commentsCollection = collection(
            firestore,
            `posts/${postId}/post-comments`
          );
          const commentsSnapshot = await getDocs(commentsCollection);
          const commentsData = commentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComments(commentsData);

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
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="blackAlpha.900">
        <ModalCloseButton color="white" />
        <ModalBody
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Flex width="100%" height="100vh" flexDirection={["column", "row"]}>
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

            {/* User Info and Caption Section */}
            <Box
              flex="1"
              p={5}
              color="white"
              overflowY="auto"
              maxW="25%"
              textAlign="left"
              display={["none", "block"]}
              ml={4}
            >
              {user && (
                <Flex
                  alignItems="center"
                  mb={2}
                  justifyContent="space-between"
                  width="100%"
                >
                  <Flex alignItems="center">
                    <Avatar
                      src={user.profileImageUrl}
                      size="sm"
                      name={user.username}
                    />
                    <Text fontWeight="bold" ml={2}>
                      {user.username}
                    </Text>
                  </Flex>
                  {post.location && (
                    <Text fontSize="sm" color="gray.400" ml="auto">
                      {post.location}
                    </Text>
                  )}
                </Flex>
              )}
              <Divider my={2} bg="gray.500" />

              {/* Comments Section */}
              <VStack
                alignItems="start"
                spacing={2}
                mt={4}
                maxH="300px"
                overflowY="auto"
              >
                <CaptionPost post={post} />{" "}
                {/* Display caption above comments */}
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} />
                  ))
                ) : (
                  <Text>No comments yet.</Text>
                )}
              </VStack>
            </Box>

            {/* Caption for smaller screens */}
            <Box
              display={["block", "none"]}
              p={5}
              color="white"
              overflowY="auto"
              textAlign="left"
            >
              {user && (
                <Flex alignItems="center" mb={2}>
                  <Avatar
                    src={user.profileImageUrl}
                    size="sm"
                    name={user.username}
                  />
                  <Text fontWeight="bold" ml={2}>
                    {user.username}
                  </Text>
                </Flex>
              )}
              <Divider my={2} bg="gray.500" />
              <Text fontSize="lg">{post.caption}</Text>

              {/* Comments Section */}
              <VStack
                alignItems="start"
                spacing={2}
                mt={4}
                maxH="300px"
                overflowY="auto"
              >
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} />
                  ))
                ) : (
                  <Text>No comments yet.</Text>
                )}
              </VStack>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PostPage;
