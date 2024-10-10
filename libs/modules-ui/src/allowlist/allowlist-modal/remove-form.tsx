import { Button, Card, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { isEmpty, map, size, subtract } from 'lodash';
import React, { Dispatch, SetStateAction } from 'react';
import { AllowlistProfile } from 'types';
import { formatAddress } from 'utils';

export const RemoveForm = ({
  updateList,
  setUpdateList,
  setUpdating,
  handleRemoveWearers,
  isLoading,
}: {
  updateList: AllowlistProfile[];
  setUpdateList: Dispatch<SetStateAction<AllowlistProfile[]>>;
  setUpdating: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  handleRemoveWearers: () => void;
}) => {
  return (
    <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
      <Stack spacing={4}>
        <Heading size='md'>Addresses selected for removal</Heading>
        <Card>
          <Flex m={2} mx={4}>
            {isEmpty(updateList) ? (
              <Text color='gray.500'>Select an address to remove</Text>
            ) : (
              <Text>
                {map(
                  updateList,
                  (profile, index) =>
                    `${profile.ensName || formatAddress(profile.id)}${
                      index < subtract(size(updateList), 1) ? ', ' : ''
                    }`,
                )}
              </Text>
            )}
          </Flex>
        </Card>
      </Stack>

      <Flex justify='space-between' w='full'>
        <Button
          variant='outlineMatch'
          colorScheme='blue.500'
          size='sm'
          onClick={() => {
            setUpdateList([]);
            setUpdating(false);
          }}
        >
          Cancel
        </Button>

        <Button
          variant='filled'
          colorScheme='red.500'
          size='sm'
          isLoading={isLoading}
          isDisabled={isEmpty(updateList)}
          onClick={handleRemoveWearers}
        >
          Remove
        </Button>
      </Flex>
    </Stack>
  );
};
