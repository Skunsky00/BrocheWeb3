import { Box, Flex, Text } from "@chakra-ui/react";
import { BsBookmark, BsSuitHeart } from "react-icons/bs";
import { useState } from "react";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tab) => {
    if (activeTab !== tab) {
      console.log("Switching to Tab:", tab);
      setActiveTab(tab);
    }
  };

  return (
    <Flex
      w={"full"}
      justifyContent={"center"}
      gap={{ base: 4, sm: 10 }}
      textTransform={"uppercase"}
      fontWeight={"bold"}
    >
      <Flex
        onClick={() => handleTabClick("liked")}
        borderTop={activeTab === "liked" ? "2px solid white" : "none"}
        alignItems={"center"}
        p="3"
        gap={1}
        cursor={"pointer"}
      >
        <Box fontSize={20}>
          <BsSuitHeart />
        </Box>
        <Text fontSize={12} display={{ base: "none", sm: "block" }}>
          Liked
        </Text>
      </Flex>

      <Flex
        onClick={() => handleTabClick("bookmarked")}
        borderTop={activeTab === "bookmarked" ? "2px solid white" : "none"}
        alignItems={"center"}
        p="3"
        gap={1}
        cursor={"pointer"}
      >
        <Box fontSize={20}>
          <BsBookmark />
        </Box>
        <Text fontSize={12} display={{ base: "none", sm: "block" }}>
          Saved
        </Text>
      </Flex>
    </Flex>
  );
};

export default ProfileTabs;
