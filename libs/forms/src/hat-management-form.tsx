'use client';

import { CONTROLLER_TYPES, TRIGGER_OPTIONS } from '@hatsprotocol/constants';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { isMutable } from 'hats-utils';
import { pick, toLower } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import { ReactNode, useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { BsFileCode, BsListTask, BsPersonBadge, BsPlusCircle, BsShieldLock } from 'react-icons/bs';
import { FaCode } from 'react-icons/fa';
import { DetailsItem } from 'types';
import { Button, Link } from 'ui';
import { explorerUrl } from 'utils';

import { ClaimsHandler } from './claims-handler';
import { AddressInput, Form, FormRowWrapper, LabelWithLink } from './components';

const HatManagementForm = ({
  title,
  formName,
  radioBoxConfig,
  inputConfig,
  criteriaConfig,
  onOpenModuleDrawer,
  setIsStandAloneHatterDeploy,
}: HatManagementFormProps) => {
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  const { watch, control, setValue, getValues } = pick(hatForm, ['watch', 'control', 'setValue', 'getValues']);

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const items = watch?.(formName);
  const isActionManual = watch?.(radioBoxConfig.name);
  const controllerInput = getValues?.(`${toLower(title)}-input`);

  // TODO is extended controller working here? was removed in above context I think
  const { eligibility, toggle } = pick(selectedHat, ['eligibility', 'toggle']);

  const controller = title === CONTROLLER_TYPES.eligibility ? eligibility : toggle;

  const { details: moduleDetails } = useModuleDetails({
    address: controllerInput,
    chainId,
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
    <Form {...hatForm}>
      <form>
        <div className='space-y-8'>
          <FormRowWrapper noMargin>
            <BsShieldLock className='absolute -ml-8 mt-1 size-4' />

            <div className='max-w-[90%] space-y-2'>
              <AddressInput
                name={`${toLower(title)}`}
                label={`${inputConfig.label} ${isActionManual === TRIGGER_OPTIONS.MANUALLY ? 'ADDRESS' : 'MODULE'}`}
                subLabel={
                  isActionManual === TRIGGER_OPTIONS.MANUALLY ? inputConfig.description[0] : inputConfig.description[1]
                }
                localForm={hatForm}
                isDisabled={!isMutable(selectedHat)}
                chainId={chainId}
                originalValue={controller}
              />

              <div className='flex items-center gap-8'>
                {moduleDetails && (
                  <Link href={`${explorerUrl(chainId)}/address/${newAddress || controller}`} isExternal>
                    <div className='flex max-w-48 items-center gap-2'>
                      {moduleDetails ? (
                        <FaCode className='ml-2 h-4 w-4 text-gray-500' />
                      ) : (
                        <BsPersonBadge className='h-4 w-4 text-gray-500' />
                      )}
                      <p className='text-sm text-gray-500'>{moduleDetails?.name}</p>
                    </div>
                  </Link>
                )}

                <Button variant='outline' className='font-normal' onClick={onOpenModuleDrawer}>
                  <BsFileCode />
                  Add Module
                </Button>
              </div>
            </div>
          </FormRowWrapper>

          {title === CONTROLLER_TYPES.eligibility && isActionManual === TRIGGER_OPTIONS.AUTOMATICALLY && (
            <ClaimsHandler
              localForm={hatForm}
              onOpenModuleDrawer={onOpenModuleDrawer}
              setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
            />
          )}

          <FormRowWrapper noMargin>
            <BsListTask className='absolute -ml-8 mt-1 size-4' />
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <p className='text-sm'>{criteriaConfig.label}</p>

                <p className='text-sm text-gray-500'>optional</p>
              </div>

              <p className='text-sm text-gray-500'>{criteriaConfig.description}</p>
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

              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => append({ link: '', label: '' })}
                  disabled={items?.some((item: DetailsItem) => item.label === '')}
                  variant='outline'
                  className='font-normal'
                >
                  <BsPlusCircle />
                  Add {items?.length ? 'another' : 'a'} Requirement
                </Button>
              </div>
            </div>
          </FormRowWrapper>
        </div>
      </form>
    </Form>
  );
};

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

export { HatManagementForm };
