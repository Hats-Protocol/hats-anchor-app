'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { compact, flatten, map, toLower, uniqBy } from 'lodash';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IconType } from 'react-icons/lib';
import { CouncilData, CouncilFormData, StepProps } from 'types';
import { Skeleton } from 'ui';
import { getKnownEligibilityModule, logger } from 'utils';
import { Hex } from 'viem';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

const RadioCardSkeleton = () => (
  <div className='flex cursor-pointer rounded-lg border border-gray-200 px-6 py-4'>
    <div className='flex w-full items-center gap-3'>
      <Skeleton className='h-4 w-4 rounded-full' />
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-6 w-6' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-64' />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingTokensStep = () => (
  <div className='mx-auto flex w-full flex-col space-y-8'>
    {/* Header */}
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-6 w-6' />
        <Skeleton className='h-8 w-48' />
      </div>
    </div>

    {/* Token Requirement Selection */}
    <div className='space-y-4'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-64' />
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <RadioCardSkeleton />
        <RadioCardSkeleton />
      </div>
    </div>

    {/* Token Input Fields */}
    <div className='grid grid-cols-2 gap-8'>
      <div className='w-full space-y-2'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='w-full space-y-2'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>
    </div>

    {/* Next Button */}
    <div className='flex justify-end py-6'>
      <Skeleton className='h-10 w-32' />
    </div>
  </div>
);

export function TokensStep({ onNext }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit, availableTokens, councilsData } = useCouncilForm();
  const { watch: councilFormWatch, getValues: councilFormGetValues, reset: councilFormReset } = councilForm;
  const localForm = useForm();
  const { setValue, handleSubmit, reset, watch } = localForm;
  const { eligibilityRequirements } = councilFormWatch();
  logger.info('eligibilityRequirements in token step', eligibilityRequirements);

  const { existingId } = eligibilityRequirements.erc20;
  logger.info('existingId', existingId);

  const tokenRequirement = watch('eligibilityRequirements.erc20');
  logger.info('tokenRequirement', tokenRequirement);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'tokens', eligibilityRequirements);

  logger.info('councilsData', councilsData);
  // Group token requirements from existing councils

  const existingTokenRequirements = useMemo(() => {
    const rawCouncilsWithTokenRequirements = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc20',
      );
    });
    logger.info('rawCouncilsWithTokenRequirements', rawCouncilsWithTokenRequirements);

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

    logger.info('tokenRequirementsWithCouncilData', tokenRequirementsWithCouncilData);
    return tokenRequirementsWithCouncilData;
  }, [councilsData]);

  logger.info('existingTokenRequirements', existingTokenRequirements);

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = useMemo(
    () =>
      compact([
        ...existingTokenRequirements.map((requirement) => {
          logger.info('requirement', requirement);
          const token = availableTokens.find(
            (t) =>
              toLower(t.address) === toLower(requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.address || ''),
          );

          // Skip if we don't have valid token information
          if (!token || !requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.amount) {
            return null;
          }

          return {
            value: `${requirement?.councils?.[0]?.eligibilityRequirements?.erc20?.address}`,
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

  // Add useEffect to set initial values when component mounts
  useEffect(() => {
    if (isLoading) return;

    const { erc20 } = eligibilityRequirements;
    const initialValues = {
      eligibilityRequirements: {
        erc20: {
          existingId: erc20.existingId || 'new',
          amount: erc20.amount || 0,
          address: erc20.address || '',
        },
      },
    };

    reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, eligibilityRequirements]);

  if (isLoading) {
    return <LoadingTokensStep />;
  }
  // console.log('localForm', localForm.getValues('tokenRequirement'), tokenOptions);

  return (
    <Form {...localForm}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={handleSubmit(submitForm)}>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <GemIcon />
            <h2 className='text-2xl font-bold'>Hold Tokens</h2>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <h3 className='font-bold'>Which token requirement should Council Members meet?</h3>
            </div>
          </div>

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
              isDisabled={!canEdit}
            />
          )}
        </div>

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
              disabled={!canEdit || watch('eligibilityRequirements.erc20.existingId') !== 'new'}
              tooltip='The minimum amount of tokens that Council Members must hold'
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='eligibilityRequirements.erc20.address'
              label='Token Type'
              variant='councils'
              localForm={localForm}
              options={availableTokens}
              isDisabled={!canEdit || watch('eligibilityRequirements.erc20.existingId') !== 'new'}
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
