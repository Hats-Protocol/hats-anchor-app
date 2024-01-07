import { Code, Icon, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { formatAddress } from 'app-utils';
import {
  useHatDetails,
  useHatDetailsField,
  useIsAdmin,
  useMultiClaimsHatterCheck,
} from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  BsBarChartLine,
  BsInfoCircle,
  BsPersonAdd,
  BsPersonCheck,
  BsPuzzle,
} from 'react-icons/bs';
import { idToPrettyId, prettyIdToIp } from 'shared-utils';
import { Hex } from 'viem';

import { useTreeForm } from '../../../contexts/TreeFormContext';
import ChakraNextLink from '../../atoms/ChakraNextLink';
import RadioBox from '../../atoms/RadioBox';
import Select from '../../atoms/Select';
import FormRowWrapper from '../../FormRowWrapper';

const PermissionlessClaimingForm = ({
  localForm,
  parentHats,
}: {
  localForm: UseFormReturn;
  parentHats?: AppHat[];
}) => {
  const {
    onchainHats,
    treeToDisplay,
    selectedHat,
    chainId,
    storedData,
    editMode,
  } = useTreeForm();
  const adminHat = localForm.watch('adminHat');
  const isPermissionlesslyClaimable = localForm.watch(
    'isPermissionlesslyClaimable',
  );

  const { multiClaimsHatter, instanceAddress, claimableHats } =
    useMultiClaimsHatterCheck({
      chainId,
      selectedHat,
      onchainHats,
      storedData,
      editMode,
    });

  const isAdmin = useIsAdmin({
    address: instanceAddress,
    hatId: selectedHat?.id,
    chainId,
  });

  const isClaimable = _.includes(claimableHats, selectedHat?.id);
  const { data: wearingHatDetails } = useHatDetails({
    hatId: String(adminHat),
    chainId: selectedHat?.chainId,
  });
  const { data: wearingHatDetailsObject } = useHatDetailsField(
    wearingHatDetails?.details,
  );

  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPermissionlesslyClaimable === 'Yes') {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      localForm.setValue('adminHat', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPermissionlesslyClaimable]);

  if (!onchainHats || !treeToDisplay) return null;

  if (isClaimable) {
    return (
      <Stack spacing={12}>
        <Text>
          This hat is already claimable via{' '}
          <ChakraNextLink href={`/wearers/${instanceAddress}`} isExternal>
            <Code>{formatAddress(instanceAddress)}</Code>
          </ChakraNextLink>
        </Text>
      </Stack>
    );
  }

  return (
    <Stack spacing={12}>
      <FormRowWrapper>
        <Icon as={BsPersonAdd} boxSize={4} mt='2px' />
        <Stack>
          <RadioBox
            name='isPermissionlesslyClaimable'
            label='Hat Claiming'
            subLabel='Should this hat be permissionlessly claimable by potential wearers who meet the requirements of the accountability module?'
            localForm={localForm}
            options={[
              {
                label: 'Yes',
                value: 'Yes',
              },
              {
                label: 'No — admin mint only',
                value: 'No',
              },
            ]}
            isDisabled={!parentHats?.length}
          />
        </Stack>
      </FormRowWrapper>
      {!(parentHats && parentHats.length > 0) && (
        <FormRowWrapper>
          <Icon as={BsInfoCircle} boxSize={4} mt={1} color='blue.500' />
          <Text color='blue.500'>
            Permissionless claiming is currently unavailable as there are no
            eligible hats present. To enable this option, there must be at least
            one non-top hat admin of this hat available.
          </Text>
        </FormRowWrapper>
      )}

      {isPermissionlesslyClaimable === 'Yes' && (
        <Stack ref={scrollTargetRef} spacing={12}>
          <FormRowWrapper>
            <Icon as={BsPersonCheck} boxSize={4} mt='2px' />

            <RadioBox
              name='initialClaimabilityType'
              label='Claim For Account'
              subLabel='Should this hat be claimable on behalf of an account?'
              localForm={localForm}
              options={[
                {
                  label: 'Yes',
                  value: '2',
                },
                {
                  label: 'No',
                  value: '1',
                },
              ]}
              defaultValue='2'
              isDisabled={!parentHats?.length}
            />
          </FormRowWrapper>
          {multiClaimsHatter &&
          !isClaimable &&
          isAdmin &&
          isPermissionlesslyClaimable === 'Yes' ? (
            <FormRowWrapper>
              <Icon as={BsInfoCircle} boxSize={4} mt={1} color='blue.500' />
              <Text color='blue.500'>
                A claims hatter for this tree has already been set up at{' '}
                <Code>{formatAddress(instanceAddress)}</Code>. We&apos;ll
                register this hat with the hatter during the module deploy
                transaction.
              </Text>
            </FormRowWrapper>
          ) : (
            <FormRowWrapper>
              <Icon as={BsPuzzle} boxSize={4} mt='2px' />
              <Stack>
                <Select
                  name='adminHat'
                  label='ADMIN HAT'
                  subLabel='To enable permissionless claiming, give an admin hat in this tree to the new hatter contract. Must be a non-top hat admin of this hat.'
                  localForm={localForm}
                  placeholder='Select a hat in this tree'
                  defaultValue={undefined}
                  options={{
                    required: isPermissionlesslyClaimable === 'Yes',
                  }}
                >
                  {_.map(_.sortBy(parentHats, 'id'), (h: AppHat) => {
                    let displayName = h.details;
                    if (h.detailsObject?.data?.name)
                      displayName = h.detailsObject?.data?.name;
                    return (
                      <option value={h.id} key={h.id}>
                        {prettyIdToIp(idToPrettyId(h.id as Hex))} -{' '}
                        {displayName}
                      </option>
                    );
                  })}
                </Select>
                {adminHat && selectedHat && (
                  <Text color='blackAlpha.600'>
                    Potential wearers will be able to claim this hat (#
                    {hatIdDecimalToIp(BigInt(selectedHat.id))}) if they meet the
                    requirements in new module above.
                  </Text>
                )}
              </Stack>
            </FormRowWrapper>
          )}
        </Stack>
      )}

      {wearingHatDetails?.wearers?.length ===
        Number(wearingHatDetails?.maxSupply) && (
        <FormRowWrapper>
          <Icon as={BsBarChartLine} boxSize={4} mt='2px' />
          <Stack>
            <RadioBox
              name='incrementWearers'
              label='Increment Max Wearers by 1'
              subLabel={`The admin hat you selected (${hatIdDecimalToIp(
                BigInt(wearingHatDetails?.id),
              )} — ${
                wearingHatDetailsObject?.data.name
              }) has no more available supply to mint. Do you want to increase the max wearers by 1 in order to mint this hat to the new hatter contract?`}
              localForm={localForm}
              options={[
                {
                  label: `Yes — increase max wearers from ${
                    wearingHatDetails?.maxSupply
                  } to ${Number(wearingHatDetails?.maxSupply) + 1}`,
                  value: 'Yes',
                },
                {
                  label: 'No (cancel deployment)',
                  value: 'No',
                },
              ]}
              maxW='50%'
            />
          </Stack>
        </FormRowWrapper>
      )}
    </Stack>
  );
};

export default PermissionlessClaimingForm;
