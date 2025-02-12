import { useEffect } from "react";
import { Box, Flex, Grid, Skeleton, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";
import useGetUserLikedPosts from "../../hooks/useGetUserLikedPosts";
import useGetUserBookmarkedPosts from "../../hooks/useGetUsersBookmarkedPosts";
import usePostStore from "../../store/postStore"; // Import post store

const ProfilePosts = ({ activeTab }) => {
  const { posts: likedPosts, isLoading: isLoadingLiked } =
    useGetUserLikedPosts(activeTab);
  const { bookmarkedPosts, isLoading: isLoadingBookmarked } =
    useGetUserBookmarkedPosts(activeTab);
  const { setPosts, setBookmarkedPosts } = usePostStore(); // Get setters from store

  // Determine which posts to display based on active tab
  const isLoading =
    activeTab === "liked" ? isLoadingLiked : isLoadingBookmarked;
  const posts = activeTab === "liked" ? likedPosts : bookmarkedPosts;

  // ⬇️ Clear posts when switching tabs
  useEffect(() => {
    setPosts([]); // Clear liked posts
    setBookmarkedPosts([]); // Clear bookmarked posts
  }, [activeTab, setPosts, setBookmarkedPosts]);

  return (
    <Grid
      templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
      gap={2}
    >
      {isLoading &&
        [0, 1, 2, 3].map((_, idx) => (
          <VStack key={idx} alignItems={"flex-start"} gap={4}>
            <Skeleton w={"full"}>
              <Box h={"300px"}>Loading...</Box>
            </Skeleton>
          </VStack>
        ))}

      {!isLoading && posts.length > 0
        ? posts.map((post) => <ProfilePost post={post} key={post.id} />)
        : !isLoading && <NoPostsFound />}
    </Grid>
  );
};

export default ProfilePosts;

const NoPostsFound = () => (
  <Flex flexDir="column" textAlign={"center"} mx={"auto"} mt={10}>
    <Box fontSize={"2xl"}>No Posts Found 🤔</Box>
  </Flex>
);
