import _ from 'lodash';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

import {
  EMPTY_FORM_VALUES,
  FALLBACK_ADDRESS,
  MUTABILITY,
  TRIGGER_OPTIONS,
} from '@/constants';
import useDebounce from '@/hooks/useDebounce';
// import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useToast from '@/hooks/useToast';
import { formatImageUrl } from '@/lib/general';
import {
  // DetailsItem,
  // DirtyFormData,
  FieldItem,
  FormData,
  // FormWearer,
} from '@/types';

import { useTreeForm } from './TreeFormContext';

export interface IHatFormContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any> | null;
  formValues: Partial<FormData> | undefined;
  isLoading: boolean;
  handleSave: (sendToast?: boolean) => void;
  handleRemoveHat: () => void;
  handleClearChanges: () => void;
  getDirtyFieldsForAccordion: (fieldsArray: FieldItem[]) => string[];
  eligibilityResolvedAddress: Hex | undefined;
  toggleResolvedAddress: Hex | undefined;
}

type FormFieldData = Exclude<
  keyof FormData,
  'id' | 'parentId' | 'adminId' | 'newImageUri'
>;

export const HatFormContext = createContext<IHatFormContext>({
  localForm: null,
  formValues: undefined,
  isLoading: false,
  handleSave: () => {},
  handleRemoveHat: () => {},
  handleClearChanges: () => {},
  getDirtyFieldsForAccordion: () => [],
  eligibilityResolvedAddress: undefined,
  toggleResolvedAddress: undefined,
});

export const HatFormContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    chainId,
    storedData,
    setStoredData,
    selectedHat,
    selectedOnchainHat,
    selectedOnchainHatDetails,
    isDraft,
    treeDisclosure,
    hatDisclosure,
    removeHat,
  } = useTreeForm();
  const toast = useToast();

  const { onOpen: onOpenTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);
  const { onClose: onCloseHatDrawer } = _.pick(hatDisclosure, ['onClose']);

  const localForm = useForm({
    mode: 'onChange',
  });
  const { watch, reset } = localForm;

  const formName = useDebounce<string>(watch?.('name', ''));
  const formDescription = useDebounce<string>(watch?.('description', ''));
  const formGuilds = useDebounce<string[]>(watch?.('guilds', []));
  const formImageUri = useDebounce<string | undefined>(watch?.('imageUri', ''));
  const formImageUrl = formatImageUrl(formImageUri) || '';
  const formEligibility = useDebounce<Hex | undefined>(
    watch('eligibility', FALLBACK_ADDRESS),
  );
  const formToggle = useDebounce<Hex | undefined>(
    watch('toggle', FALLBACK_ADDRESS),
  );
  const formResponsibilities = watch?.('responsibilities', []);
  const formAuthorities = watch?.('authorities', []);
  const formMaxSupply = watch?.('maxSupply', '1');
  const formMutable = watch?.('mutable', 'Mutable');
  const formIsEligibilityManual = watch?.('isEligibilityManual', 'Manually');
  const formIsToggleManual = watch?.('isToggleManual', 'Manually');
  const formRevocationsCriteria = watch?.('revocationsCriteria', []);
  const formDeactivationsCriteria = watch?.('deactivationsCriteria', []);
  const formWearers = watch?.('wearers', []);

  const debouncedFormValues = useMemo(
    () => ({
      name: formName,
      description: formDescription,
      imageUri: formImageUri,
      imageUrl: formImageUrl,
      guilds: formGuilds,
      eligibility: formEligibility,
      toggle: formToggle,
      responsibilities: formResponsibilities,
      authorities: formAuthorities,
      maxSupply: formMaxSupply,
      mutable: formMutable,
      isEligibilityManual: formIsEligibilityManual,
      isToggleManual: formIsToggleManual,
      revocationsCriteria: formRevocationsCriteria,
      deactivationsCriteria: formDeactivationsCriteria,
      wearers: formWearers,
    }),
    [
      formName,
      formDescription,
      formImageUri,
      formImageUrl,
      formGuilds,
      formEligibility,
      formToggle,
      formResponsibilities,
      formAuthorities,
      formMaxSupply,
      formMutable,
      formIsEligibilityManual,
      formIsToggleManual,
      formRevocationsCriteria,
      formDeactivationsCriteria,
      formWearers,
    ],
  );

  const {
    name: initialName,
    description: initialDescription,
    guilds: initialGuilds,
    responsibilities: initialResponsibilities,
    authorities: initialAuthorities,
    eligibility: initialEligibility,
    toggle: initialToggle,
  } = _.pick(selectedOnchainHatDetails, [
    'name',
    'description',
    'guilds',
    'responsibilities',
    'authorities',
    'eligibility',
    'toggle',
  ]);
  const { maxSupply, eligibility, toggle, mutable, imageUrl, details } = _.pick(
    selectedOnchainHat,
    ['maxSupply', 'eligibility', 'toggle', 'mutable', 'imageUrl', 'details'],
  );

  // get default form values
  const defaultFormValues = useMemo<FormData>(() => {
    if (isDraft) {
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
      name: initialName && initialName !== '' ? initialName : details || '',
      description: initialDescription || '',
      authorities: initialAuthorities ?? [],
      responsibilities: initialResponsibilities ?? [],
      guilds: initialGuilds ?? [],
      wearers: [],
    };
  }, [
    selectedHat?.id,
    maxSupply,
    eligibility,
    toggle,
    mutable,
    imageUrl,
    details,
    initialEligibility?.criteria,
    initialEligibility?.manual,
    initialToggle?.criteria,
    initialToggle?.manual,
    initialName,
    initialDescription,
    initialAuthorities,
    initialResponsibilities,
    initialGuilds,
    isDraft,
  ]);

  // set initial form values
  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);

      if (
        matchingHat &&
        !_.isEmpty(_.remove(_.keys(matchingHat), (key) => key === 'id'))
      ) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };
        // eslint-disable-next-line no-console
        console.log('reset for plaintext details');
        // reset default values for plaintext details
        reset(defaultFormValues);

        // eslint-disable-next-line no-console
        console.log('reset for stored data values');
        // reset with stored data values
        reset(formValues, { keepDefaultValues: true });
        return;
      }

      // eslint-disable-next-line no-console
      console.log('reset without stored data values');
      reset(formValues);
    };

    if (selectedHat?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, selectedHat?.id, reset]);

  // get dirty fields
  const getDirtyFields = useCallback(() => {
    const excludeKeys = ['id', 'parentId', 'newImageUri', 'adminId'];
    const keys = _.reject(_.keys(defaultFormValues), (k) =>
      _.includes(excludeKeys, k),
    );
    return _.filter(keys, (key: FormFieldData) => {
      return (
        JSON.stringify(defaultFormValues[key]) !==
          JSON.stringify(debouncedFormValues[key]) ||
        debouncedFormValues[key] === 'New Hat'
      );
    });
  }, [debouncedFormValues, defaultFormValues]);
  // console.log('getDirtyFields', getDirtyFields());

  const getDirtyFieldsForAccordion = useCallback(
    (fieldsArray: FieldItem[]) => {
      const fields = getDirtyFields();

      return _.map(
        _.filter(fieldsArray, (field) => _.includes(fields, field.name)),
        'label',
      );
    },
    [getDirtyFields],
  );

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: debouncedFormValues?.eligibility,
    chainId: 1,
    enabled:
      !!debouncedFormValues?.eligibility &&
      debouncedFormValues?.eligibility?.includes('.eth'),
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: debouncedFormValues?.toggle,
    chainId: 1,
    enabled:
      !!debouncedFormValues?.toggle &&
      debouncedFormValues?.eligibility?.includes('.eth'),
  });

  const handleSave = useCallback(
    (sendToast: boolean = true) => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);
      // combine with getDirtyFields
      const dirtyValues = _.pickBy(debouncedFormValues, (value, key) => {
        if (
          (defaultFormValues.imageUrl === '' && value === '') ||
          key === 'imageUri'
        ) {
          return false;
        }

        if (key === 'imageUrl') {
          return (
            formatImageUrl(debouncedFormValues.imageUri) !==
              defaultFormValues.imageUrl &&
            debouncedFormValues.imageUri !== undefined
          );
        }

        return (
          JSON.stringify(value) !==
          JSON.stringify(defaultFormValues[key as FormFieldData])
        );
      });
      const matchingHatWithValues = {
        ...matchingHat,
        ...dirtyValues,
        id: selectedHat?.id,
      };

      const updatedHats = _.reject(storedData, {
        id: selectedHat?.id,
      });

      updatedHats.push(matchingHatWithValues);

      setStoredData?.(updatedHats);
      reset();

      if (sendToast) {
        toast.success({
          title: 'Saved',
          description: 'Your changes have been saved.',
          duration: 1500,
        });
      }
    },
    [
      selectedHat?.id,
      setStoredData,
      storedData,
      toast,
      debouncedFormValues,
      defaultFormValues,
      reset,
    ],
  );

  const handleRemoveHat = useCallback(() => {
    if (!selectedHat) return;
    removeHat?.(selectedHat?.id);
  }, [removeHat, selectedHat]);

  const handleClearChanges = useCallback(() => {
    if (!selectedHat) return;
    const updateData = _.reject(storedData, { id: selectedHat?.id });
    setStoredData?.(updateData);
    onOpenTreeDrawer?.();
    onCloseHatDrawer?.();
  }, [
    onCloseHatDrawer,
    onOpenTreeDrawer,
    selectedHat,
    setStoredData,
    storedData,
  ]);

  const returnValue = useMemo(
    () => ({
      // form state
      localForm,
      formValues: debouncedFormValues,
      isLoading:
        isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress,

      // helpers
      getDirtyFieldsForAccordion,
      eligibilityResolvedAddress: eligibilityResolvedAddress || undefined,
      toggleResolvedAddress: toggleResolvedAddress || undefined,

      // actions
      handleSave,
      handleRemoveHat,
      handleClearChanges,
    }),
    [
      // form state
      localForm,
      debouncedFormValues,
      isLoadingEligibilityResolvedAddress,
      isLoadingToggleResolvedAddress,

      // helpers
      getDirtyFieldsForAccordion,
      eligibilityResolvedAddress,
      toggleResolvedAddress,

      // actions
      handleSave,
      handleRemoveHat,
      handleClearChanges,
    ],
  );

  return (
    <HatFormContext.Provider value={returnValue}>
      {children}
    </HatFormContext.Provider>
  );
};

export const useHatForm = () => useContext(HatFormContext);
