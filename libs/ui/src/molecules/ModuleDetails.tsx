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
import { CONTROLLER_TYPES, TOKEN_ARG_TYPES } from '@hatsprotocol/constants';
import { WriteFunction } from '@hatsprotocol/hsg-sdk';
import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import {
  useCallModuleFunction,
  useModuleDetails,
  useMultiClaimsHatterCheck,
  useMultiClaimsHatterContractWrite,
  useWearerDetails,
} from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';
import { AppWriteFunction, LinkObject } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { ChakraNextLink } from '../atoms';
import ModuleArgsForm from '../forms/ModuleArgsForm';
import ModuleParameters from './ModuleParameters';

const claimableToggleTip = (sameChain: boolean, isAdminUser: boolean) => {
  if (!sameChain) {
    return 'You must be on the same chain as the hat to make it claimable';
  }
  if (!isAdminUser) {
    return 'You must be wearing the admin hat to make this hat claimable';
  }
  return '';
};

const ModuleDetails = ({ type }: { type: string }) => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals, handlePendingTx } = localOverlay;
  const { chainId, onchainHats, storedData, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const currentChainId = useChainId();
  const { address: currentUser } = useAccount();
  const { isMobile } = useMediaStyles();

  const sameChain = chainId === currentChainId;
  const controllerAddress = useMemo(
    () => _.get(selectedHat, _.toLower(type)),
    [selectedHat, type],
  );

  const { details: moduleDetails, parameters } = useModuleDetails({
    address: controllerAddress,
    chainId,
  });

  const formMethods = useForm({
    mode: 'onChange',
  });

  const { formState, handleSubmit } = formMethods;

  const tokenAddress = _.get(
    _.find(parameters, (param: any) =>
      _.includes(TOKEN_ARG_TYPES, param.displayType),
    ),
    'value',
  );

  const moduleActions = _.filter(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: AppWriteFunction) => _.includes(fn.roles, 'public'),
  );
  const sortedModuleActions = _.sortBy(moduleActions, (a: any) =>
    _.size(a.label),
  );

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });
  const handleFunctionCall = (func: any) => {
    console.log('func', func);
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ 'functionCall-module': true });
    } else {
      if (!moduleDetails?.implementationAddress) return;
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: controllerAddress,
        func,
        args: [],
      });
    }
  };

  const { data: wearer } = useWearerDetails({
    wearerAddress: currentUser,
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
      by: !_.isEmpty(selectedHat?.claimableBy),
      for: !_.isEmpty(selectedHat?.claimableForBy),
    }),
    [selectedHat],
  );

  const onSubmit = (values: any) => {
    if (!moduleDetails?.implementationAddress) return;
    // eslint-disable-next-line no-console
    callModuleFunction({
      moduleId: moduleDetails.implementationAddress,
      instance: controllerAddress,
      func: selectedFunction || undefined,
      args: values,
    });
  };

  if (!moduleDetails || !chainId) return null;

  return (
    <Accordion px={{ base: 4, md: 10 }} allowMultiple>
      {!_.isEmpty(moduleActions) && (
        <>
          <Modal
            name='functionCall-module'
            title={`Interact with ${moduleDetails?.name} (${formatAddress(
              controllerAddress,
            )})`}
            localOverlay={localOverlay}
          >
            <Box as='form' onSubmit={handleSubmit(onSubmit)}>
              {_.get(selectedFunction, 'description') && (
                <Text mb={3}>{_.get(selectedFunction, 'description')}</Text>
              )}
              <Stack>
                {_.get(selectedFunction, 'args') && (
                  <ModuleArgsForm
                    selectedModuleArgs={_.get(selectedFunction, 'args', [])}
                    tokenAddress={tokenAddress as Hex}
                    localForm={formMethods}
                    hideIcon
                    noMargin
                  />
                )}
              </Stack>
              <Flex justify='flex-end' mt={4}>
                <HStack>
                  <Button variant='outline' onClick={() => setModals?.({})}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme='blue'
                    type='submit'
                    isDisabled={!formState.isValid}
                    // isLoading={isModuleLoading}
                  >
                    {_.get(selectedFunction, 'label')}
                  </Button>
                </HStack>
              </Flex>
            </Box>
          </Modal>
          <AccordionItem border='0'>
            <AccordionButton px={0}>
              <HStack>
                <Heading size='xs' variant='medium' textTransform='uppercase'>
                  Module Actions
                </Heading>
                <AccordionIcon />
              </HStack>
            </AccordionButton>
            <AccordionPanel px={0}>
              <Flex gap={2} wrap='wrap'>
                {_.map(sortedModuleActions, (action: WriteFunction) => (
                  <Tooltip label={action.description} key={action.label}>
                    <Button
                      variant='outlineMatch'
                      colorScheme='blue.500'
                      size={{ base: 'xs', md: 'sm' }}
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
            <Heading size='xs' variant='medium' textTransform='uppercase'>
              Module Details
            </Heading>
            <AccordionIcon />
          </HStack>
        </AccordionButton>
        <AccordionPanel px={0}>
          <Stack>
            {_.map(moduleDetails.details, (detail: string) => (
              <Text key={detail} size='sm'>
                {detail}
              </Text>
            ))}
            {type === CONTROLLER_TYPES.eligibility && !isMobile && (
              <Flex justify='space-between'>
                <Text size='sm'>Claimability Type</Text>

                <HStack>
                  <Tooltip label={claimableToggleTip(sameChain, isAdminUser)}>
                    <Button
                      size='xs'
                      variant='outline'
                      colorScheme='blue.500'
                      isLoading={
                        isLoadingSetHatClaimable || isLoadingSetHatClaimableFor
                      }
                      isDisabled={!setHatClaimable && !setHatClaimableFor}
                      onClick={() =>
                        isClaimable.for
                          ? setHatClaimable?.()
                          : setHatClaimableFor?.()
                      }
                    >
                      {_.includes(claimableHats, selectedHat?.id) &&
                      !isClaimable.for
                        ? 'Make claimable for'
                        : 'Make claimable'}
                    </Button>
                  </Tooltip>
                  <Text size='sm' variant='gray'>
                    {isClaimable.for ? 'Claimable For' : 'Claimable'}
                  </Text>
                </HStack>
              </Flex>
            )}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
      {!_.isEmpty(parameters) && (
        <AccordionItem border='0'>
          <AccordionButton px={0}>
            <HStack>
              <Heading size='xs' variant='medium' textTransform='uppercase'>
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
                  <Text size='sm'>{link.label}</Text>
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
