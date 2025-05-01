'use client';

import { chainsList } from '@hatsprotocol/config';
import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { compact, flatten, map, toLower, uniqBy } from 'lodash';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IconType } from 'react-icons/lib';
import { CouncilData, CouncilFormData, StepProps } from 'types';
import { getKnownEligibilityModule, logger } from 'utils';
import { Hex } from 'viem';

import { NextStepButton } from '../../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../../utils';
import { LoadingTokensStep, RadioCardSkeleton } from './tokens-skeletons';

export function TokensStep({ onNext }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit, availableTokens, councilsData } = useCouncilForm();
  const { watch: councilFormWatch, getValues: councilFormGetValues, reset: councilFormReset } = councilForm;
  const localForm = useForm();
  const { setValue, handleSubmit, watch } = localForm;
  const { eligibilityRequirements } = councilFormWatch();
  const chainId = councilForm.getValues('chain')?.value;

  const chainName = chainId ? chainsList[Number(chainId) as keyof typeof chainsList]?.name : '';

  const tokenRequirement = watch('eligibilityRequirements.erc20');

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'tokens', eligibilityRequirements);

  const existingTokenRequirements = useMemo(() => {
    const rawCouncilsWithTokenRequirements = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc20',
      );
    });

    // Filter out null/undefined requirements first
    const validRequirements = rawCouncilsWithTokenRequirements?.filter((requirement) => !!requirement);

    const councilsWithTokenRequirements = uniqBy(validRequirements, 'address');

    const tokenRequirementsWithCouncilData = councilsWithTokenRequirements
      .map((tokenRequirement) => {
        const associatedCouncils = councilsData?.filter((council) =>
          map(flatten(council.eligibilityRules), 'address').includes(tokenRequirement?.address || '0x'),
        ) as CouncilData[];

        // Only include requirements that have valid council data and ERC20 requirements
        if (
          associatedCouncils.length === 0 ||
          !associatedCouncils[0]?.eligibilityRequirements?.erc20?.address ||
          !associatedCouncils[0]?.eligibilityRequirements?.erc20?.amount
        ) {
          return null;
        }

        return {
          ...tokenRequirement,
          councils: associatedCouncils,
        };
      })
      .filter(Boolean); // Remove any null entries

    return tokenRequirementsWithCouncilData;
  }, [councilsData]);

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = useMemo(
    () =>
      compact([
        ...existingTokenRequirements.map((requirement) => {
          const token = availableTokens.find(
            (t) =>
              toLower(t.address) === toLower(requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.address || ''),
          );

          // Skip if we don't have valid token information
          if (!token || !requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.amount) {
            return null;
          }

          return {
            value: requirement?.address,
            label: `Hold ${requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.amount} ${token?.symbol || 'tokens'}`,
            icon: GemIcon as IconType,
            description: requirement?.councils?.[0]?.creationForm?.councilName,
            onSelect: () => {
              setValue(
                'eligibilityRequirements.erc20.amount',
                parseFloat(requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.amount || '0'),
              );
              setValue('eligibilityRequirements.erc20.address', {
                value: requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.address || '',
                label: token?.symbol || '',
              });
            },
          };
        }),
        {
          value: 'new',
          label: 'Create a new Token Limit',
          icon: FilePlus as IconType,
          description: 'Specify an amount of coins Council Members need to hold',
          onSelect: () => {
            // Only reset if switching from an existing requirement
            setValue('eligibilityRequirements.erc20.amount', 0);
            setValue('eligibilityRequirements.erc20.address', { value: '', label: '' });
            setValue('eligibilityRequirements.erc20.existingId', 'new');
          },
        },
      ]),
    [existingTokenRequirements, availableTokens, setValue],
  );

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // Get current council form values
      const currentValues = councilFormGetValues();

      // Merge the local form's eligibility requirements with existing council form data
      // preserving existing fields like 'required'
      const mergedValues = {
        ...currentValues,
        eligibilityRequirements: {
          ...currentValues.eligibilityRequirements,
          erc20: {
            ...currentValues.eligibilityRequirements?.erc20,
            ...data.eligibilityRequirements?.erc20,
          },
        },
      };

      // Reset council form with merged values
      councilFormReset(mergedValues);
      onNext();
    },
    [councilFormGetValues, councilFormReset, onNext],
  );

  // Set initial selection to first existing token requirement if available
  useEffect(() => {
    if (isLoading) return;
    if (!availableTokens?.length) return; // Wait for tokens to be available

    // Check if we have existing values with 'new' selected
    const currentErc20Values = councilForm.getValues('eligibilityRequirements.erc20');
    if (currentErc20Values?.existingId === 'new' && currentErc20Values?.address && currentErc20Values?.amount) {
      logger.info('Setting token selection to new with existing values');
      setValue('eligibilityRequirements.erc20.existingId', 'new');
      setValue('eligibilityRequirements.erc20.amount', currentErc20Values.amount);
      setValue('eligibilityRequirements.erc20.address', currentErc20Values.address);
      return;
    }

    // Only proceed with existing options if no selection has been made yet
    const currentExistingId = localForm.getValues('eligibilityRequirements.erc20.existingId');
    if (currentExistingId && currentExistingId !== 'new') return;

    // Get the first option that isn't the 'new' option
    const firstExistingOption = tokenOptions.find((option) => option && 'value' in option && option.value !== 'new');
    logger.info('First existing option found:', firstExistingOption);

    if (firstExistingOption) {
      logger.info('Setting token selection to:', firstExistingOption.value);
      localForm.setValue('eligibilityRequirements.erc20.existingId', firstExistingOption.value);
      firstExistingOption.onSelect();
    }
  }, [isLoading, localForm, tokenOptions, availableTokens, existingTokenRequirements, councilForm, setValue]);

  if (isLoading) {
    return <LoadingTokensStep />;
  }

  const getIsDisabled = (): boolean => {
    const currentExistingId = watch('eligibilityRequirements.erc20.existingId');
    return Boolean(!canEdit || (currentExistingId && currentExistingId !== 'new'));
  };

  return (
    <Form {...localForm}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={handleSubmit(submitForm)}>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <GemIcon />
            <h2 className='text-2xl font-bold'>Hold Tokens</h2>
          </div>
        </div>
        {existingTokenRequirements.length !== 0 && (
          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold'>Which token requirement should Council Members meet?</h3>
              </div>
            </div>
            <>
              {isLoading ? (
                <div className='flex flex-col gap-4'>
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                </div>
              ) : (
                <RadioCard
                  name='eligibilityRequirements.erc20.existingId'
                  localForm={localForm}
                  options={tokenOptions}
                  isDisabled={getIsDisabled()}
                />
              )}
            </>
          </div>
        )}

        <div className='grid grid-cols-2 gap-8'>
          <div className='w-full space-y-2'>
            <TokenNumberInput
              name='eligibilityRequirements.erc20.amount'
              label='Token Limit'
              variant='councils'
              form={localForm}
              options={{
                required: true,
                min: 0,
              }}
              step={1}
              disabled={getIsDisabled()}
              tooltip='The minimum amount of tokens that Council Members must hold'
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='eligibilityRequirements.erc20.address'
              label={`Token Type${chainName ? ` on ${chainName}` : ''}`}
              variant='councils'
              localForm={localForm}
              options={availableTokens}
              isDisabled={getIsDisabled()}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!tokenRequirement?.amount || !tokenRequirement?.address || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
