import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  ModalFooter,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useCallModuleFunction, useModuleDetails } from 'hats-hooks';
import { LinkObject } from 'hats-types';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';

import { useOverlay } from '../contexts/OverlayContext';
import { useTreeForm } from '../contexts/TreeFormContext';
import ChakraNextLink from './atoms/ChakraNextLink';
import Modal from './atoms/Modal';
import ModuleArgsInputs from './ModuleArgsInputs';
import ModuleParameters from './ModuleParameters';

const ModuleDetails = ({ type }: { type: string }) => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat } = useTreeForm();

  const formMethods = useForm({ mode: 'onChange' });
  const { formState } = formMethods;

  const address = useMemo(
    () => _.get(selectedHat, _.toLower(type)),
    [selectedHat, type],
  );

  const { details: moduleDetails, parameters } = useModuleDetails({
    address,
    chainId,
  });

  const moduleActions = _.filter(_.get(moduleDetails, 'writeFunctions'), (fn) =>
    _.includes(fn.roles, 'public'),
  );

  const { mutate: callModuleFunction, isLoading: isModuleLoading } =
    useCallModuleFunction({
      chainId,
    });

  const handleFunctionCall = (func) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ [`functionCall-module`]: true });
    } else {
      callModuleFunction({
        moduleId: moduleDetails.id,
        instance: address,
        func,
        args: [],
      });
    }
  };

  const handleSubmit = (values: any) => {
    console.log(values);
  };

  if (!moduleDetails) return null;

  return (
    <Accordion allowMultiple>
      {!_.isEmpty(moduleActions) && (
        <>
          <Modal
            name='functionCall-module'
            title={selectedFunction?.label}
            localOverlay={localOverlay}
            size='md'
          >
            {selectedFunction?.description && (
              <Text mb={3}>{selectedFunction?.description}</Text>
            )}
            <Stack>
              <ModuleArgsInputs
                selectedModuleArgs={selectedFunction?.args}
                localForm={formMethods}
              />
            </Stack>
            <ModalFooter px={0}>
              <HStack>
                <Button variant='outline' onClick={() => setModals({})}>
                  Cancel
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={() => handleSubmit(handleSubmit)}
                  isDisabled={!formState.isValid}
                  isLoading={isModuleLoading}
                >
                  {selectedFunction?.label}
                </Button>
              </HStack>
            </ModalFooter>
          </Modal>
          <AccordionItem border='0'>
            <AccordionButton px={0}>
              <HStack>
                <Heading
                  size='xs'
                  fontWeight='medium'
                  textTransform='uppercase'
                >
                  Module Actions
                </Heading>
                <AccordionIcon />
              </HStack>
            </AccordionButton>
            <AccordionPanel px={0}>
              <Flex gap={2} wrap='wrap'>
                {_.map(moduleActions, (action: any) => (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleFunctionCall(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </>
      )}
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
            {_.map(moduleDetails.details, (detail: string) => (
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
            {_.map(moduleDetails.links, (link: LinkObject) => (
              <ChakraNextLink
                href={link.link || '#'}
                key={link.link}
                isExternal
              >
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
