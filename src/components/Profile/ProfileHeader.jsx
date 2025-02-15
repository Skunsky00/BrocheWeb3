import {
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Link,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import EditProfile from "./EditProfile";
import useFollowUser from "../../hooks/useFollowUser";
import { ShareLogo } from "../../Assets/constants"; // your share icon
import ShareProfileModal from "../Modals/ShareProfileModal"; // import the modal
import { LinkLogo } from "../../Assets/constants";

const ProfileHeader = () => {
  const { userProfile } = useUserProfileStore();
  const authUser = useAuthStore((state) => state.user);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isShareOpen,
    onOpen: onShareOpen,
    onClose: onShareClose,
  } = useDisclosure(); // state for share modal

  const {
    isFollowing,
    isUpdating,
    followUser,
    unfollowUser,
    countFollowers,
    countFollowing,
  } = useFollowUser(userProfile?.id);

  const isVisitingOwnProfile =
    authUser && authUser.username === userProfile?.username;
  const isVisitingAnotherProfile =
    authUser && authUser.username !== userProfile?.username;

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (userProfile) {
        const followers = await countFollowers(userProfile.id);
        const following = await countFollowing(userProfile.id);
        setFollowersCount(followers);
        setFollowingCount(following);
      }
    };

    fetchStats();
  }, [userProfile, countFollowers, countFollowing]);

  return (
    <Flex
      gap={{ base: 4, sm: 10 }}
      py={10}
      direction={{ base: "column", sm: "row" }}
    >
      <AvatarGroup
        size={{ base: "xl", md: "2xl" }}
        justifySelf="center"
        alignSelf="flex-start"
        mx="auto"
      >
        <Avatar
          name="Jacob Johnson"
          src={userProfile.profileImageUrl}
          alt="Jacob Johnson logo"
        />
      </AvatarGroup>

      <VStack alignItems="start" gap={2} mx="auto" flex={1}>
        <Flex
          gap={4}
          direction={{ base: "column", sm: "row" }}
          justifyContent={{ base: "center", sm: "flex-start" }}
          alignItems="center"
          w="full"
        >
          <Text fontSize={{ base: "sm", md: "lg" }}>
            {userProfile.username}
          </Text>
          {/* Action Buttons */}
          <Flex gap={4} alignItems="center" justifyContent="center">
            {isVisitingOwnProfile && (
              <Button
                bg="white"
                color="black"
                _hover={{ bg: "whiteAlpha.800" }}
                size={{ base: "xs", md: "sm" }}
                onClick={onEditOpen}
              >
                Edit Profile
              </Button>
            )}
            {isVisitingAnotherProfile && (
              <Button
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                size={{ base: "xs", md: "sm" }}
                onClick={isFollowing ? unfollowUser : followUser}
                isLoading={isUpdating}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            {/* Share Profile Button */}
            <Button
              variant="outline"
              borderColor="cyan.400"
              color="cyan.400"
              _hover={{ bg: "cyan.50", color: "cyan.500" }}
              size={{ base: "xs", md: "sm" }}
              onClick={onShareOpen}
            >
              <ShareLogo />
              <Text ml={1}>Share</Text>
            </Button>
          </Flex>
        </Flex>

        <Flex alignItems="center" gap={{ base: 2, sm: 4 }}>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            <Text as="span" fontWeight="bold" mr={1}>
              {followersCount}
            </Text>
            Followers
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            <Text as="span" fontWeight="bold" mr={1}>
              {followingCount}
            </Text>
            Following
          </Text>
        </Flex>
        <Flex alignItems="center" gap={4}>
          <Text fontSize="sm" fontWeight="bold">
            {userProfile.fullname}
          </Text>
        </Flex>
        <Text fontSize="sm">{userProfile.bio}</Text>
        {userProfile.link && (
          <Link
            href={
              userProfile.link.startsWith("http")
                ? userProfile.link
                : `https://${userProfile.link}`
            }
            color="blue.500"
            isExternal
            fontSize="sm"
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ textDecoration: "underline", color: "blue.600" }}
          >
            <LinkLogo />
            {userProfile.link}
          </Link>
        )}
      </VStack>

      {/* Modals */}
      {isEditOpen && <EditProfile isOpen={isEditOpen} onClose={onEditClose} />}
      {isShareOpen && userProfile && (
        <ShareProfileModal
          isOpen={isShareOpen}
          onClose={onShareClose}
          userProfile={userProfile}
        />
      )}
    </Flex>
  );
};

export default ProfileHeader;
