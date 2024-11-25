'use client';

import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Select,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import Image from 'next/image';

import { useCouncilForm } from '../../contexts/council-form';

const CHAIN_OPTIONS = [
  { value: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg' },
  { value: 'base', label: 'Base', icon: '/chains/base.svg' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg' },
];

export function DetailsStep({ onNext }: { onNext: () => void }) {
  const { formData, updateFormData, isLoading } = useCouncilForm();

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  return (
    <Stack spacing={6} height='100%'>
      <Stack spacing={6} flex={1}>
        <Text fontSize='xl' fontWeight='semibold'>
          Create your first Council
        </Text>

        <FormControl isRequired>
          <FormLabel>Organization name</FormLabel>
          <Stack spacing={2}>
            <FormHelperText>
              The name of the organization you are creating councils for.
            </FormHelperText>
            <Input
              placeholder='DAO or Company Name'
              value={formData.organizationName ?? undefined}
              onChange={(e) =>
                updateFormData({ organizationName: e.target.value })
              }
            />
          </Stack>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Council name</FormLabel>
          <Stack spacing={2}>
            <FormHelperText>
              The name of your first council. You can add further councils
              later.
            </FormHelperText>
            <Input
              placeholder='Council Name'
              value={formData.councilName ?? undefined}
              onChange={(e) => updateFormData({ councilName: e.target.value })}
            />
          </Stack>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Choose a chain</FormLabel>
          <Stack spacing={2}>
            <FormHelperText>
              The chain you deploy the Safe Multisig and Hats Council to.
            </FormHelperText>
            <Select
              placeholder='Select chain'
              value={formData.chain ?? undefined}
              onChange={(e) => updateFormData({ chain: e.target.value })}
              icon={<ChevronDownIcon />}
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
          </Stack>
        </FormControl>

        <FormControl>
          <FormLabel>
            Council description{' '}
            <Text as='span' color='gray.500' fontSize='sm' fontWeight='normal'>
              Optional
            </Text>
          </FormLabel>
          <Stack spacing={2}>
            <FormHelperText>
              Add a short description or some links you want all council members
              to see.
            </FormHelperText>
            <Textarea
              placeholder='Bylaws, policies or important links'
              value={formData.councilDescription ?? undefined}
              onChange={(e) =>
                updateFormData({ councilDescription: e.target.value })
              }
            />
          </Stack>
        </FormControl>
      </Stack>

      <HStack justify='flex-end' py={6}>
        <Button
          bg='blue.50'
          color='blue.500'
          _hover={{ bg: 'blue.100' }}
          size='md'
          rightIcon={<ChevronRightIcon />}
          onClick={onNext}
          isDisabled={
            !formData.organizationName ||
            !formData.councilName ||
            !formData.chain
          }
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
