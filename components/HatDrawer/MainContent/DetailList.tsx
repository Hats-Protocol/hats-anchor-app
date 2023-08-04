import {
  Flex,
  Heading,
  Icon,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { validateURL } from '@/lib/general';
import { DetailsItem } from '@/types';

const DetailList = ({
  title,
  details,
}: {
  title: string;
  details?: DetailsItem[];
}) => (
  <Stack>
    <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
      {title}
    </Heading>
    <UnorderedList>
      {details?.length ? (
        details.map(({ label, link }: DetailsItem) => (
          <ListItem key={label}>
            <Flex justifyContent='space-between'>
              {link && validateURL(link) ? (
                <ChakraNextLink isExternal href={link}>
                  <Text>{label}</Text>
                </ChakraNextLink>
              ) : (
                <Text>{label}</Text>
              )}
              {link && validateURL(link) && (
                <ChakraNextLink isExternal href={link} display='block'>
                  <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                </ChakraNextLink>
              )}
            </Flex>
          </ListItem>
        ))
      ) : (
        <ListItem>None</ListItem>
      )}
    </UnorderedList>
  </Stack>
);

export default DetailList;
