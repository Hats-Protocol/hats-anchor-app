import React from 'react';
import _ from 'lodash';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Stack,
  Badge,
  Heading,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { FiChevronsRight } from 'react-icons/fi';
import { FaEllipsisV } from 'react-icons/fa';
import useHatDetails from '@/hooks/useHatDetails';
import { formatAddress } from '@/lib/general';

const SelectedHatShade = ({
  selectedHatId,
  chainId,
}: SelectedHatShadeProps) => {
  const { data: hatData } = useHatDetails({
    hatId: selectedHatId,
    chainId,
  });
  // console.log(hatData);

  return (
    <Box
      w='30%'
      minW='700px'
      bg='whiteAlpha.900'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Image
          src='/icon.jpeg'
          alt='hat image'
          position='absolute'
          w='100px'
          h='100px'
          border='2px solid'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        />

        {/* Top Menu */}
        <Flex
          w='100%'
          borderBottom='1px solid'
          borderColor='gray.200'
          h='75px'
          bg='whiteAlpha.900'
          align='center'
          justify='space-between'
          px={4}
          position='absolute'
          top={0}
          zIndex={16}
        >
          <Button variant='outline'>
            <HStack>
              <Icon as={FiChevronsRight} />
              <Text>Collapse</Text>
            </HStack>
          </Button>
          <HStack>
            <Menu>
              <MenuButton as={Button} variant='outline'>
                <HStack>
                  <Icon as={FaEllipsisV} />
                  <Text>More</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Test</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        <Box w='100%' overflow='scroll'>
          {/* Main Details */}
          <Stack position='relative' p={10} spacing={10} pt='110px'>
            <Stack spacing={4}>
              <Flex align='start' justify='space-between'>
                <Stack>
                  <Text fontSize='2xl' fontWeight='medium'>
                    Top Hat #21
                  </Text>
                  <Text>Tree #1 on xDai</Text>
                </Stack>
                <HStack>
                  <Text>Hat ID:</Text>
                  <Text>21.3</Text>
                </HStack>
              </Flex>
              <HStack>
                <Badge>My Hat</Badge>
                <Badge>Mutable</Badge>
                <Badge>Active</Badge>
                <Badge>Level 3</Badge>
              </HStack>
            </Stack>

            <Stack spacing={4}>
              <Flex justify='space-between'>
                <Heading
                  size='sm'
                  fontWeight='medium'
                  textTransform='uppercase'
                >
                  Hat Wearers
                </Heading>
                <Text>1/5</Text>
              </Flex>

              {/* Wearers list */}
              {_.map(_.get(hatData, 'wearers', []), (wearer: any) => (
                <Flex>
                  <Text>{formatAddress(_.get(wearer, 'id'))}</Text>
                </Flex>
              ))}
            </Stack>

            <Stack spacing={4}>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Responsibilities
              </Heading>

              <UnorderedList spacing={3}>
                <ListItem>Post a report on Github</ListItem>
                <ListItem>Moderate the Discord</ListItem>
              </UnorderedList>
            </Stack>

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Authorities
              </Heading>

              <UnorderedList spacing={3}>
                <ListItem>Post a report on Github</ListItem>
                <ListItem>Moderate the Discord</ListItem>
              </UnorderedList>
            </Stack>

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Eligibility
              </Heading>
            </Stack>

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Toggle
              </Heading>
            </Stack>
          </Stack>
        </Box>

        {/* Bottom Menu */}
        <Box w='100%' position='absolute' bottom={0} zIndex={14}>
          <Flex
            justify='space-between'
            p={4}
            borderTop='1px solid'
            borderColor='gray.200'
          >
            <Button variant='outline'>2.2</Button>
            <HStack>
              <Button variant='outline'>2</Button>
              <Button variant='outline'>2.3.1</Button>
            </HStack>

            <Button variant='outline'>2.4</Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default SelectedHatShade;

interface SelectedHatShadeProps {
  selectedHatId: any | undefined;
  chainId: number;
}
