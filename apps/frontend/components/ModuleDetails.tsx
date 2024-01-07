import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { formatAddress } from 'app-utils';
import {
  useCallModuleFunction,
  useModuleDetails,
  useMultiClaimsHatterCheck,
  useMultiClaimsHatterContractWrite,
  useWearerDetails,
} from 'hats-hooks';
import { LinkObject } from 'hats-types';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';

import { useOverlay } from '../contexts/OverlayContext';
import { useTreeForm } from '../contexts/TreeFormContext';
import ChakraNextLink from './atoms/ChakraNextLink';
import Modal from './atoms/Modal';
import ModuleArgsInputs from './ModuleArgsForm';
import ModuleParameters from './ModuleParameters';

const ModuleDetails = ({ type }: { type: string }) => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals, handlePendingTx } = localOverlay;
  const { chainId, selectedHat, onchainHats, storedData, editMode } =
    useTreeForm();

  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;

  const address = useMemo(
    () => _.get(selectedHat, _.toLower(type)),
    [selectedHat, type],
  );

  const { details: moduleDetails, parameters } = useModuleDetails({
    address,
    chainId,
  });
  const tokenAddress = _.get(
    _.find(parameters, { displayType: 'token' }),
    'value',
  );

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
      setModals?.({ 'functionCall-module': true });
    } else {
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: address,
        func,
        args: [],
      });
    }
  };

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });
  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const { instanceAddress, claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

  const { writeAsync: setHatClaimable, isLoading: isLoadingSetHatClaimable } =
    useMultiClaimsHatterContractWrite({
      functionName: 'setHatClaimability',
      address: instanceAddress,
      chainId,
      enabled: !!instanceAddress && isAdminUser,
      args: [selectedHat?.id, 1],
      handlePendingTx,
      hatId: selectedHat?.id,
    });

  const {
    writeAsync: setHatClaimableFor,
    isLoading: isLoadingSetHatClaimableFor,
  } = useMultiClaimsHatterContractWrite({
    functionName: 'setHatClaimability',
    address: instanceAddress,
    chainId,
    enabled: !!instanceAddress && isAdminUser,
    args: [selectedHat?.id, 2],
    handlePendingTx,
    hatId: selectedHat?.id,
  });

  const isClaimable = useMemo(
    () => ({
      by:
        selectedHat?.claimableBy?.length >= 1 &&
        selectedHat?.claimableForBy.length === 0,
      for:
        selectedHat?.claimableBy?.length >= 1 &&
        selectedHat?.claimableForBy.length >= 1,
    }),
    [selectedHat],
  );

  const onSubmit = (values) => {
    // eslint-disable-next-line no-console
    console.log(values);
  };

  if (!moduleDetails) return null;

  return (
    <Accordion allowMultiple>
      {!_.isEmpty(moduleActions) && (
        <>
          <Modal
            name='functionCall-module'
            title={`Interact with ${moduleDetails?.name} (${formatAddress(
              address,
            )})`}
            localOverlay={localOverlay}
            headingSize='sm'
          >
            <Box as='form' onSubmit={handleSubmit(onSubmit)}>
              {selectedFunction?.description && (
                <Text mb={3}>{selectedFunction?.description}</Text>
              )}
              <Stack>
                <ModuleArgsInputs
                  selectedModuleArgs={selectedFunction?.args}
                  tokenAddress={tokenAddress}
                  localForm={formMethods}
                  hideIcon
                  noMargin
                />
              </Stack>
              <Flex justify='flex-end' mt={4}>
                <HStack>
                  <Button variant='outline' onClick={() => setModals({})}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme='blue'
                    type='submit'
                    isDisabled={!formState.isValid}
                    isLoading={isModuleLoading}
                  >
                    {selectedFunction?.label}
                  </Button>
                </HStack>
              </Flex>
            </Box>
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
                {_.map(moduleActions, (action) => (
                  <Tooltip label={action.description} key={action.label}>
                    <Button
                      variant='outlineMatch'
                      colorScheme='blue.500'
                      size='sm'
                      onClick={() => handleFunctionCall(action)}
                    >
                      {action.label}
                    </Button>
                  </Tooltip>
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
            <Flex justify='space-between'>
              <Text fontSize='sm'>Claimability Type</Text>
              <HStack>
                <Button
                  as={Button}
                  size='xs'
                  variant='outline'
                  colorScheme='blue.500'
                  isLoading={
                    isLoadingSetHatClaimable || isLoadingSetHatClaimableFor
                  }
                  isDisabled={!setHatClaimable || !setHatClaimableFor}
                  onClick={() =>
                    isClaimable.for ? setHatClaimable() : setHatClaimableFor()
                  }
                >
                  {_.includes(claimableHats, selectedHat?.id) &&
                  !isClaimable.for
                    ? 'Make claimable for'
                    : 'Make claimable'}
                </Button>
                <Text color='gray.500' size='sm'>
                  {isClaimable.for ? 'Claimable For' : 'Claimable'}
                </Text>
              </HStack>
            </Flex>
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
