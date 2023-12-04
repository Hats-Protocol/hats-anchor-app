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
} from '@/utils/constants';
import useDebounce from '@/hooks/useDebounce';
import useToast from '@/hooks/useToast';
import {
  fieldsAreDirty as fieldsAreDirtyHandler,
  getDirtyFields,
} from '@/lib/form';
import { FieldItem, FormData, FormFieldKeys } from '@/types';

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
  const formSpaces = useDebounce<string[]>(watch?.('spaces', []));
  const formImageUri = useDebounce<string | undefined>(watch?.('imageUri', ''));
  const formImageUrl = watch('imageUrl');
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
      spaces: formSpaces,
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
      formSpaces,
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
    spaces: initialSpaces,
    responsibilities: initialResponsibilities,
    authorities: initialAuthorities,
    eligibility: initialEligibility,
    toggle: initialToggle,
  } = _.pick(selectedOnchainHatDetails, [
    'name',
    'description',
    'guilds',
    'spaces',
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
      spaces: initialSpaces ?? [],
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
    initialSpaces,
    isDraft,
  ]);

  // set initial form values
  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);

      if (
        matchingHat &&
        !_.isEmpty(_.remove(_.keys(matchingHat), (key: string) => key === 'id'))
      ) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };

        reset(defaultFormValues);

        reset(formValues, { keepDefaultValues: true });
        return;
      }

      reset(formValues);
    };

    if (selectedHat?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, selectedHat?.id, reset]);

  // get dirty fields
  const dirtyFields = getDirtyFields(debouncedFormValues, defaultFormValues);
  const getDirtyFieldsForAccordion = useCallback(
    (fieldsArray: FieldItem[]) =>
      fieldsAreDirtyHandler(fieldsArray, dirtyFields),
    [dirtyFields],
  );

  // resolve controller addresses, could this be done in the input instead?
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

  // form actions
  const handleSave = useCallback(
    (sendToast: boolean = true) => {
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);

      const dirtyValues = getDirtyFields(
        debouncedFormValues,
        defaultFormValues,
      );
      const dirtyFormValues = _.pickBy(
        debouncedFormValues,
        (__: any, key: FormFieldKeys) => _.includes(dirtyValues, key),
      );

      // remove storedData values when resetting to default values
      const resetValues = _.filter(
        _.keys(matchingHat),
        (key: any) => !_.includes(dirtyValues, key) && !_.includes(['id'], key),
      );

      const matchingHatWithValues = {
        ..._.omit(matchingHat, resetValues),
        ...dirtyFormValues,
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
