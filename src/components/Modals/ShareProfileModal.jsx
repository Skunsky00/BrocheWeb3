import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { ShareLogo } from "../../Assets/constants"; // Assuming you have a Share icon

const ShareProfileModal = ({ isOpen, onClose, username }) => {
  const shareLink = `${window.location.origin}/${username}`; // Generate profile link
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent bg={"black"} border={"1px solid gray"} maxW={"400px"}>
        <ModalHeader>Share Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex direction="column" alignItems="center" gap={3}>
            <Text fontSize="sm">Tap the button to copy the link:</Text>
            <Button
              onClick={copyToClipboard}
              borderRadius="full"
              w="50px"
              h="50px"
              bg={copied ? "blue.500" : "gray.700"}
              _hover={{ bg: "gray.600" }}
            >
              <ShareLogo />
            </Button>
            {copied && (
              <Text fontSize="sm" color="green.400">
                Link Copied!
              </Text>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareProfileModal;
