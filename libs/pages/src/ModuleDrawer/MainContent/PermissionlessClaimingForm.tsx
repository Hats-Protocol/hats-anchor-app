import { Code, Icon, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import {
  useHatDetails,
  useHatDetailsField,
  useIsAdmin,
  useMultiClaimsHatterCheck,
} from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  BsBarChartLine,
  BsInfoCircle,
  BsPersonAdd,
  BsPersonCheck,
  BsPuzzle,
} from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const FormRowWrapper = dynamic(() =>
  import('ui').then((mod) => mod.FormRowWrapper),
);
const RadioBox = dynamic(() => import('ui').then((mod) => mod.RadioBox));
const Select = dynamic(() => import('ui').then((mod) => mod.Select));

const PermissionlessClaimingForm = ({
  localForm,
  parentHats,
}: {
  localForm: UseFormReturn;
  parentHats?: AppHat[];
}) => {
  const { onchainHats, treeToDisplay, chainId, storedData, editMode } =
    useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { watch, setValue } = _.pick(localForm, ['watch', 'setValue']);
  const adminHat = watch('adminHat');
  const isPermissionlesslyClaimable = watch('isPermissionlesslyClaimable');

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
    editMode,
  });

  const isClaimable = _.includes(claimableHats, selectedHat?.id);
  const { data: wearingHatDetails } = useHatDetails({
    hatId: String(adminHat),
    chainId: selectedHat?.chainId,
    editMode,
  });
  const { data: wearingHatDetailsObject } = useHatDetailsField(
    wearingHatDetails?.details,
    editMode,
  );

  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPermissionlesslyClaimable === 'Yes') {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth' });
      setValue('adminHat', _.get(_.first(parentHats), 'id'));
    } else {
      setValue('adminHat', undefined);
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
                        {idToIp(h.id as Hex)} - {displayName}
                      </option>
                    );
                  })}
                </Select>
                {selectedHat && (
                  <Text variant='light'>
                    Potential wearers will be able to claim this hat (#
                    {hatIdDecimalToIp(BigInt(selectedHat.id))}) if they meet the
                    requirements in new module above.
                  </Text>
                )}
              </Stack>
            </FormRowWrapper>
          )}
          <FormRowWrapper>
            <Icon as={BsPersonCheck} boxSize={4} mt='2px' />
            <Stack>
              <RadioBox
                name='initialClaimabilityType'
                label='CLAIM FOR ACCOUNT'
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
              />
            </Stack>
          </FormRowWrapper>
        </Stack>
      )}

      {wearingHatDetails?.wearers?.length ===
        Number(wearingHatDetails?.maxSupply) &&
        !instanceAddress && (
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
