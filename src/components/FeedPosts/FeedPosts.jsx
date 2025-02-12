import { useRef, useEffect } from "react";
import useGetFeedPosts from "../../hooks/useGetFeedPost"; // Ensure correct import
import FeedPost from "./FeedPost";
import {
  Box,
  Container,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from "@chakra-ui/react";

const FeedPosts = () => {
  const { isLoading, posts, hasMore, loadPosts } = useGetFeedPosts();
  const observerRef = useRef(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, isLoading, loadPosts]);

  return (
    <Container maxW={"container.sm"} py={10} px={2}>
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}

      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap="2">
              <SkeletonCircle size="10" />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height="10px" w={"200px"} />
                <Skeleton height="10px" w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}

      {!isLoading && posts.length === 0 && (
        <Text fontSize={"md"} color={"red.400"}>
          No posts available. Try following more people!
        </Text>
      )}

      {hasMore && <div ref={observerRef} style={{ height: "20px" }} />}
    </Container>
  );
};

export default FeedPosts;
