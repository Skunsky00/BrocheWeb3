import React from "react";
import { Box, keyframes } from "@chakra-ui/react";
import { BrocheSplashScreenLogo } from "../../Assets/constants";

// Define a fade-out animation
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const SplashScreen = ({ isVisible }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="black"
      zIndex="9999"
      opacity={isVisible ? 1 : 0}
      pointerEvents={isVisible ? "auto" : "none"} // Prevent interaction after hiding
      animation={!isVisible ? `${fadeOut} 1s ease-in-out forwards` : "none"} // 1s fade-out
    >
      <BrocheSplashScreenLogo />
    </Box>
  );
};

export default SplashScreen;
