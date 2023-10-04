import { Code, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  BsBarChartLine,
  BsInfoCircle,
  BsPersonAdd,
  BsPuzzle,
} from 'react-icons/bs';

import RadioBox from '@/components/atoms/RadioBox';
import Select from '@/components/atoms/Select';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useCheckMultiClaimsHatter from '@/hooks/useMultiClaimsHatterCheck';
import {
  decimalId,
  getAllParents,
  idToPrettyId,
  prettyIdToIp,
} from '@/lib/hats';

const PermissionlessClaimingForm = ({
  localForm,
}: {
  localForm: UseFormReturn;
}) => {
  const { onchainHats, treeToDisplay, selectedHat, topHat } = useTreeForm();
  const adminHat = localForm.watch('adminHat');
  const isPermissionlesslyClaimable = localForm.watch(
    'isPermissionlesslyClaimable',
  );
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const parentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    return _.filter(parents, (parent) => parent !== topHat?.id);
  }, [selectedHat, treeToDisplay, topHat]);

  useEffect(() => {
    if (isPermissionlesslyClaimable === 'Yes') {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (isPermissionlesslyClaimable === 'No') {
      localForm.setValue('adminHat', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPermissionlesslyClaimable]);

  const wearersOfAllParentHats = useMemo(() => {
    return _.flatMap(parentHats, (hatId) => {
      const hat = _.find(onchainHats, { id: hatId });
      return _.map(_.get(hat, 'wearers', []), 'id');
    });
  }, [onchainHats, parentHats]);

  const { multiClaimsHatter, address, isLoading } = useCheckMultiClaimsHatter(
    wearersOfAllParentHats,
  );

  const showSelectAdminHat = useMemo(() => {
    return (
      isPermissionlesslyClaimable === 'Yes' &&
      !multiClaimsHatter &&
      !isLoading &&
      !multiClaimsHatter
    );
  }, [isPermissionlesslyClaimable, multiClaimsHatter, isLoading]);

  if (!onchainHats || !treeToDisplay) return null;

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

          {multiClaimsHatter && isPermissionlesslyClaimable === 'Yes' && (
            <FormRowWrapper>
              <Icon as={BsInfoCircle} boxSize={4} mt={1} color='blue.500' />
              <Text color='blue.500'>
                Claims hatter for this hat has already been set up at address{' '}
                <Code>{address}</Code>. It is not required to set up a new
                claims hatter.
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

      {showSelectAdminHat && (
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
                  <option value={decimalId(id)} key={id}>
                    {prettyIdToIp(idToPrettyId(id))}
                  </option>
                ))}
              </Select>
              {adminHat && (
                <Text color='blackAlpha.600'>
                  Potential wearers will be able to claim this hat if they meet
                  the requirements in new module above.
                </Text>
              )}
            </Stack>
          </FormRowWrapper>
        </Stack>
      )}

      {selectedHat?.wearers === selectedHat?.maxSupply && (
        <FormRowWrapper>
          <Icon as={BsBarChartLine} boxSize={4} mt='2px' />
          <Stack>
            <RadioBox
              name='increment'
              label='Increment Max Wearers by 1'
              subLabel='The admin hat you selected (2.3 — Builder Custodian) has no more available supply to mint. Do you want to increase the max wearers by 1 in order to mint this hat to the new hatter contract?'
              localForm={localForm}
              options={[
                {
                  label: `Yes — increase max wearers from ${
                    selectedHat?.maxSupply
                  } to ${Number(selectedHat?.maxSupply) + 1}`,
                  value: 'Yes',
                },
                {
                  label: 'No (cancel deployment)',
                  value: 'No',
                },
              ]}
            />
          </Stack>
        </FormRowWrapper>
      )}
    </Stack>
  );
};

export default PermissionlessClaimingForm;
