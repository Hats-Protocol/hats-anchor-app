import { Stack, Text } from '@chakra-ui/react';

const MainContent = () => {
  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      top={75}
      pos='relative'
    >
      <Text>Main content</Text>
    </Stack>
  );
};

export default MainContent;
