import {
  Button,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import {
  useHatWearers,
  useModuleDetails,
  useWearerEligibilityCheck,
} from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ReactNode, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatAddress } from 'utils';
import { Hex, isAddress } from 'viem';
import { useAccount, useEnsAddress } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import { AddressInput } from '../../forms';
import ControllerWearer from './ControllerWearer';
import { ELIGIBILITY_STATUS } from './utils/general';
import useEligibilityRuleDetails from './utils/useEligibilityRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const Eligibility = () => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const localForm = useForm();
  const [wearerDisplay, setWearerDisplay] = useState<ReactNode | undefined>();

  const { data: hatWearers, isLoading: hatWearersLoading } = useHatWearers({
    hat: selectedHat,
    chainId,
  });

  const { setModals } = localOverlay;
  const { handleSubmit, watch, setValue } = localForm;
  const { eligibility } = _.pick(selectedHat, ['eligibility']);
  const orgChartEligibility = _.find(orgChartWearers, { id: eligibility });
  const hatWearerEligibility = _.find(hatWearers, { id: eligibility });
  const eligibilityData = hatWearerEligibility ||
    orgChartEligibility || { id: eligibility as Hex };
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const {
    details: moduleDetails,
    parameters,
    isLoading: loadingModuleDetails,
  } = useModuleDetails({
    address: eligibility,
    chainId,
    enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
  });
  const multipleModules = false; // TODO enable with multiple modules (~2.8)
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)
  const localWearer = watch('wearer');
  const localWearerIsAddress = isAddress(localWearer);

  const { data: resolvedAddress } = useEnsAddress({
    name: watch('wearer'),
    enabled: _.includes(localWearer, '.eth'),
  });

  const { data: eligibilityRuleDetails, isLoading: loadingEligibilityRules } =
    useEligibilityRuleDetails({
      selectedHat,
      moduleDetails,
      parameters,
      chainId,
    });

  const { data: wearerEligible } = useWearerEligibilityCheck({
    wearer: resolvedAddress || localWearer,
    selectedHat,
    chainId,
  });

  const checkWearerEligibility = useCallback(
    async (data: object) => {
      const w = _.get(data, 'wearer');
      let eligibleStatus = (
        <Text color='red.500' size={{ base: 'sm', md: 'md' }}>
          {w || formatAddress(resolvedAddress)} is not eligible
        </Text>
      );
      if (wearerEligible) {
        eligibleStatus = (
          <Text color='green.500' size={{ base: 'sm', md: 'md' }}>
            {w || formatAddress(resolvedAddress)} is eligible
          </Text>
        );
      }
      setWearerDisplay(eligibleStatus);
    },
    [resolvedAddress, wearerEligible],
  );

  const closeModal = () => {
    setModals?.({});
    setValue('wearer', '', { shouldDirty: false });
    setWearerDisplay(undefined);
  };

  if (multipleModules) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Comply with 2 rules to keep this Hat
        </Text>
      </Flex>
    );
  }

  if (moduleDetails) {
    if (eligibilityRuleDetails?.status === ELIGIBILITY_STATUS.hat) {
      const moduleHat = _.get(
        _.find(parameters, { displayType: 'hat' }),
        'value',
      ) as bigint | undefined;
      if (!moduleHat) return null; // TODO something better here? unlikely occurrence
      return (
        <Flex justify='space-between' py={1}>
          {eligibilityRuleDetails.rule}

          <ChakraNextLink
            href={`/trees/${chainId}/${hatIdToTreeId(
              moduleHat,
            )}?hatId=${hatIdDecimalToIp(moduleHat)}`}
          >
            <HStack spacing={1}>
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                {eligibilityRuleDetails.displayStatus}
              </Text>
              <Icon
                as={eligibilityRuleDetails.icon}
                boxSize={{ base: '14px', md: 4 }}
              />
            </HStack>
          </ChakraNextLink>
        </Flex>
      );
    }

    return (
      <Skeleton isLoaded={!loadingModuleDetails && !loadingEligibilityRules}>
        <Modal
          name='checkEligibility'
          title='Check Wearer Eligibility'
          localOverlay={localOverlay}
          onClose={closeModal}
        >
          <Stack spacing={4}>
            <Text fontSize='sm'>
              Check the eligibility of a wearer for this hat based on the
              eligibility rule(s).
            </Text>

            <Stack
              as='form'
              onSubmit={handleSubmit(checkWearerEligibility)}
              spacing={6}
            >
              <AddressInput
                name='wearer'
                label='Wearer'
                localForm={localForm}
                hideAddressButtons
              />

              <Flex justify='end'>
                <HStack spacing={4}>
                  {wearerDisplay && wearerDisplay}

                  <Button
                    type='submit'
                    colorScheme='blue'
                    isDisabled={!resolvedAddress && !localWearerIsAddress}
                  >
                    Check Eligibility
                  </Button>
                </HStack>
              </Flex>
            </Stack>
          </Stack>
        </Modal>
        <Flex justify='space-between' py={1}>
          {eligibilityRuleDetails?.rule}

          {address ? (
            <HStack
              spacing={1}
              color={
                eligibilityRuleDetails?.status === 'eligible'
                  ? 'green.600'
                  : 'gray.600'
              }
            >
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                {eligibilityRuleDetails?.displayStatus}
              </Text>
              <Icon
                as={eligibilityRuleDetails?.icon}
                boxSize={{ base: '14px', md: 4 }}
              />
            </HStack>
          ) : (
            <Button
              size='xs'
              fontWeight='medium'
              color='blue.500'
              variant='ghost'
              onClick={() => setModals?.({ checkEligibility: true })}
            >
              Check Eligibility
            </Button>
          )}
        </Flex>
      </Skeleton>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Another Hat can remove wearers
        </Text>

        <HStack spacing={1}>
          <Text fontSize={{ base: 'sm', md: 'md' }}>Hat ID</Text>
          <Icon as={HatIcon} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton
      isLoaded={
        !hatWearersLoading &&
        (!loadingEligibilityRules || !moduleDetails) &&
        (!loadingModuleDetails || orgChartEligibility?.isContract)
      }
    >
      <Flex justify='space-between' py={2}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {_.includes(NULL_ADDRESSES, eligibility)
            ? 'No addresses'
            : 'One address'}{' '}
          can remove Wearers
        </Text>

        <ControllerWearer controllerData={eligibilityData} />
      </Flex>
    </Skeleton>
  );
};

export default Eligibility;
