'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { Organization, useOrganization } from 'hooks';
import { pick, toLower, toNumber } from 'lodash';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IconType } from 'react-icons/lib';
import { CouncilFormData, StepProps } from 'types';
import { Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

interface TokenRequirement {
  id: string;
  councilName: string;
  minimum: string;
  tokenAddress: string;
}

const createTokenRequirementsSelect = (organization: Organization | null | undefined) => {
  const requirements = new Map<string, TokenRequirement>();

  organization?.councils?.forEach((council) => {
    // TODO lookup eligibility chain for council to get associated module addresses
    const { eligibilityRequirements } = council.creationForm;
    if (!eligibilityRequirements) return; // TODO is eligibilityRequirements a string here?
    const { address, amount } = pick(eligibilityRequirements?.erc20, ['address', 'amount']);
    if (address && amount) {
      const key = `${address}-${amount}`;

      // const existingKey = requirements.get(key);
      // if (existingKey) {
      //   existingKey.councilName = `${existingKey.councilName}, ${council.creationForm.councilName || ''}`;
      // } else {
      //   requirements.set(key, {
      //     id: council.creationForm.id,
      //     councilName: council.creationForm.councilName || '',
      //     minimum: amount,
      //     tokenAddress: address,
      //   });
      // }
    }
  });

  return Array.from(requirements.values());
};

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

export function TokensStep({ onNext, draftId }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const { watch: councilFormWatch, getValues: councilFormGetValues, reset: councilFormReset } = councilForm;
  const localForm = useForm();
  const { setValue, handleSubmit, reset } = localForm;
  const { eligibilityRequirements, organizationName } = councilFormWatch();
  const { watch } = localForm;
  const tokenRequirement = watch('tokenRequirement');
  logger.info('tokenRequirement', tokenRequirement);

  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isLoading: isOrgLoading } = useOrganization(orgName);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'tokens', eligibilityRequirements);

  // Group token requirements from existing councils
  const existingTokenRequirements = createTokenRequirementsSelect(organization);

  // Initialize selected option based on current token requirement
  // const [selectedOption, setSelectedOption] = useState(() => {
  //   const currentTokenAddress = getValues('tokenRequirement.address.value');
  //   const currentMinimum = getValues('tokenRequirement.minimum');

  //   return existingTokenRequirements.some(
  //     (req) => req.tokenAddress === currentTokenAddress && req.minimum === currentMinimum?.toString(),
  //   )
  //     ? `${currentTokenAddress}-${currentMinimum}`
  //     : 'new';
  // });

  // console.log('existingTokenRequirements', existingTokenRequirements, selectedOption);

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = useMemo(
    () => [
      ...existingTokenRequirements.map((requirement) => {
        const token = availableTokens.find((t) => toLower(t.address) === toLower(requirement.tokenAddress));
        return {
          value: `${requirement.tokenAddress}-${requirement.minimum}`,
          label: `Hold ${requirement.minimum} ${token?.symbol || 'tokens'}`,
          icon: GemIcon as IconType,
          description: requirement.councilName,
          onSelect: () => {
            setValue('tokenType', `${requirement.tokenAddress}-${requirement.minimum}`);
            setValue('tokenRequirement.minimum', parseFloat(requirement.minimum));
            setValue('tokenRequirement.address', { value: requirement.tokenAddress, label: token?.symbol || '' });
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
          setValue('tokenType', 'new');
          setValue('tokenRequirement.minimum', 0);
          setValue('tokenRequirement.address', { value: '', label: '' });
        },
      },
    ],
    [existingTokenRequirements, availableTokens],
  );

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      logger.info('submitForm', data);
      councilFormReset({ ...councilFormGetValues(), ...data });
      // reset(data);
      await onNext();
    },
    [reset, onNext],
  );

  useEffect(() => {
    if (isLoading || isOrgLoading) return;
    const { address, amount } = pick(eligibilityRequirements?.erc20, ['address', 'amount']);
    const token = availableTokens.find((t) => toLower(t.address) === toLower(address || undefined));
    const existingTokenReq = existingTokenRequirements.find(
      (req) => req.tokenAddress === address && toNumber(req.minimum) === toNumber(amount),
    );

    const initialValues = {
      tokenRequirement: {
        minimum: amount ?? 0,
        address: {
          value: address ?? '',
          label: token?.symbol ?? '',
        },
      },
      tokenType: existingTokenReq ? `${address}-${amount}` : 'new',
    };

    reset(initialValues);
  }, [isLoading, isOrgLoading]);

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

          {isOrgLoading ? (
            <div className='flex flex-col gap-4'>
              <RadioCardSkeleton />
              <RadioCardSkeleton />
            </div>
          ) : (
            <RadioCard name='tokenType' localForm={localForm} options={tokenOptions} isDisabled={!canEdit} />
          )}
        </div>

        <div className='grid grid-cols-2 gap-8'>
          <div className='w-full space-y-2'>
            <TokenNumberInput
              name='tokenRequirement.minimum'
              label='Token Limit'
              variant='councils'
              form={localForm}
              options={{
                required: true,
                min: 0,
              }}
              step={1}
              disabled={!canEdit || watch('tokenType') !== 'new'}
              tooltip='The minimum amount of tokens that Council Members must hold'
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='tokenRequirement.address'
              label='Token Type'
              variant='councils'
              localForm={localForm}
              options={availableTokens}
              isDisabled={!canEdit || watch('tokenType') !== 'new'}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!tokenRequirement?.minimum || !tokenRequirement?.address?.value || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
