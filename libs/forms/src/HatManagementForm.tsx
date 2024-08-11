'use client';

import { Button, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { CONTROLLER_TYPES, TRIGGER_OPTIONS } from '@hatsprotocol/constants';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { isMutable } from 'hats-utils';
import { useContractData } from 'hooks';
import _ from 'lodash';
import { useModuleDetails } from 'modules-hooks';
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
import { DetailsItem } from 'types';
import { ChakraNextLink } from 'ui';
import { explorerUrl } from 'utils';

import ClaimsHandler from './ClaimsHandler';
import {
  AddressInput,
  FormRowWrapper,
  LabelWithLink,
  RadioBox,
} from './components';

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
  onOpenModuleDrawer: () => void;
  setIsStandAloneHatterDeploy: (value: boolean) => void;
}
const HatManagementForm = ({
  title,
  formName,
  radioBoxConfig,
  inputConfig,
  criteriaConfig,
  onOpenModuleDrawer,
  setIsStandAloneHatterDeploy,
}: HatManagementFormProps) => {
  const { chainId, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  const { watch, control, setValue, getValues } = _.pick(hatForm, [
    'watch',
    'control',
    'setValue',
    'getValues',
  ]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const items = watch?.(formName);
  const isActionManual = watch?.(radioBoxConfig.name);
  const controllerInput = getValues?.(`${_.toLower(title)}-input`);

  // TODO is extended controller working here? was removed in above context I think
  const { eligibility, extendedEligibility, extendedToggle, toggle } = _.pick(
    selectedHat,
    ['eligibility', 'extendedEligibility', 'extendedToggle', 'toggle'],
  );
  const extendedController =
    title === CONTROLLER_TYPES.eligibility
      ? extendedEligibility
      : extendedToggle;
  const controller =
    title === CONTROLLER_TYPES.eligibility ? eligibility : toggle;

  const { details: moduleDetails } = useModuleDetails({
    address: controllerInput,
    chainId,
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

  const newAddress = watch?.(title) || controllerInput;

  // ? better way to handle checking "manual/automatic" radio box?
  useEffect(() => {
    if (moduleDetails && title === CONTROLLER_TYPES.eligibility) {
      setValue?.('isEligibilityManual', TRIGGER_OPTIONS.AUTOMATICALLY, {
        shouldDirty: true,
      });
    }
    if (moduleDetails && title === CONTROLLER_TYPES.toggle) {
      setValue?.('isToggleManual', TRIGGER_OPTIONS.AUTOMATICALLY, {
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleDetails]);

  if (!hatForm) return null;

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
            localForm={hatForm}
            options={options}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <Icon as={BsShieldLock} boxSize={4} mt='2px' />
          <Stack>
            <AddressInput
              name={`${_.toLower(title)}`}
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
              localForm={hatForm}
              isDisabled={!isMutable(selectedHat)}
              chainId={chainId}
              originalValue={extendedController?.id || controller}
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
                    <Text size='sm' variant='gray'>
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
        {title === CONTROLLER_TYPES.eligibility &&
          extendedController?.isContract &&
          isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
            <ClaimsHandler
              localForm={hatForm}
              onOpenModuleDrawer={onOpenModuleDrawer}
              setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
            />
          )}
        <FormRowWrapper>
          <Icon as={BsListTask} boxSize={4} mt='2px' />
          <Stack>
            <HStack fontSize='sm'>
              <Text variant='lightMedium'>{criteriaConfig.label}</Text>
              <Text variant='light'>optional</Text>
            </HStack>
            <Text variant='light'>{criteriaConfig.description}</Text>
            {fields.map((field, index) => (
              <LabelWithLink
                key={field.id}
                localForm={hatForm}
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
    </form>
  );
};

export default HatManagementForm;
