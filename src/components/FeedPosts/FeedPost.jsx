import { Box, Image } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import ReactPlayer from "react-player";

const FeedPost = ({ post }) => {
  const { userProfile } = useGetUserProfileById(post.ownerUid);

  return (
    <>
      <PostHeader post={post} creatorProfile={userProfile} />
      <Box my={2} borderRadius={4} overflow={"hidden"}>
        {post.videoUrl ? (
          <ReactPlayer url={post.videoUrl} width="100%" height={600} controls />
        ) : (
          <Image src={post.imageUrl} alt="FEED POST IMG" />
        )}
      </Box>
      <PostFooter post={post} creatorProfile={userProfile} />
    </>
  );
};

export default FeedPost;
