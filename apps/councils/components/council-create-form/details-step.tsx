'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { Input, Select, Textarea } from 'forms';
import Image from 'next/image';

import { ChainSelect } from '../chain-select';

const CHAIN_OPTIONS = [
  { value: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg' },
  { value: 'base', label: 'Base', icon: '/chains/base.png' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg' },
  { value: 'polygon', label: 'Polygon', icon: '/chains/polygon.svg' },
  { value: 'ethereum', label: 'Ethereum', icon: '/chains/ethereum.svg' },
  { value: 'gnosis', label: 'Gnosis', icon: '/chains/gnosis.png' },
  { value: 'celo', label: 'Celo', icon: '/chains/celo.svg' },
  { value: 'sepolia', label: 'Sepolia', icon: '/chains/sepolia.png' },
];

export function DetailsStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading } = useCouncilForm();

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={6}
      height='100%'
      as='form'
      onSubmit={form.handleSubmit(onNext)}
    >
      <Stack spacing={6} flex={1}>
        <Text fontSize='xl' fontWeight='semibold'>
          Create your first Council
        </Text>

        <Input
          name='organizationName'
          label='Organization name'
          localForm={form}
          subLabel='The name of the organization you are creating councils for.'
          placeholder='DAO or Company Name'
          options={{ required: true }}
        />

        <Input
          name='councilName'
          label='Council name'
          localForm={form}
          subLabel='The name of your first council. You can add further councils later.'
          placeholder='Council Name'
          options={{ required: true }}
        />

        <Stack spacing={2}>
          <Text fontWeight='medium'>Choose a chain</Text>
          <Text fontSize='sm' color='gray.600'>
            The chain you deploy the Safe Multisig and Hats Council to.
          </Text>
          <ChainSelect
            name='chain'
            form={form}
            options={CHAIN_OPTIONS}
            placeholder='Select a chain'
          />
        </Stack>

        <Textarea
          name='councilDescription'
          label='Council description'
          localForm={form}
          subLabel='Add a short description or some links you want all council members to see.'
          placeholder='Bylaws, policies or important links'
          headerNote='Optional'
        />
      </Stack>

      <HStack justify='flex-end' py={6}>
        <Button
          type='submit'
          bg='blue.50'
          color='blue.500'
          _hover={{ bg: 'blue.100' }}
          size='md'
          rightIcon={<ChevronRightIcon />}
          isDisabled={!form.formState.isValid}
          px={4}
          py={2}
          borderRadius='md'
        >
          Set Signer Threshold
        </Button>
      </HStack>
    </Stack>
  );
}
