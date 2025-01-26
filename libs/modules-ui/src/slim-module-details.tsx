'use client';

import { TOKEN_ARG_TYPES } from '@hatsprotocol/constants';
import { Modal, useEligibility, useOverlay } from 'contexts';
import { ModuleArgsForm } from 'forms';
import { filter, find, get, includes, isEmpty, map, toLower } from 'lodash';
import { useCallModuleFunction, useModuleDetails } from 'modules-hooks';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';
import { LinkObject, ModuleFunction } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Link, Tooltip } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

// import ModuleParameters from './ModuleParameters';

export const SlimModuleDetails = ({ type }: { type: string }) => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat } = useEligibility();

  const controllerAddress = useMemo(() => get(selectedHat, toLower(type)), [selectedHat, type]);

  const { details: moduleDetails, parameters } = useModuleDetails({
    address: controllerAddress,
    chainId,
  });

  const formMethods = useForm({
    mode: 'onChange',
  });

  const { formState, handleSubmit } = formMethods;

  const tokenAddress = get(
    find(parameters, (param: any) => includes(TOKEN_ARG_TYPES, param.displayType)),
    'value',
  );

  const moduleActions = filter(get(moduleDetails, 'writeFunctions'), (fn: ModuleFunction) =>
    includes(fn.roles, 'public'),
  );

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const handleFunctionCall = (func: any) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ 'functionCall-module': true });
    } else {
      if (!moduleDetails?.implementationAddress) return;
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: controllerAddress,
        func,
        args: [],
      });
    }
  };

  const onSubmit = (values: any) => {
    if (!moduleDetails?.implementationAddress) return;
    // eslint-disable-next-line no-console
    callModuleFunction({
      moduleId: moduleDetails.implementationAddress,
      instance: controllerAddress,
      func: selectedFunction || undefined,
      args: values,
    });
  };

  if (!moduleDetails || !chainId) return null;

  return (
    <Accordion type='multiple'>
      {!isEmpty(moduleActions) && (
        <>
          <Modal
            name='functionCall-module'
            title={`Interact with ${moduleDetails?.name} (${formatAddress(controllerAddress)})`}
          >
            <div className='flex flex-col gap-4'>
              {get(selectedFunction, 'description') && <p className='mb-3'>{get(selectedFunction, 'description')}</p>}
              <div className='flex flex-col gap-4'>
                {get(selectedFunction, 'args') && (
                  <ModuleArgsForm
                    selectedModuleArgs={get(selectedFunction, 'args', [])}
                    tokenAddress={tokenAddress as Hex}
                    localForm={formMethods}
                    hideIcon
                    noMargin
                  />
                )}
              </div>

              <div className='mt-4 flex justify-end'>
                <Button variant='outline' onClick={() => setModals?.({})}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={!formState.isValid}
                  // isLoading={isModuleLoading}
                >
                  {get(selectedFunction, 'label')}
                </Button>
              </div>
            </div>
          </Modal>

          <AccordionItem value='actions'>
            <AccordionTrigger className='p-0'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xs font-medium uppercase'>Module Actions</h3>
              </div>
            </AccordionTrigger>

            <AccordionContent className='p-0'>
              <div className='flex flex-wrap gap-2'>
                {map(moduleActions, (action: any) => (
                  <Tooltip label={action.description} key={action.label}>
                    <Button variant='outline-blue' size='sm' onClick={() => handleFunctionCall(action)}>
                      {action.label}
                    </Button>
                  </Tooltip>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </>
      )}

      <AccordionItem value='details'>
        <AccordionTrigger className='p-0'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs font-medium uppercase'>Module Details</h3>
          </div>
        </AccordionTrigger>

        <AccordionContent className='p-0'>
          <div className='flex flex-col gap-2'>
            {map(moduleDetails.details, (detail: string) => (
              <p key={detail} className='text-sm'>
                {detail}
              </p>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* {!_.isEmpty(parameters) && (
        <AccordionItem border='0'>
          <AccordionButton px={0}>
            <HStack>
              <Heading size='xs' variant='medium' textTransform='uppercase'>
                Module Parameters
              </Heading>
              <AccordionIcon />
            </HStack>
          </AccordionButton>
          <AccordionPanel px={0}>
            <ModuleParameters parameters={parameters} chainId={chainId} />
          </AccordionPanel>
        </AccordionItem>
      )} */}

      <AccordionItem value='links'>
        <AccordionTrigger className='p-0'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs font-medium uppercase'>Module Links</h3>
          </div>
        </AccordionTrigger>

        <AccordionContent className='p-0'>
          <div className='flex flex-col gap-4'>
            {map(moduleDetails.links, (link: LinkObject) => (
              <Link href={link.link || '#'} key={link.link} isExternal>
                <div className='flex justify-between'>
                  <p className='text-sm'>{link.label}</p>
                  <FiExternalLink className='h-4 w-4 text-gray-500' />
                </div>
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
