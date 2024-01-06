import { Avatar, Box, Button, Flex, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const SuggestedUser = ({ user }) => {
  const { isFollowing, isUpdating, followUser, unfollowUser, countFollowers } =
    useFollowUser(user?.id);
  const authUser = useAuthStore((state) => state.user);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchFollowersCount = async () => {
      const followers = await countFollowers(user?.id);
      setFollowersCount(followers);
    };

    fetchFollowersCount();
  }, [user?.id]);

  const onFollowUser = async () => {
    if (isFollowing) {
      await unfollowUser();
      setFollowersCount((prevCount) => prevCount - 1);
    } else {
      await followUser();
      setFollowersCount((prevCount) => prevCount + 1);
    }
  };

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
      <Flex alignItems={"center"} gap={2}>
        <Link to={`/${user?.username}`}>
          <Avatar src={user?.profileImageUrl} size={"md"} />
        </Link>
        <VStack spacing={2} alignItems={"flex-start"}>
          <Link to={`/${user?.username}`}>
            <Box fontSize={12} fontWeight={"bold"}>
              {user?.fullname}
            </Box>
          </Link>
          <Box fontSize={11} color={"gray.500"}>
            {followersCount} followers
          </Box>
        </VStack>
      </Flex>
      {authUser.id !== user?.id && (
        <Button
          fontSize={13}
          bg={"transparent"}
          p={0}
          h={"max-content"}
          fontWeight={"medium"}
          color={"blue.400"}
          cursor={"pointer"}
          _hover={{ color: "white" }}
          onClick={onFollowUser}
          isLoading={isUpdating}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </Flex>
  );
};

export default SuggestedUser;
