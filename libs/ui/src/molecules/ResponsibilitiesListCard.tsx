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
            borderY='1px solid'
            borderColor='transparent'
            _hover={{
              borderColor: 'blue.300',
              borderTopColor: 'transparent',
              bg: 'white',
              borderRadius: !isMobile ? 8 : 0,
            }}
            _focus={{
              borderBottomColor: 'transparent',
            }}
            _expanded={{
              bg: 'white',
              borderTopColor: 'gray.200',
              pb: 0,
              boxShadow:
                '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 5px 0px rgba(0, 0, 0, 0.15)',
              _hover: {
                borderColor: 'transparent',
                borderRadius: 0,
                borderTopRadius: !isMobile ? 8 : 0,
              },
            }}
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
            // mb={isExpanded ? 4 : 0} // TODO giving a weird jumping effect on transition
            bg={isExpanded ? 'white' : undefined}
            borderBottomRadius={{ md: 8 }}
            boxShadow={
              isExpanded ? '0px 10px 6px -6px rgba(0, 0, 0, 0.10)' : 'none'
            }
          >
            <Stack>
              {link && (
                <Flex>
                  <Link href={link} isExternal>
                    <Tooltip label={hostname}>
                      <Button
                        rightIcon={<Icon boxSize={3} as={BsBoxArrowUpRight} />}
                        variant='outlineMatch'
                        colorScheme='blue.500'
                        size={{ base: 'xs', md: 'sm' }}
                      >
                        <Text size='sm'>{hostname}</Text>
                      </Button>
                    </Tooltip>
                  </Link>
                </Flex>
              )}

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
