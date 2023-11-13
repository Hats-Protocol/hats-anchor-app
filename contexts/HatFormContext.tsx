import _ from 'lodash';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

import {
  EMPTY_FORM_VALUES,
  FALLBACK_ADDRESS,
  MUTABILITY,
  TRIGGER_OPTIONS,
} from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useToast from '@/hooks/useToast';
import { formatImageUrl } from '@/lib/general';
import {
  DetailsItem,
  DirtyFormData,
  FieldItem,
  FormData,
  FormWearer,
} from '@/types';

import { useTreeForm } from './TreeFormContext';

export interface IHatFormContext {
  localForm: UseFormReturn<any> | null;
  formValues: Partial<FormData> | undefined;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  unsavedData: Partial<FormData> | undefined;
  setUnsavedData: Dispatch<SetStateAction<Partial<FormData> | undefined>>;
  handleSave: (sendToast?: boolean) => void;
  handleRemoveHat: () => void;
  handleClearChanges: () => void;
  getDirtyFieldsForAccordion: (fieldsArray: FieldItem[]) => string[];
  // newImageUri?: string;
  // setNewImageUri: (uri: string) => void;
}

type FormFieldData = Exclude<
  keyof FormData,
  'id' | 'parentId' | 'adminId' | 'newImageUri'
>;

export const HatFormContext = createContext<IHatFormContext>({
  localForm: null,
  formValues: undefined,
  isLoading: false,
  setIsLoading: () => {},
  unsavedData: undefined,
  setUnsavedData: () => {},
  handleSave: () => {},
  handleRemoveHat: () => {},
  handleClearChanges: () => {},
  getDirtyFieldsForAccordion: () => [],
  // newImageUri: '',
  // setNewImageUri: () => {},
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

  const [isLoading, setIsLoading] = useState(false);
  const [unsavedData, setUnsavedData] = useState<Partial<FormData> | undefined>(
    undefined,
  );
  const { onOpen: onOpenTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);
  const { onClose: onCloseHatDrawer } = _.pick(hatDisclosure, ['onClose']);

  const localForm = useForm({
    mode: 'onChange',
  });
  const { watch, reset } = localForm;

  const formName = useDebounce<string>(watch?.('name'));
  const formDescription = useDebounce<string>(watch?.('description'));
  const formGuilds = useDebounce<string[]>(watch?.('guilds'));
  const formImageUri = useDebounce<string | undefined>(watch?.('imageUri', ''));
  const formImageUrl = formatImageUrl(formImageUri) || '';
  const formEligibility = useDebounce<Hex | undefined>(
    watch('eligibility', FALLBACK_ADDRESS),
  );
  const formToggle = useDebounce<Hex | undefined>(
    watch('toggle', FALLBACK_ADDRESS),
  );
  const formResponsibilities = watch?.('responsibilities');
  const formAuthorities = watch?.('authorities');
  const formMaxSupply = watch?.('maxSupply');
  const formMutable = watch?.('mutable');
  const formIsEligibilityManual = watch?.('isEligibilityManual');
  const formIsToggleManual = watch?.('isToggleManual');
  const formRevocationsCriteria = watch?.('revocationsCriteria');
  const formDeactivationsCriteria = watch?.('deactivationsCriteria');
  const formWearers = watch?.('wearers');

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
  console.log(debouncedFormValues);

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
  const {
    maxSupply,
    eligibility,
    toggle,
    mutable,
    imageUrl,
    imageUri,
    details,
  } = _.pick(selectedOnchainHat, [
    'maxSupply',
    'eligibility',
    'toggle',
    'mutable',
    'imageUrl',
    'imageUri',
    'details',
  ]);

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

  useEffect(() => {
    let formValues = defaultFormValues;

    const initialFormValues = () => {
      console.log('resetting form values', defaultFormValues);
      const matchingHat = _.find(storedData, ['id', selectedHat?.id]);

      if (
        matchingHat &&
        !_.isEmpty(_.remove(_.keys(matchingHat), (key) => key === 'id'))
      ) {
        formValues = {
          ...defaultFormValues,
          ...matchingHat,
        };
        console.log('reset for plaintext details');
        // reset default values for plaintext details
        reset(defaultFormValues);

        console.log('reset for stored data values');
        // reset with stored data values
        reset(formValues, { keepDefaultValues: true });
        return;
      }

      console.log('reset without stored data values');
      reset(formValues);
    };

    if (selectedHat?.id && chainId && defaultFormValues && storedData) {
      initialFormValues();
    }
  }, [chainId, defaultFormValues, storedData, selectedHat?.id, reset]);

  const prevAllFormData = useRef<FieldValues>(
    debouncedFormValues as Partial<FormData>,
  );

  const getDirtyFields = useCallback(() => {
    const excludeKeys = ['id', 'parentId', 'newImageUri', 'adminId'];
    const keys = _.reject(_.keys(defaultFormValues), (k) =>
      _.includes(excludeKeys, k),
    );
    console.log(keys);
    return _.filter(keys, (key: FormFieldData) => {
      console.log(key);

      return (
        JSON.stringify(defaultFormValues[key]) !==
          JSON.stringify(debouncedFormValues[key]) ||
        debouncedFormValues[key] === 'New Hat'
      );
    });
  }, [debouncedFormValues, defaultFormValues]);
  console.log('getDirtyFields', getDirtyFields());

  const getDirtyFieldsForAccordion = useCallback(
    (fieldsArray: FieldItem[]) => {
      const fields = getDirtyFields();

      return fieldsArray
        .filter((field) => fields.includes(field.name))
        .map((field) => field.label);
    },
    [getDirtyFields],
  );

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: formEligibility || eligibility,
    chainId: 1,
    enabled:
      !!(formEligibility || eligibility) && formEligibility?.includes('.eth'),
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: formToggle || toggle,
    chainId: 1,
    enabled: !!(formToggle || toggle) && formToggle?.includes('.eth'),
  });

  useEffect(() => {
    if (isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress) {
      // setIsLoading(true);
    }
    // } else setIsLoading(false);
  }, [
    isLoadingEligibilityResolvedAddress,
    isLoadingToggleResolvedAddress,
    // setIsLoading,
  ]);

  useEffect(() => {
    const updatedControllers: Partial<FormData> = {};
    if (toggleResolvedAddress !== unsavedData?.toggle) {
      updatedControllers.toggle = _.toLower(
        toggleResolvedAddress || debouncedFormValues.toggle,
      ) as Hex;
    }
    if (eligibilityResolvedAddress !== unsavedData?.eligibility) {
      updatedControllers.eligibility = _.toLower(
        eligibilityResolvedAddress || debouncedFormValues.eligibility,
      ) as Hex;
    }

    if (!_.isEmpty(_.keys(updatedControllers)))
      setUnsavedData((prev: Partial<FormData> | undefined) => ({
        ...prev,
        ...updatedControllers,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibilityResolvedAddress, toggleResolvedAddress]);

  // useEffect(() => {
  //   if (!_.isEqual(prevAllFormData.current, allFormData)) {
  //     const dirtyFieldKeys = getDirtyFields();
  //     const dirtyFormData = dirtyFieldKeys.reduce(
  //       (acc: Partial<FormData>, key: keyof FormData) => {
  //         (acc[key] as
  //           | DetailsItem[]
  //           | FormWearer[]
  //           | string
  //           | string[]
  //           | undefined) = allFormData[key];
  //         return acc;
  //       },
  //       {} as Partial<FormData>,
  //     );

  //     setUnsavedData(dirtyFormData);
  //     prevAllFormData.current = allFormData;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [allFormData, getDirtyFields]);

  // set new image uri in unsavedData
  // useEffect(() => {
  //   if (newImageUri && newImageUri !== imageUri) {
  //     const dirtyFieldKeys = getDirtyFields();

  //     if (!dirtyFieldKeys.includes('newImageUri')) {
  //       dirtyFieldKeys.push('newImageUri');
  //     }

  //     const dirtyFormData = dirtyFieldKeys.reduce(
  //       (acc: DirtyFormData, key: keyof FormData) => {
  //         if (key === 'newImageUri') {
  //           acc.imageUrl = newImageUri;
  //         } else {
  //           acc[key as string] = allFormData[key];
  //         }
  //         return acc;
  //       },
  //       {},
  //     );

  //     setUnsavedData(dirtyFormData);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [newImageUri, imageUri]);

  const handleSave = useCallback(
    (sendToast: boolean = true) => {
      console.log('handleSave', unsavedData);
      if (unsavedData) {
        const updatedHats = _.map(storedData, (hat: Partial<FormData>) =>
          hat.id === selectedHat?.id
            ? { ...hat, ...unsavedData, id: selectedHat?.id }
            : hat,
        );

        if (!_.find(updatedHats, ['id', selectedHat?.id])) {
          updatedHats.push({ ...unsavedData, id: selectedHat?.id || '0x' });
        }

        setStoredData?.(updatedHats);
        setUnsavedData(undefined);

        if (sendToast) {
          toast.success({
            title: 'Saved',
            description: 'Your changes have been saved.',
            duration: 1500,
          });
        }
      }
    },
    [selectedHat?.id, setStoredData, storedData, toast, unsavedData],
  );

  const handleRemoveHat = useCallback(() => {
    if (!selectedHat) return;
    removeHat?.(selectedHat?.id);
    setUnsavedData(undefined);
  }, [removeHat, selectedHat]);

  const handleClearChanges = useCallback(() => {
    if (!selectedHat) return;
    const updateData = _.reject(storedData, { id: selectedHat?.id });
    setStoredData?.(updateData);
    setUnsavedData(undefined);
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
      // local state
      isLoading,
      setIsLoading,
      unsavedData,
      setUnsavedData,
      // newImageUri,
      // setNewImageUri,

      // helpers
      getDirtyFieldsForAccordion,

      // actions
      handleSave,
      handleRemoveHat,
      handleClearChanges,
    }),
    [
      localForm,
      debouncedFormValues,
      isLoading,
      unsavedData,
      // newImageUri,
      getDirtyFieldsForAccordion,
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
