import {
  Button,
  HStack,
  Icon,
  Slide,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
  BsFileCode,
  BsListTask,
  BsPersonBadge,
  BsPlusCircle,
  BsShieldLock,
} from 'react-icons/bs';
import { FaCode } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';

import AddressInput from '@/components/AddressInput';
import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import RadioBox from '@/components/atoms/RadioBox';
import Suspender from '@/components/atoms/Suspender';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import { MODULE_TYPES, TRIGGER_OPTIONS } from '@/constants';
import { useHatForm } from '@/contexts/HatFormContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useContractData from '@/hooks/useContractData';
import useModuleDetails from '@/hooks/useModuleDetails';
import { explorerUrl } from '@/lib/chains';
import { isMutable } from '@/lib/hats';
import { DetailsItem } from '@/types';

import ClaimsHandler from './ClaimsHandler';

const ModuleDrawer = dynamic(() => import('@/components/ModuleDrawer'), {
  loading: () => <Suspender />,
});

const options = [
  { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
  {
    value: TRIGGER_OPTIONS.AUTOMATICALLY,
    label: TRIGGER_OPTIONS.AUTOMATICALLY,
  },
];

interface HatManagementFormProps {
  title: string;
  formName: string;
  radioBoxConfig: {
    name: string;
    label: string;
    subLabel: string;
  };
  inputConfig: {
    label: string;
    description: ReactNode[];
  };
  criteriaConfig: {
    label: string;
    description: string;
  };
}
const HatManagementForm = ({
  title,
  formName,
  radioBoxConfig,
  inputConfig,
  criteriaConfig,
}: HatManagementFormProps) => {
  const { selectedHat, chainId, editMode } = useTreeForm();
  const { localForm, eligibilityResolvedAddress, toggleResolvedAddress } =
    useHatForm();
  const { watch, control, setValue, getValues } = _.pick(localForm, [
    'watch',
    'control',
    'setValue',
    'getValues',
  ]);
  const [isStandaloneHatterDeploy, setIsStandAloneHatterDeploy] =
    useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const items = watch?.(formName);
  const isActionManual = watch?.(radioBoxConfig.name);
  const moduleAddress = getValues?.(title);

  const { extendedEligibility, extendedToggle } = _.pick(selectedHat, [
    'extendedEligibility',
    'extendedToggle',
  ]);
  const actionResolvedAddress =
    title === MODULE_TYPES.eligibility
      ? eligibilityResolvedAddress
      : toggleResolvedAddress;
  const extendedController =
    title === MODULE_TYPES.eligibility ? extendedEligibility : extendedToggle;

  const showActionResolvedAddress =
    actionResolvedAddress && actionResolvedAddress !== extendedController?.id;

  const { details: moduleDetails } = useModuleDetails({
    address: moduleAddress,
  });
  const { data: contractData } = useContractData({
    chainId,
    address: extendedController?.id,
    enabled: !!extendedController?.isContract,
    editMode,
  });

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    const itemsArray = getValues?.(formName);
    setInputLink(itemsArray[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      setValue?.(`${formName}.${currentItemIndex}.link`, inputLink);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  const {
    onOpen: onOpenModuleDrawer,
    onClose: onCloseModuleDrawer,
    isOpen: isOpenModuleDrawer,
  } = useDisclosure();

  const newAddress = watch?.(title);

  // ? better way to handle checking "manual/automatic" radio box?
  useEffect(() => {
    if (moduleDetails) {
      setValue?.('isEligibilityManual', TRIGGER_OPTIONS.AUTOMATICALLY, {
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleDetails]);

  if (!localForm) return null;

  return (
    <form>
      <Stack spacing={8}>
        <FormRowWrapper>
          <Icon as={GrEdit} boxSize={4} mt='2px' />
          <RadioBox
            name={radioBoxConfig.name}
            label={radioBoxConfig.label}
            subLabel={radioBoxConfig.subLabel}
            // defaultValue={moduleDetails && TRIGGER_OPTIONS.AUTOMATICALLY}
            localForm={localForm}
            options={options}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <Icon as={BsShieldLock} boxSize={4} mt='2px' />
          <Stack>
            <AddressInput
              name={_.toLower(title)}
              label={`${inputConfig.label} ${
                isActionManual === TRIGGER_OPTIONS.MANUALLY
                  ? 'ADDRESS'
                  : 'MODULE'
              }`}
              subLabel={
                isActionManual === TRIGGER_OPTIONS.MANUALLY
                  ? inputConfig.description[0]
                  : inputConfig.description[1]
              }
              localForm={localForm}
              showResolvedAddress={Boolean(showActionResolvedAddress)}
              isDisabled={!isMutable(selectedHat)}
              resolvedAddress={String(actionResolvedAddress)}
            />
            <HStack spacing={8}>
              {(moduleDetails || contractData) && (
                <ChakraNextLink
                  href={`${explorerUrl(chainId)}/address/${
                    newAddress || extendedController?.id
                  }`}
                  isExternal
                >
                  <HStack maxW='200px'>
                    {extendedController?.isContract || moduleDetails ? (
                      <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
                    ) : (
                      <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
                    )}
                    <Text color='gray.500' fontSize='sm'>
                      {contractData?.contractName || moduleDetails?.name}
                    </Text>
                  </HStack>
                </ChakraNextLink>
              )}
              {isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
                <Button
                  leftIcon={<BsFileCode />}
                  variant='outline'
                  fontWeight='normal'
                  onClick={onOpenModuleDrawer}
                >
                  Create new Module
                </Button>
              )}
            </HStack>
          </Stack>
        </FormRowWrapper>
        {title === MODULE_TYPES.eligibility &&
          extendedController?.isContract &&
          isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
            <ClaimsHandler
              localForm={localForm}
              onOpenModuleDrawer={onOpenModuleDrawer}
              setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
            />
          )}
        <FormRowWrapper>
          <Icon as={BsListTask} boxSize={4} mt='2px' />
          <Stack>
            <HStack fontSize='sm'>
              <Text color='blackAlpha.800' fontWeight='medium'>
                {criteriaConfig.label}
              </Text>
              <Text color='blackAlpha.600'>optional</Text>
            </HStack>
            <Text color='blackAlpha.700'>{criteriaConfig.description}</Text>
            {fields.map((field, index) => (
              <LabelWithLink
                key={field.id}
                localForm={localForm}
                title={title}
                handleRemoveItem={() => remove(index)}
                handleEdit={() => handleEdit(index)}
                handleSave={handleSave}
                inputLink={inputLink}
                setInputLink={setInputLink}
                isLinkValid={isLinkValid}
                setIsLinkValid={setIsLinkValid}
                labelName={`${formName}.${index}.label`}
                linkName={`${formName}.${index}.link`}
              />
            ))}
            <Button
              onClick={() => append({ link: '', label: '' })}
              isDisabled={items?.some((item: DetailsItem) => item.label === '')}
              gap={2}
              variant='outline'
              fontWeight='normal'
            >
              <BsPlusCircle />
              Add {items?.length ? 'another' : 'a'} Requirement
            </Button>
          </Stack>
        </FormRowWrapper>
      </Stack>

      <Slide
        direction='right'
        in={!!isOpenModuleDrawer}
        style={{ zIndex: 1001, width: '100%' }}
      >
        <ModuleDrawer
          onCloseModuleDrawer={onCloseModuleDrawer}
          isStandaloneHatterDeploy={isStandaloneHatterDeploy}
          title={title}
        />
      </Slide>
    </form>
  );
};

export default HatManagementForm;
