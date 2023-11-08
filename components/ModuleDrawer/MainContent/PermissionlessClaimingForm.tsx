import { Code, Icon, Stack, Text } from '@chakra-ui/react';
// import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  BsBarChartLine,
  BsInfoCircle,
  BsPersonAdd,
  BsPuzzle,
} from 'react-icons/bs';
import { Hex } from 'viem';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import RadioBox from '@/components/atoms/RadioBox';
import Select from '@/components/atoms/Select';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatDetails from '@/hooks/useHatDetails';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import useIsAdmin from '@/hooks/useIsAdmin';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import { formatAddress } from '@/lib/general';
import { idToPrettyId, prettyIdToIp } from '@/lib/hats';

const PermissionlessClaimingForm = ({
  localForm,
  parentHats,
}: {
  localForm: UseFormReturn;
  parentHats?: Hex[];
}) => {
  const { onchainHats, treeToDisplay, selectedHat } = useTreeForm();
  const adminHat = localForm.watch('adminHat');
  const isPermissionlesslyClaimable = localForm.watch(
    'isPermissionlesslyClaimable',
  );

  const { multiClaimsHatter, instanceAddress, claimableHats } =
    useMultiClaimsHatterCheck();

  const isAdmin = useIsAdmin(instanceAddress, selectedHat?.id);

  const isClaimable = _.includes(claimableHats, selectedHat?.id);
  const { data: wearingHatDetails } = useHatDetails({
    hatId: String(adminHat),
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

          {multiClaimsHatter &&
            !isClaimable &&
            isAdmin &&
            isPermissionlesslyClaimable === 'Yes' && (
              <FormRowWrapper>
                <Icon as={BsInfoCircle} boxSize={4} mt={1} color='blue.500' />
                <Text color='blue.500'>
                  A claims hatter for this tree has already been set up at{' '}
                  <Code>{formatAddress(instanceAddress)}</Code>. We&apos;ll
                  register this hat with the hatter during the module deploy
                  transaction.
                </Text>
              </FormRowWrapper>
            )}
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

      {isPermissionlesslyClaimable === 'Yes' &&
        (!multiClaimsHatter ||
          (multiClaimsHatter && !isClaimable && !isAdmin)) && (
          <Stack ref={scrollTargetRef}>
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
                  {_.map(parentHats, (id) => (
                    <option value={id} key={id}>
                      {prettyIdToIp(idToPrettyId(id))}
                    </option>
                  ))}
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
