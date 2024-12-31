'use client';

import {
  EMPTY_FORM_VALUES,
  FALLBACK_ADDRESS,
  MUTABILITY,
  TRIGGER_OPTIONS,
} from '@hatsprotocol/constants';
import { combineAuthorities } from 'hats-utils';
import {
  useDebounce,
  useHatGuildRoles,
  useHatSnapshotRoles,
  useToast,
} from 'hooks';
import {
  filter,
  find,
  includes,
  isEmpty,
  keys,
  omit,
  pick,
  pickBy,
  reject,
  remove,
} from 'lodash';
import { useAncillaryModules } from 'modules-hooks';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FieldItem, FormData, FormFieldKeys } from 'types';
import { fieldsAreDirty, getDirtyFields } from 'utils';
import { Hex } from 'viem';

import { useSelectedHat } from './SelectedHatContext';
import { useTreeForm } from './TreeFormContext';

export interface IHatFormContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any> | null;
  formValues: Partial<FormData> | undefined;
  isLoading: boolean;
  setFormLoading: (loading: boolean) => void;
  handleSave: (sendToast?: boolean) => void;
  handleRemoveHat: () => void;
  handleClearChanges: () => void;
  getDirtyFieldsForAccordion: (fieldsArray: FieldItem[]) => string[];
}

export const HatFormContext = createContext<IHatFormContext>({
  localForm: null,
  formValues: undefined,
  isLoading: false,
  setFormLoading: () => {},
  handleSave: () => {},
  handleRemoveHat: () => {},
  handleClearChanges: () => {},
  getDirtyFieldsForAccordion: () => [],
});

export const HatFormContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    chainId,
    orgChartTree,
    storedData,
    setStoredData,
    removeHat,
    onOpenTreeDrawer,
    onCloseHatDrawer,
    // guildData,
    snapshotData,
    isLoading: treeIsLoading,
  } = useTreeForm();
  const {
    selectedHat,
    selectedOnchainHat,
    selectedOnchainHatDetails,
    isDraft,
    hatLoading,
  } = useSelectedHat();
  const toast = useToast();
  const localForm = useForm({
    mode: 'onChange',
  });
  const { watch, reset } = pick(localForm, ['watch', 'reset', 'setValue']);

  const { modulesAuthorities, isLoading: isLoadingModulesAuthorities } =
    useAncillaryModules({
      id: selectedHat?.id,
      chainId,
      editMode: false,
      tree: orgChartTree,
    });
  // const { data: guildRoles, isLoading: isLoadingGuildRoles } = useHatGuildRoles(
  //   {
  //     hatId: selectedHat?.id,
  //     guildData,
  //     chainId,
  //   },
  // );
  const { data: snapshotRoles, isLoading: isLoadingSnapshotRoles } =
    useHatSnapshotRoles({
      hatId: selectedHat?.id,
      spaces: snapshotData,
      chainId,
    });

  const [formLoading, setFormLoading] = useState(false);
  const formName = useDebounce<string>(watch?.('name', ''));
  const formDescription = useDebounce<string>(watch?.('description', ''));
  const formGuilds = useDebounce<string[]>(watch?.('guilds', []));
  const formSpaces = useDebounce<string[]>(watch?.('spaces', []));
  const formImageUri = useDebounce<string | undefined>(watch?.('imageUri', ''));
  const formImageUrl = watch('imageUrl');
  const formEligibility = useDebounce<Hex | undefined>(
    watch('eligibility', FALLBACK_ADDRESS),
  );
  const formEligibilityInput = watch('eligibility-input', '');
  const formToggle = useDebounce<Hex | undefined>(
    watch('toggle', FALLBACK_ADDRESS),
  );
  const formToggleInput = watch('toggle-input', '');
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
      'eligibility-input': formEligibilityInput,
      toggle: formToggle,
      'toggle-input': formToggleInput,
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
      formEligibilityInput,
      formToggle,
      formToggleInput,
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
  } = pick(selectedOnchainHatDetails, [
    'name',
    'description',
    'guilds',
    'spaces',
    'responsibilities',
    'authorities',
    'eligibility',
    'toggle',
  ]);
  const { maxSupply, eligibility, toggle, mutable, imageUrl, details } = pick(
    selectedOnchainHat,
    ['maxSupply', 'eligibility', 'toggle', 'mutable', 'imageUrl', 'details'],
  );

  const combinedAuthorities = useMemo(() => {
    if (
      isLoadingModulesAuthorities ||
      // isLoadingGuildRoles ||
      isLoadingSnapshotRoles
    ) {
      return undefined;
    }

    if (isDraft) {
      return initialAuthorities;
    }

    // mesh authorities from details with automatic authorities
    const { data: authorities } = combineAuthorities({
      authorities: initialAuthorities,
      guildRoles: [],
      spaces: snapshotRoles,
      modulesAuthorities,
    });
    return authorities;
  }, [
    initialAuthorities,
    // guildRoles,
    snapshotRoles,
    modulesAuthorities,
    isDraft,
    isLoadingModulesAuthorities,
    // isLoadingGuildRoles,
    isLoadingSnapshotRoles,
  ]);

  // get default form values
  const defaultFormValues = useMemo<FormData>(() => {
    if (
      isDraft ||
      isLoadingModulesAuthorities ||
      // isLoadingGuildRoles ||
      isLoadingSnapshotRoles
    ) {
      return EMPTY_FORM_VALUES;
    }

    return {
      id: selectedHat?.id || '0x',
      maxSupply,
      eligibility,
      'eligibility-input': eligibility,
      toggle,
      'toggle-input': toggle,
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
      authorities: combinedAuthorities ?? [],
      responsibilities: initialResponsibilities ?? [],
      guilds: initialGuilds ?? [],
      spaces: initialSpaces ?? [],
      wearers: [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    initialResponsibilities,
    initialGuilds,
    initialSpaces,
    isDraft,
    // guildRoles,
    snapshotRoles,
    treeIsLoading,
    hatLoading,
    isLoadingModulesAuthorities,
    // isLoadingGuildRoles,
    isLoadingSnapshotRoles,
    // ! modulesAuthorities, causes infinite re-render
  ]);

  // set initial form values
  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      const matchingHat = find(storedData, { id: selectedHat?.id });

      if (
        matchingHat &&
        !isEmpty(remove(keys(matchingHat), (key: string) => key === 'id'))
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

  // get dirty fields, doesn't include address inputs
  const dirtyFields = getDirtyFields(debouncedFormValues, defaultFormValues);
  const getDirtyFieldsForAccordion = useCallback(
    (fieldsArray: FieldItem[]) => fieldsAreDirty(fieldsArray, dirtyFields),
    [dirtyFields],
  );

  // form actions
  const handleSave = useCallback(
    (sendToast: boolean = true) => {
      const matchingHat = find(storedData, ['id', selectedHat?.id]);

      const dirtyValues = getDirtyFields(
        debouncedFormValues,
        defaultFormValues,
        false, // include address inputs when storing data so it's resurfaced in the form
      );
      const dirtyFormValues = pickBy(
        debouncedFormValues,
        (__: unknown, key: FormFieldKeys) => includes(dirtyValues, key),
      );

      // remove storedData values when resetting to default values
      const resetValues = filter(
        keys(matchingHat),
        (key: string) => !includes(dirtyValues, key) && !includes(['id'], key),
      );

      const matchingHatWithValues = {
        ...omit(matchingHat, resetValues),
        ...dirtyFormValues,
        id: selectedHat?.id,
      };

      const updatedHats = reject(storedData, {
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
    const updateData = reject(storedData, { id: selectedHat?.id });
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
      setFormLoading,
      isLoading:
        formLoading ||
        isLoadingModulesAuthorities ||
        hatLoading ||
        treeIsLoading ||
        // isLoadingGuildRoles ||
        isLoadingSnapshotRoles,

      // helpers
      getDirtyFieldsForAccordion,

      // actions
      handleSave,
      handleRemoveHat,
      handleClearChanges,
    }),
    [
      // form state
      localForm,
      debouncedFormValues,
      formLoading,
      setFormLoading,
      isLoadingModulesAuthorities,
      hatLoading,
      treeIsLoading,
      // isLoadingGuildRoles,
      isLoadingSnapshotRoles,

      // helpers
      getDirtyFieldsForAccordion,

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
