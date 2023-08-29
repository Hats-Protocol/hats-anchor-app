import { Box, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { BsKey, BsListUl } from 'react-icons/bs';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import {
  EMPTY_FORM_VALUES,
  FALLBACK_ADDRESS,
  FORM_FIELDS,
  MUTABILITY,
  TRIGGER_OPTIONS,
} from '@/constants';
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
  setUnsavedData,
  setIsLoading,
}: EditModeProps) => {
  const { chainId, storedData, selectedHat, onchainHats, selectedHatDetails } =
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

  const defaultFormValues = useMemo<FormData>(() => {
    const draft = !_.includes(_.map(onchainHats, 'id'), selectedHat?.id);

    if (draft) {
      return EMPTY_FORM_VALUES;
    }

    return {
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
    };
  }, [
    selectedHat?.id,
    onchainHats,
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
  ]);

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });

  const { watch, reset } = localForm;

  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);

      if (matchingHat) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };
        reset(formValues, { keepDefaultValues: true });
        return;
      }

      reset(formValues);
    };

    if (selectedHat?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, selectedHat?.id, reset]);

  const allFormData = watch();

  const prevAllFormData = useRef<any>(allFormData);

  const getDirtyFields = useCallback(() => {
    return (Object.keys(defaultFormValues) as Array<keyof FormData>).filter(
      (key) =>
        JSON.stringify(defaultFormValues[key]) !==
          JSON.stringify(allFormData[key]) || allFormData[key] === 'New Hat',
    );
  }, [allFormData, defaultFormValues]);

  const getDirtyFieldsForAccordion = (fieldsArray: FieldItem[]) => {
    const fields = getDirtyFields();

    return fieldsArray
      .filter((field) => fields.includes(field.name))
      .map((field) => field.label);
  };

  const [newImageURI, setNewImageURI] = useState('');

  const eligibilityFormValue = useDebounce<Hex | undefined>(
    watch('eligibility', eligibility || FALLBACK_ADDRESS),
  );
  const toggleFormValue = useDebounce<Hex | undefined>(
    watch('toggle', toggle || FALLBACK_ADDRESS),
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
    const updatedControllers: Partial<FormData> = {};
    if (toggleResolvedAddress !== unsavedData?.toggle) {
      updatedControllers.toggle = toggleResolvedAddress || allFormData.toggle;
    }
    if (eligibilityResolvedAddress !== unsavedData?.eligibility) {
      updatedControllers.eligibility =
        eligibilityResolvedAddress || allFormData.eligibility;
    }

    if (!_.isEmpty(_.keys(updatedControllers)))
      setUnsavedData((prev: Partial<FormData> | undefined) => ({
        ...prev,
        ...updatedControllers,
      }));
  }, [eligibilityResolvedAddress, toggleResolvedAddress]);

  useEffect(() => {
    if (!_.isEqual(prevAllFormData.current, allFormData)) {
      const dirtyFieldKeys = getDirtyFields();
      const dirtyFormData = dirtyFieldKeys.reduce(
        (acc: Partial<FormData>, key: keyof FormData) => {
          (acc[key] as DetailsItem[] | string | string[] | undefined) =
            allFormData[key];
          return acc;
        },
        {} as Partial<FormData>,
      );

      setUnsavedData(dirtyFormData);
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
            if (!acc || key) return acc;
            acc[key] = allFormData[key];
          }
          return acc;
        },
        {} as FormData,
      );

      setUnsavedData(dirtyFormData);
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
          <Text fontSize={32} fontWeight='medium'>
            {selectedHat && hatIdDecimalToIp(BigInt(selectedHat?.id))}
          </Text>
          <Text>All changes are local until you deploy to chain.</Text>
        </Stack>

        <Accordion
          title='Hat Basics'
          subtitle='The fundamentals of the hat, including name, image, and supply.'
          dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.basics)}
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
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.wearer)}
          >
            <Stack spacing={4}>
              <HatWearerForm
                localForm={localForm}
                setUnsavedData={setUnsavedData}
              />
            </Stack>
          </Accordion>
        )}

        <Accordion
          title='Powers'
          subtitle='Permissions and rights that are controlled by wearers of this hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.powers)}
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='authorities'
              title='PERMISSIONS'
              subtitle='Actions this hat enables its wearer to take.'
              label='Permission'
              Icon={BsKey}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Responsibilities'
          subtitle='Specific work that wearers of this hat will be held accountable for.'
          dirtyFieldsList={getDirtyFieldsForAccordion(
            FORM_FIELDS.responsibilities,
          )}
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='responsibilities'
              title='RESPONSIBILITIES'
              label='Responsibility'
              subtitle='Tasks and responsibilities associated with this hat.'
              Icon={BsListUl}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Revocation & Eligibility'
          subtitle='The people or logic that determine when a wearer should have a hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.revocation)}
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
                subLabel: 'How should revocation from wearers be handled?',
              }}
              inputConfig={{
                label: 'ACCOUNTABILITY',
                description:
                  'The address of the smart contract containing the logic about when a wearer should and should not have this hat.',
              }}
              criteriaConfig={{
                label: 'QUALIFICATIONS',
                description:
                  'A written description of the logic in the Accountability Contract',
                addButtonLabel: 'Qualification',
              }}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Deactivation & Reactivation'
          subtitle='The people and contracts that control this Hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.deactivation)}
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
                  'How should hat deactivation and reactivation be handled?',
              }}
              inputConfig={{
                label: 'DEACTIVATOR',
                description:
                  'The address of the person or group that can manually deactivate and reactive this hat',
              }}
              criteriaConfig={{
                label: 'QUALIFICATIONS',
                description:
                  'List any criteria that should be considered in the process of deactivating or reactivating this hat',
                addButtonLabel: 'Criterion',
              }}
            />
          </Stack>
        </Accordion>
      </Stack>
    </Box>
  );
};

export default EditMode;

interface EditModeProps {
  setUnsavedData: Dispatch<SetStateAction<Partial<FormData> | undefined>>;
  unsavedData: Partial<FormData> | undefined;
  setIsLoading: (isLoading: boolean) => void;
}
