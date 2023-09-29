import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  HStack,
  Icon,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import _ from 'lodash';
import { ReactNode, Suspense, useMemo, useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import {
  BsFileCode,
  BsListUl,
  BsPlusCircle,
  BsShieldLock,
} from 'react-icons/bs';
import { GrEdit } from 'react-icons/gr';
import { Hex } from 'viem';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import Suspender from '@/components/atoms/Suspender';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import ModuleDrawer from '@/components/ModuleDrawer';
import { FALLBACK_ADDRESS, TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { isMutable } from '@/lib/hats';
import { DetailsItem, ModuleKind } from '@/types';

interface HatManagementFormProps {
  localForm: UseFormReturn<any>;
  address: Hex | undefined; // eligibility or toggle
  actionResolvedAddress?: Hex | null;
  title: ModuleKind;
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
  localForm,
  address,
  actionResolvedAddress,
  title,
  formName,
  radioBoxConfig,
  inputConfig,
  criteriaConfig,
}: HatManagementFormProps) => {
  const { watch, control, setValue, getValues } = localForm;
  const { selectedHat } = useTreeForm();
  const { modules } = useHatsModules();

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const items = watch(formName);
  const isActionManual = watch(radioBoxConfig.name);
  const moduleAddress = watch(title);

  const foundModule = useMemo(
    () =>
      _.find(
        Object.values(modules || {}),
        (module) => module.implementationAddress === moduleAddress,
      ),
    [modules, moduleAddress],
  );

  const showActionResolvedAddress =
    actionResolvedAddress && actionResolvedAddress !== address;

  const options = [
    { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
    {
      value: TRIGGER_OPTIONS.AUTOMATICALLY,
      label: TRIGGER_OPTIONS.AUTOMATICALLY,
    },
  ];

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    const itemsArray = getValues(formName);
    setInputLink(itemsArray[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      setValue(`${formName}.${currentItemIndex}.link`, inputLink);
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

  // const {
  //   onOpen: onOpenClaimsHatterDrawer,
  //   onClose: onCloseClaimsHatterDrawer,
  //   isOpen: isOpenClaimsHatterDrawer,
  // } = useDisclosure();

  const updateModuleAddress = (value: string) => {
    localForm.setValue(title, value);
  };

  return (
    <form>
      <Stack spacing={8}>
        <FormRowWrapper>
          <Icon as={GrEdit} boxSize={4} mt='2px' />
          <RadioBox
            name={radioBoxConfig.name}
            label={radioBoxConfig.label}
            subLabel={radioBoxConfig.subLabel}
            localForm={localForm}
            options={options}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <Icon as={BsShieldLock} boxSize={4} mt='2px' />
          <Stack>
            <AddressInput
              name={title}
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
              {foundModule && (
                <HStack>
                  <Icon as={BsFileCode} boxSize={4} color='gray.500' />
                  <Text color='blackAlpha.700' fontSize='sm'>
                    {foundModule.name}
                  </Text>
                </HStack>
              )}
              {isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
                <Button
                  leftIcon={<BsFileCode />}
                  variant='outline'
                  fontWeight='normal'
                  borderColor='blackAlpha.300'
                  onClick={onOpenModuleDrawer}
                >
                  Create new Module
                </Button>
              )}
            </HStack>
          </Stack>
        </FormRowWrapper>
        {/* <FormRowWrapper>
          <Icon as={BsPersonAdd} boxSize={4} mt='2px' />
          <Stack>
            <Text fontSize='sm' color='gray.500' mt={1}>
              To enable permissionless claiming of this hat, deploy a claims
              hatter contract and give that contract an admin hat in this tree.
            </Text>
            <Box>
              {isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
                <Button
                  leftIcon={<BsFileCode />}
                  variant='outline'
                  fontWeight='normal'
                  borderColor='blackAlpha.300'
                  onClick={onOpenClaimsHatterDrawer}
                >
                  Deploy Claims Hatter
                </Button>
              )}
            </Box>
          </Stack>
        </FormRowWrapper> */}
        <Stack>
          {address !== FALLBACK_ADDRESS && (
            <FormRowWrapper>
              <Icon as={BsListUl} boxSize={4} mt='3px' />
              <Stack>
                <HStack fontSize='sm'>
                  <Text color='blackAlpha.800' fontWeight='medium'>
                    {criteriaConfig.label}
                  </Text>
                  <Text color='blackAlpha.600'>optional</Text>
                </HStack>
                <Text color='blackAlpha.700'>{criteriaConfig.description}</Text>
              </Stack>
            </FormRowWrapper>
          )}
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
          <Box mb={2}>
            <Button
              onClick={() => append({ link: '', label: '' })}
              isDisabled={items?.some((item: DetailsItem) => item.label === '')}
              gap={2}
              variant='outline'
              borderColor='blackAlpha.300'
            >
              <BsPlusCircle />
              Add {items?.length ? 'another' : 'a'} Requirement
            </Button>
          </Box>
        </Stack>
      </Stack>

      <Drawer
        placement='right'
        onClose={() => {
          onCloseModuleDrawer?.();
        }}
        isOpen={!!isOpenModuleDrawer}
      >
        <DrawerContent background='cyan.50' maxW='43%' width='650px'>
          <DrawerBody pt={0}>
            <Suspense fallback={<Suspender />}>
              <ModuleDrawer
                onCloseModuleDrawer={onCloseModuleDrawer}
                updateModuleAddress={updateModuleAddress}
                title={title}
              />
            </Suspense>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </form>
  );
};

export default HatManagementForm;
