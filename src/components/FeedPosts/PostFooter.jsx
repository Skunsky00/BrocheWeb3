import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  CommentLogo,
  NotificationsLogo,
  UnlikeLogo,
  ShareLogo,
  BookmarkLogo,
  BookmarkedLogo,
} from "../../Assets/constants";
import { useRef, useState } from "react";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/authStore";
import useLikePost from "../../hooks/useLikePost";
import useBookmarkPost from "../../hooks/useBookmarkPost";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";
import ShareModal from "../Modals/ShareModal"; // Import ShareModal

const PostFooter = ({ post, isProfilePage, creatorProfile }) => {
  const { isCommenting, handlePostComment } = usePostComment();
  const [comment, setComment] = useState("");
  const authUser = useAuthStore((state) => state.user);
  const commentRef = useRef(null);
  const { didLike, likePost, unlikePost, isUpdating } = useLikePost(post.id);
  const {
    didBookmark,
    bookmarkPost,
    unbookmarkPost,
    isUpdating: isBookmarkUpdating,
  } = useBookmarkPost(post.id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isShareOpen,
    onOpen: onShareOpen,
    onClose: onShareClose,
  } = useDisclosure(); // Manage ShareModal state

  const handleLikeClick = () => {
    didLike ? unlikePost() : likePost();
  };

  const handleBookmarkToggle = () => {
    didBookmark ? unbookmarkPost() : bookmarkPost();
  };

  const handleSubmitComment = async () => {
    await handlePostComment(post.id, comment);
    setComment("");
  };

  return (
    <Box mb={10}>
      {/* Like, Comment, and Share Row */}
      <Flex
        alignItems={"center"}
        justifyContent="space-between"
        w={"full"}
        pt={0}
        mb={2}
        mt={4}
      >
        {/* Left Group: Like, Comment, Share */}
        <Flex alignItems="center" gap={4}>
          <Box onClick={handleLikeClick} cursor={"pointer"} fontSize={18}>
            {!didLike ? <NotificationsLogo /> : <UnlikeLogo />}
          </Box>

          <Box
            cursor={"pointer"}
            fontSize={18}
            onClick={() => commentRef.current.focus()}
          >
            <CommentLogo />
          </Box>

          <Box cursor={"pointer"} fontSize={18} onClick={onShareOpen}>
            <ShareLogo />
          </Box>
        </Flex>

        {/* Right: Bookmark Button */}
        <Box cursor="pointer" fontSize={18} onClick={handleBookmarkToggle}>
          {didBookmark ? <BookmarkedLogo /> : <BookmarkLogo />}
        </Box>
      </Flex>

      {/* Post Likes and Caption */}
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        w={"full"}
        my={2}
      >
        <Text fontWeight={600} fontSize={"sm"}>
          {post.likes ?? 0} likes
        </Text>
        <Text fontWeight={600} fontSize={"sm"}>
          {post.label}
        </Text>
      </Flex>

      {isProfilePage && (
        <Text fontSize="12" color={"gray"}>
          Posted {timeAgo(post.timestamp.toMillis())}
        </Text>
      )}

      {!isProfilePage && (
        <>
          <Text fontSize="sm" fontWeight={700}>
            {creatorProfile?.username}{" "}
            <Text as="span" fontWeight={400}>
              {post.caption}
            </Text>
          </Text>
          {post.comments > 0 && (
            <Text
              fontSize="sm"
              color={"gray"}
              cursor={"pointer"}
              onClick={onOpen}
            >
              View all {post.comments} comments
            </Text>
          )}
          {isOpen && (
            <CommentsModal isOpen={isOpen} onClose={onClose} post={post} />
          )}
        </>
      )}

      {authUser && (
        <Flex
          alignItems={"center"}
          gap={2}
          justifyContent={"space-between"}
          w={"full"}
        >
          <InputGroup>
            <Input
              variant={"flushed"}
              placeholder={"Add a comment..."}
              fontSize={14}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              ref={commentRef}
            />
            <InputRightElement>
              <Button
                fontSize={14}
                color={"blue.500"}
                fontWeight={600}
                cursor={"pointer"}
                _hover={{ color: "white" }}
                bg={"transparent"}
                onClick={handleSubmitComment}
                isLoading={isCommenting}
              >
                Post
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>
      )}

      {/* Share Modal */}
      <ShareModal isOpen={isShareOpen} onClose={onShareClose} post={post} />
    </Box>
  );
};

export default PostFooter;
