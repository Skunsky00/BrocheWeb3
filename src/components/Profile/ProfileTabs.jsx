import { Box, Flex, Text } from "@chakra-ui/react";
import { BsBookmark, BsSuitHeart } from "react-icons/bs";
import { FaMapPin } from "react-icons/fa6";

const ProfileTabs = () => {
  return (
    <Flex
      w={"full"}
      justifyContent={"center"}
      gap={{ base: 4, sm: 10 }}
      textTransform={"uppercase"}
      fontWeight={"bold"}
    >
      <Flex
        borderTop={"1px solid white"}
        alignItems={"center"}
        p="3"
        gap={1}
        cursor={"pointer"}
      >
        <Box fontSize={20}>
          <BsSuitHeart />
        </Box>
        <Text fontSize={12} display={{ base: "none", sm: "block" }}>
          Posts
        </Text>
      </Flex>

      <Flex alignItems={"center"} p="3" gap={1} cursor={"pointer"}>
        <Box fontSize={20}>
          <BsBookmark />
        </Box>
        <Text fontSize={12} display={{ base: "none", sm: "block" }}>
          Saved
        </Text>
      </Flex>

      <Flex alignItems={"center"} p="3" gap={1} cursor={"pointer"}>
        <Box fontSize={20}>
          <FaMapPin fontWeight={"bold"} />
        </Box>
        <Text fontSize={12} display={{ base: "none", sm: "block" }}>
          Maps
        </Text>
      </Flex>
    </Flex>
  );
};

export default ProfileTabs;
