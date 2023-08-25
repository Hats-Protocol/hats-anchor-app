import { Box, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaKey, FaRegListAlt } from 'react-icons/fa';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, TRIGGER_OPTIONS, ZERO_ADDRESS } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import HatBasicsForm from '@/forms/HatBasicsForm';
import HatManagementForm from '@/forms/HatManagementForm';
import HatWearerForm from '@/forms/HatWearerForm';
import ItemDetailsForm from '@/forms/ItemDetailsForm';
import useDebounce from '@/hooks/useDebounce';
import { isTopHat } from '@/lib/hats';
import { DetailsItem, FieldItem, FormData } from '@/types';

const EditMode = ({
  unsavedData,
  updateUnsavedData,
  setIsLoading,
}: EditModeProps) => {
  const { chainId, storedData, selectedHat, selectedHatDetails } =
    useTreeForm();
  const {
    name: initialName,
    description: initialDescription,
    guilds: initialGuilds,
    responsibilities: initialResponsibilities,
    authorities: initialAuthorities,
    eligibility: initialEligibility,
    toggle: initialToggle,
  } = _.pick(selectedHatDetails, [
    'name',
    'description',
    'guilds',
    'responsibilities',
    'authorities',
    'eligibility',
    'toggle',
  ]);
  const { maxSupply, eligibility, toggle, mutable, imageUrl, imageUri } =
    _.pick(selectedHat, [
      'maxSupply',
      'eligibility',
      'toggle',
      'mutable',
      'imageUrl',
      'imageUri',
    ]);

  const defaultFormValues = useMemo<FormData>(
    () => ({
      id: selectedHat?.id || '0x',
      maxSupply,
      eligibility,
      toggle,
      mutable: mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
      imageUrl: imageUrl ?? '',
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
      selectedHat?.id,
      maxSupply,
      eligibility,
      toggle,
      mutable,
      imageUrl,
      initialEligibility,
      initialToggle,
      initialName,
      initialDescription,
      initialAuthorities,
      initialResponsibilities,
      initialGuilds,
    ],
  );
  // console.log(defaultFormValues);

  const localForm = useForm({
    mode: 'onChange',
  });

  const { watch, reset } = localForm;

  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);
      // console.log(matchingHat);

      if (matchingHat) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };
      }

      // console.log(formValues);
      reset(formValues);
    };

    if (selectedHat?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, selectedHat?.id, reset]);

  const allFormData = watch();

  const prevAllFormData = useRef<any>(allFormData);
  // console.log(prevAllFormData.current);

  const getDirtyFields = useCallback(() => {
    return (Object.keys(defaultFormValues) as Array<keyof FormData>).filter(
      (key) =>
        JSON.stringify(defaultFormValues[key]) !==
        JSON.stringify(allFormData[key]),
    );
  }, [allFormData, defaultFormValues]);
  // console.log(getDirtyFields());

  const getDirtyFieldsForAccordion = (fieldsArray: FieldItem[]) => {
    const fields = getDirtyFields();

    return fieldsArray
      .filter((field) => fields.includes(field.name))
      .map((field) => field.label);
  };

  const [newImageURI, setNewImageURI] = useState('');

  const eligibilityFormValue = useDebounce<Hex>(
    watch('eligibility', eligibility || ZERO_ADDRESS),
  );
  const toggleFormValue = useDebounce<Hex>(
    watch('toggle', toggle || ZERO_ADDRESS),
  );

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibilityFormValue,
    chainId: 1,
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: toggleFormValue,
    chainId: 1,
  });

  useEffect(() => {
    if (isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress) {
      setIsLoading(true);
    } else setIsLoading(false);
  }, [
    isLoadingEligibilityResolvedAddress,
    isLoadingToggleResolvedAddress,
    setIsLoading,
  ]);

  useEffect(() => {
    if (toggleResolvedAddress !== unsavedData?.toggle) {
      updateUnsavedData({
        toggle: toggleResolvedAddress || allFormData.toggle,
      } as FormData);
    }
    if (eligibilityResolvedAddress !== unsavedData?.eligibility) {
      updateUnsavedData({
        eligibility: eligibilityResolvedAddress || allFormData.eligibility,
      } as FormData);
    }
  }, [eligibilityResolvedAddress, toggleResolvedAddress]);

  useEffect(() => {
    if (!_.isEqual(prevAllFormData.current, allFormData)) {
      // console.log('dirty');
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
  }, [allFormData, getDirtyFields]);

  useEffect(() => {
    if (newImageURI && newImageURI !== imageUri) {
      const dirtyFieldKeys = getDirtyFields();

      if (!dirtyFieldKeys.includes('newImageUri')) {
        dirtyFieldKeys.push('newImageUri');
      }

      const dirtyFormData = dirtyFieldKeys.reduce(
        (acc: FormData, key: keyof FormData) => {
          if (key === 'newImageUri') {
            acc.imageUrl = newImageURI;
          } else {
            acc[key] = allFormData[key];
          }
          return acc;
        },
        {} as FormData,
      );

      updateUnsavedData(dirtyFormData);
    }
  }, [newImageURI, imageUri]);

  if (!selectedHat) return null;

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
          <Text>
            {selectedHat && hatIdDecimalToIp(BigInt(selectedHat?.id))}
          </Text>
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
              setNewImageURI={setNewImageURI}
            />
          </Stack>
        </Accordion>

        {!isTopHat(selectedHat) && (
          <Accordion
            title='Wearers'
            subtitle='Individual, multisig, DAO, or contract addresses that hold this token.'
            dirtyFieldsList={getDirtyFieldsForAccordion(wearerFields)}
          >
            <Stack spacing={4}>
              <HatWearerForm
                localForm={localForm}
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
  updateUnsavedData: (data: FormData) => void;
  unsavedData: FormData | null;
  setIsLoading: (isLoading: boolean) => void;
}
