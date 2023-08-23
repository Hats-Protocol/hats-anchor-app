import { Box, Flex } from '@chakra-ui/react';

import useMulticallCallData from '@/hooks/useMulticallCallData';

const BottomMenu = ({ chainId, treeId }: BottomMenuProps) => {
  const { onSubmit, multicallData } = useMulticallCallData({ chainId, treeId });

  console.log('multicallData', multicallData);

  return (
    <Box
      w='100%'
      position='absolute'
      bottom={0}
      zIndex={14}
      bg='whiteAlpha.900'
    >
      <Flex
        justify='space-between'
        p={4}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        <Box
          as='button'
          color='gray.500'
          fontWeight='bold'
          fontSize='sm'
          onClick={() => onSubmit()}
        >
          Get Data
        </Box>
      </Flex>
    </Box>
  );
};

export default BottomMenu;

interface BottomMenuProps {
  chainId: number;
  treeId?: string;
}
