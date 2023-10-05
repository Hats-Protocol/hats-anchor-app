import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { FiExternalLink } from 'react-icons/fi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useModuleDetails from '@/hooks/useModuleDetails';

import ChakraNextLink from './atoms/ChakraNextLink';
import ModuleParameters from './ModuleParameters';

const ModuleDetails = ({ type }: { type: string }) => {
  const { chainId, selectedHat } = useTreeForm();

  const address = useMemo(
    () => _.get(selectedHat, _.toLower(type)),
    [selectedHat, type],
  );

  const { details: moduleDetails, parameters } = useModuleDetails({ address });

  if (!moduleDetails) return null;

  return (
    <Accordion defaultIndex={[1]} allowMultiple>
      <AccordionItem border='0'>
        <AccordionButton px={0}>
          <HStack>
            <Heading size='xs' fontWeight='medium' textTransform='uppercase'>
              Module Details
            </Heading>
            <AccordionIcon />
          </HStack>
        </AccordionButton>
        <AccordionPanel px={0}>
          <Stack>
            {_.map(moduleDetails.details, (detail) => (
              <Text key={detail} fontSize='sm'>
                {detail}
              </Text>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
      {!_.isEmpty(parameters) && (
        <AccordionItem border='0'>
          <AccordionButton px={0}>
            <HStack>
              <Heading size='xs' fontWeight='medium' textTransform='uppercase'>
                Module Parameters
              </Heading>
              <AccordionIcon />
            </HStack>
          </AccordionButton>
          <AccordionPanel px={0}>
            <ModuleParameters parameters={parameters} chainId={chainId} />
          </AccordionPanel>
        </AccordionItem>
      )}

      <AccordionItem border='0'>
        <AccordionButton px={0}>
          <HStack>
            <Heading size='xs' fontWeight='medium' textTransform='uppercase'>
              Module Links
            </Heading>
            <AccordionIcon />
          </HStack>
        </AccordionButton>
        <AccordionPanel px={0}>
          <Stack>
            {_.map(moduleDetails.links, (link) => (
              <ChakraNextLink href={link.link} key={link.link} isExternal>
                <Flex justify='space-between'>
                  <Text fontSize='sm'>{link.label}</Text>
                  <Icon as={FiExternalLink} h='14px' color='gray.500' />
                </Flex>
              </ChakraNextLink>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default ModuleDetails;
