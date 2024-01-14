import {
  Avatar,
  Box,
  Button,
  Flex,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowUser from "../../hooks/useFollowUser";
import { timeAgo } from "../../utils/timeAgo";

const PostHeader = ({ post, creatorProfile }) => {
  const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(
    post.ownerUid
  );
  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      w={"full"}
      my={2}
    >
      <Box cursor={"pointer"}>
        <Button
          size={"xs"}
          bg={"transparent"}
          fontSize={12}
          color={"white"}
          fontWeight={"bold"}
          _hover={{
            color: "blue.500",
          }}
          transition={"0.2s ease-in-out"}
          onClick={handleFollowUser}
          isLoading={isUpdating}
        >
          {post.location}
        </Button>
      </Box>

      <Flex alignItems={"center"} gap={2}>
        <Flex fontSize={12} fontWeight={"bold"} gap="2">
          <Box color={"gray.500"}>{timeAgo(post.timestamp.toMillis())} • </Box>
          {creatorProfile ? (
            <Link to={`/${creatorProfile.username}`}>
              {creatorProfile.username}
            </Link>
          ) : (
            <Skeleton w={"100px"} h={"10px"} />
          )}
        </Flex>

        {creatorProfile ? (
          <Link to={`/${creatorProfile.username}`}>
            <Avatar
              src={creatorProfile.profileImageUrl}
              alt="user profile pic"
              size={"sm"}
            />
          </Link>
        ) : (
          <SkeletonCircle size="10" />
        )}
      </Flex>
    </Flex>
  );
};

export default PostHeader;
