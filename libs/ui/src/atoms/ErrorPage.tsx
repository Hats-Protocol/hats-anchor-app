import {
  // Button,
  Flex,
  Heading,
  // HStack,
  // Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
// import _ from 'lodash';
// import { useParams } from 'next/navigation';
// import { FaArrowRight } from 'react-icons/fa';

// import ChakraNextLink from './ChakraNextLink';

const ErrorPage = () => {
  // const params = useParams();
  // const { chainId, treeId } = _.pick(params, ['chainId', 'treeId', 'hatId']);

  // const link = `/trees/${chainId}/${treeId}`;
  // if (hatId) {
  //   link = `${link}?hatId=${hatId}`;
  // }

  return (
    <Flex justify='center' pt={120}>
      <Stack spacing={6}>
        <Heading>Bummer, there was an issue!</Heading>
        <Text>
          Check the console or report in the community channel if you hit an
          issue
        </Text>
        {/* <HStack>
          <ChakraNextLink href='/'>
            <Button variant={!hatId && !treeId ? 'primary' : 'outline'}>
              Home
            </Button>
          </ChakraNextLink>
          {hatId || treeId ? (
            <ChakraNextLink href={link}>
              <Button rightIcon={<Icon as={FaArrowRight} />}>
                Back to {hatId ? 'Hat' : 'Tree'}
              </Button>
            </ChakraNextLink>
          ) : null}
        </HStack> */}
      </Stack>
    </Flex>
  );
};

export default ErrorPage;
