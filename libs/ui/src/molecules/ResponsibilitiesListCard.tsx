import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Authority } from 'hats-types';
import { useMediaStyles } from 'hooks';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { getHostnameFromURL } from 'utils';

import { Markdown } from '../atoms';
import ResponsibilityHeader from './ResponsibilityHeader';

const ResponsibilitiesListCard = ({
  responsibility,
}: {
  responsibility?: Authority;
}) => {
  const { label, description, link, imageUrl } = responsibility || {};
  const { isMobile } = useMediaStyles();
  const hostname = getHostnameFromURL(link);

  return (
    <AccordionItem
      border='none'
      w={{ base: '100%', md: 'calc(100% + 32px)' }}
      ml={{ md: -4 }}
    >
      {({ isExpanded }) => (
        <>
          <AccordionButton
            borderBottom='1px solid'
            borderColor='transparent'
            _hover={{
              borderColor: !isExpanded && 'blue.300',
              bg: 'white',
              borderRadius: !isExpanded && 8,
            }}
            bg={isExpanded ? 'white' : undefined}
            borderTopRadius={isExpanded ? 8 : undefined}
          >
            <Box flex='1' textAlign='left'>
              <ResponsibilityHeader
                label={label}
                imageUrl={imageUrl}
                link={link}
                isExpanded={isExpanded}
              />
            </Box>
            {isMobile && <AccordionIcon ml={2} />}
          </AccordionButton>
          <AccordionPanel
            px={4}
            pb={2}
            bg={isExpanded ? 'white' : undefined}
            borderBottomRadius={8}
          >
            <Stack>
              <Flex>
                <Link href={link} isExternal>
                  <Tooltip label={hostname}>
                    <Button
                      rightIcon={<Icon boxSize={3} as={BsBoxArrowUpRight} />}
                      variant='outlineMatch'
                      colorScheme='blue.500'
                      size='sm'
                    >
                      <Text size='sm'>{hostname}</Text>
                    </Button>
                  </Tooltip>
                </Link>
              </Flex>
              <Flex>
                {description && <Markdown smallFont>{description}</Markdown>}
              </Flex>
            </Stack>
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
};

export default ResponsibilitiesListCard;
