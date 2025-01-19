'use client';

import { Box, Checkbox, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';

interface RequirementOption {
  key: string;
  icon: IconType;
  title: string;
  description: string;
}

interface RequirementBoxProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options: RequirementOption[];
  isDisabled?: boolean;
}

const RequirementBox = ({ name, localForm, options, isDisabled }: RequirementBoxProps) => {
  return (
    <Stack spacing={4}>
      {options.map((item) => (
        <Controller
          key={item.key}
          name={`${name}.${item.key}`}
          control={localForm.control}
          defaultValue={false}
          render={({ field }) => (
            <Box
              borderWidth='1px'
              borderRadius='lg'
              px={6}
              py={4}
              borderColor={field.value ? 'blue.500' : 'gray.200'}
              bg={field.value ? 'blue.50' : 'white'}
              _hover={
                !isDisabled
                  ? {
                      borderColor: 'blue.500',
                    }
                  : undefined
              }
              cursor={isDisabled ? 'not-allowed' : 'pointer'}
              onClick={isDisabled ? undefined : () => field.onChange(!field.value)}
              opacity={isDisabled ? 0.6 : 1}
            >
              <HStack justify='space-between' width='100%' align='center'>
                <HStack spacing={4}>
                  <Icon as={item.icon} boxSize={6} color={field.value ? 'blue.500' : 'gray.900'} />
                  <Stack spacing={0.5}>
                    <Text fontWeight='semibold' color='gray.900'>
                      {item.title}
                    </Text>
                    <Text color='gray.900'>{item.description}</Text>
                  </Stack>
                </HStack>

                <Box onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isChecked={field.value}
                    onChange={isDisabled ? undefined : (e) => field.onChange(e.target.checked)}
                    colorScheme='blue'
                    isDisabled={isDisabled}
                  />
                </Box>
              </HStack>
            </Box>
          )}
        />
      ))}
    </Stack>
  );
};

export { RequirementBox, type RequirementBoxProps };
