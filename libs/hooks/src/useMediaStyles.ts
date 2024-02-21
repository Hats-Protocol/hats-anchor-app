import { useBreakpointValue } from '@chakra-ui/react';

// hooks
function useMediaStyles() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return {
    isMobile,
  };
}

export default useMediaStyles;
