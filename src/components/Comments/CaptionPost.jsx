import { Avatar, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const Caption = ({ post }) => {
  const { userProfile, isLoading } = useGetUserProfileById(post.ownerUid);

  if (isLoading) return <Text>Loading caption...</Text>;
  if (!userProfile) return <Text>Error loading caption</Text>;

  return (
    <Flex gap={4}>
      <Link to={`/${userProfile.username}`}>
        <Avatar src={userProfile.profileImageUrl} size={"sm"} />
      </Link>
      <Flex direction={"column"}>
        <Flex gap={2} alignItems={"flex-start"}>
          <Link to={`/${userProfile.username}`}>
            <Text fontWeight={"bold"} fontSize={12}>
              {userProfile.username}
            </Text>
          </Link>
          <Text fontSize={14}>{post.caption}</Text>
        </Flex>
        <Text fontSize={12} color={"gray"}>
          {timeAgo(post.timestamp.toMillis())}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Caption;
