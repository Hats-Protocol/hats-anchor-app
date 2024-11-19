'use client';

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import { useCouncilForm } from '../contexts/council-form';

export function CouncilCreateForm({ step }: { step: string }) {
  const router = useRouter();
  const { formData, updateFormData } = useCouncilForm();

  if (step === 'details') {
    return (
      <Stack spacing={6}>
        <FormControl isRequired>
          <FormLabel>Organization name</FormLabel>
          <Input
            placeholder='DAO or Company Name'
            value={formData.organizationName}
            onChange={(e) =>
              updateFormData({ organizationName: e.target.value })
            }
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Council name</FormLabel>
          <Input
            placeholder='Council Name'
            value={formData.councilName}
            onChange={(e) => updateFormData({ councilName: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Choose a chain</FormLabel>
          <Select
            placeholder='Select chain'
            value={formData.chain}
            onChange={(e) => updateFormData({ chain: e.target.value })}
          >
            <option value='optimism'>Optimism</option>
            <option value='base'>Base</option>
            <option value='arbitrum'>Arbitrum</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Council description (Optional)</FormLabel>
          <Textarea
            placeholder='Bylaws, policies or important links'
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
          />
        </FormControl>

        <Button
          colorScheme='blue'
          onClick={() => router.push('/councils/new/members')}
          isDisabled={
            !formData.organizationName ||
            !formData.councilName ||
            !formData.chain
          }
        >
          Add Council Members
        </Button>
      </Stack>
    );
  }

  return null;
}
