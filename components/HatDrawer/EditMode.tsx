import { Box, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaKey, FaRegListAlt } from 'react-icons/fa';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, TRIGGER_OPTIONS, ZERO_ADDRESS } from '@/constants';
import HatBasicsForm from '@/forms/HatBasicsForm';
import HatManagementForm from '@/forms/HatManagementForm';
import HatWearerForm from '@/forms/HatWearerForm';
import ItemDetailsForm from '@/forms/ItemDetailsForm';
import useDebounce from '@/hooks/useDebounce';
import useLocalStorage from '@/hooks/useLocalStorage';
import { generateLocalStorageKey } from '@/lib/general';
import { isTopHat } from '@/lib/hats';
import { DetailsItem, FieldItem, FormData, HatDetails, IHat } from '@/types';

const EditMode = ({
  hatData,
  chainId,
  hatDetails,
  updateUnsavedData,
  treeId,
}: EditModeProps) => {
  const {
    name: initialName,
    description: initialDescription,
    guilds: initialGuilds,
    responsibilities: initialResponsibilities,
    authorities: initialAuthorities,
    eligibility: initialEligibility,
    toggle: initialToggle,
  } = hatDetails;

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData] = useLocalStorage<any[]>(localStorageKey, []);

  const defaultFormValues = useMemo<FormData>(
    () => ({
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
      imageUrl: hatData?.imageUrl ?? '',
      isEligibilityManual:
        initialEligibility?.manual || initialEligibility?.manual === undefined
          ? TRIGGER_OPTIONS.MANUALLY
          : TRIGGER_OPTIONS.AUTOMATICALLY,
      isToggleManual:
        initialToggle?.manual || initialToggle?.manual === undefined
          ? TRIGGER_OPTIONS.MANUALLY
          : TRIGGER_OPTIONS.AUTOMATICALLY,
      revocationsCriteria: initialEligibility?.criteria ?? [],
      deactivationsCriteria: initialToggle?.criteria ?? [],
      name: initialName || '',
      description: initialDescription || '',
      authorities: initialAuthorities ?? [],
      responsibilities: initialResponsibilities ?? [],
      guilds: initialGuilds ?? [],
      wearers: [],
    }),
    [
      hatData?.maxSupply,
      hatData?.eligibility,
      hatData?.toggle,
      hatData?.mutable,
      hatData?.imageUrl,
      initialEligibility?.manual,
      initialEligibility?.criteria,
      initialToggle?.manual,
      initialToggle?.criteria,
      initialName,
      initialDescription,
      initialAuthorities,
      initialResponsibilities,
      initialGuilds,
    ],
  );

  const localForm = useForm({
    mode: 'onChange',
  });

  const { watch, reset } = localForm;

  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = _.find(storedData, ['id', hatData?.id]);

      if (matchingHat) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };
      }

      reset({ ...formValues, prepped: true });
    };

    if (hatData?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, hatData?.id, reset]);

  const allFormData = watch();

  const prevAllFormData = useRef<any>(allFormData);

  const getDirtyFields = useCallback(() => {
    return (Object.keys(defaultFormValues) as Array<keyof FormData>).filter(
      (key) =>
        JSON.stringify(defaultFormValues[key]) !==
        JSON.stringify(allFormData[key]),
    );
  }, [allFormData, defaultFormValues]);

  const getDirtyFieldsForAccordion = (fieldsArray: FieldItem[]) => {
    const fields = getDirtyFields();

    return fieldsArray
      .filter((field) => fields.includes(field.name))
      .map((field) => field.label);
  };

  useEffect(() => {
    if (!_.isEqual(prevAllFormData.current, allFormData)) {
      const dirtyFieldKeys = getDirtyFields();
      const dirtyFormData = dirtyFieldKeys.reduce(
        (acc: FormData, key: keyof FormData) => {
          (acc[key] as DetailsItem[] | string | string[] | undefined) =
            allFormData[key];
          return acc;
        },
        {} as FormData,
      );

      updateUnsavedData(dirtyFormData);
      prevAllFormData.current = allFormData;
    }
  }, [allFormData, hatData.id, chainId, getDirtyFields, updateUnsavedData]);

  const [newImageURI, setNewImageURI] = useState('');
  // const [newDetailsData, setNewDetailsData] = useState<HatDetails>();

  const eligibility = useDebounce(
    watch('eligibility', hatData?.eligibility || ZERO_ADDRESS),
  );
  const toggle = useDebounce(watch('toggle', hatData?.toggle || ZERO_ADDRESS));

  const { data: eligibilityResolvedAddress } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });

  const { data: toggleResolvedAddress } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  if (!hatData) return null;

  return (
    <Box w='100%' overflow='scroll' height='100%'>
      {/* Main Details */}
      <Stack
        position='relative'
        p={10}
        spacing={10}
        py='110px'
        overflow='auto'
        height='100%'
      >
        <Stack>
          <Text>{hatIdDecimalToIp(BigInt(hatData?.id))}</Text>
          <Text>All changes are local until you deploy to chain.</Text>
        </Stack>

        <Accordion
          title='Hat Basics'
          subtitle='The fundamentals of the hat, including name, image, and supply.'
          dirtyFieldsList={getDirtyFieldsForAccordion(hatBasicsFields)}
        >
          <Stack spacing={4}>
            <HatBasicsForm
              localForm={localForm}
              hatData={hatData}
              chainId={chainId}
              setNewImageURI={setNewImageURI}
            />
          </Stack>
        </Accordion>

        {!isTopHat(hatData) && (
          <Accordion
            title='Wearers'
            subtitle='Individual, multisig, DAO, or contract addresses that hold this token.'
            dirtyFieldsList={getDirtyFieldsForAccordion(wearerFields)}
          >
            <Stack spacing={4}>
              <HatWearerForm
                localForm={localForm}
                hatData={hatData}
                chainId={chainId}
                setUnsavedData={updateUnsavedData}
              />
            </Stack>
          </Accordion>
        )}

        <Accordion
          title='Powers'
          subtitle='Permissions and rights that are controlled by wearers of this hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(powersFields)}
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='authorities'
              title='PERMISSIONS'
              label='Permission'
              Icon={FaKey}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Responsibilities'
          subtitle='Specific work that wearers of this hat will be held accountable for.'
          dirtyFieldsList={getDirtyFieldsForAccordion(responsibilitiesFields)}
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='responsibilities'
              title='RESPONSIBILITIES'
              label='Responsibility'
              Icon={FaRegListAlt}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Revocation'
          subtitle='The people or logic that determine when a wearer should have a hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(revocationFields)}
        >
          <Stack spacing={4}>
            <HatManagementForm
              localForm={localForm}
              hatData={hatData}
              address={eligibility}
              actionResolvedAddress={eligibilityResolvedAddress}
              title='eligibility'
              formName='revocationsCriteria'
              radioBoxConfig={{
                name: 'isEligibilityManual',
                label: 'Hat Revocation',
                subLabel: 'How should toggle from wearers be handled?',
              }}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Deactivation & Reactivation'
          subtitle='The people or logic that control whether or not this hat is active.'
          dirtyFieldsList={getDirtyFieldsForAccordion(deactivationFields)}
        >
          <Stack spacing={4}>
            <HatManagementForm
              localForm={localForm}
              hatData={hatData}
              address={toggle}
              actionResolvedAddress={toggleResolvedAddress}
              title='toggle'
              formName='deactivationsCriteria'
              radioBoxConfig={{
                name: 'isToggleManual',
                label: 'Hat Deactivation',
                subLabel:
                  'How should deactivation and reactivation be handled?',
              }}
            />
          </Stack>
        </Accordion>

        {/* <Flex justifyContent='flex-end'>
          <Button
            colorScheme='blue'
            onClick={handleSubmit(submitAndResetForm)}
            isLoading={
              isLoadingEligibilityResolvedAddress ||
              isLoadingToggleResolvedAddress ||
              isLoading
            }
          >
            Submit
          </Button>
        </Flex> */}
      </Stack>
    </Box>
  );
};

export default EditMode;

const hatBasicsFields: FieldItem[] = [
  { name: 'name', label: 'Name' },
  { name: 'description', label: 'Description' },
  { name: 'imageUrl', label: 'Image' },
  { name: 'guilds', label: 'Guilds' },
  { name: 'mutable', label: 'Editable' },
];

const wearerFields: FieldItem[] = [
  { name: 'maxSupply', label: 'Max Supply' },
  { name: 'wearers', label: 'Wearers' },
];

const powersFields: FieldItem[] = [
  { name: 'authorities', label: 'Authorities' },
];

const responsibilitiesFields: FieldItem[] = [
  { name: 'responsibilities', label: 'Responsibilities' },
];

const revocationFields: FieldItem[] = [
  { name: 'eligibility', label: 'Eligibility' },
  { name: 'revocationsCriteria', label: 'Revocation Criteria' },
];

const deactivationFields: FieldItem[] = [
  { name: 'toggle', label: 'Toggle' },
  { name: 'deactivationsCriteria', label: 'Deactivation Criteria' },
];

interface EditModeProps {
  hatData: IHat;
  chainId: number;
  hatDetails: HatDetails;
  updateUnsavedData: (data: FormData) => void;
  treeId: string;
}
