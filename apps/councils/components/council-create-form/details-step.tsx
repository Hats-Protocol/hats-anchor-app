'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { Input, Select, Textarea } from '../../../../libs/forms/src/components';

import { useCouncilForm } from '../../contexts/council-form';

const CHAIN_OPTIONS = [
  { value: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg' },
  { value: 'base', label: 'Base', icon: '/chains/base.svg' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg' },
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

        <Select
          name='chain'
          label='Choose a chain'
          localForm={form}
          subLabel='The chain you deploy the Safe Multisig and Hats Council to.'
          options={{ required: true }}
        >
          {CHAIN_OPTIONS.map((chain) => (
            <option key={chain.value} value={chain.value}>
              <HStack spacing={2}>
                <Image
                  src={chain.icon}
                  alt={chain.label}
                  width={20}
                  height={20}
                />
                <Text>{chain.label}</Text>
              </HStack>
            </option>
          ))}
        </Select>

        <Textarea
          name='councilDescription'
          label='Council description'
          localForm={form}
          helperText='Add a short description or some links you want all council members to see.'
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
