'use client';

import { Box, Checkbox, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { Controller, UseFormReturn } from 'react-hook-form';

interface RequirementOption {
  key: string;
  icon: IconType;
  title: string;
  description: string;
}

interface RequirementBoxProps {
  name: string;
  localForm: UseFormReturn<any>;
  options: RequirementOption[];
}

const RequirementBox = ({ name, localForm, options }: RequirementBoxProps) => {
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
              _hover={{
                borderColor: 'blue.500',
              }}
              cursor='pointer'
              onClick={() => field.onChange(!field.value)}
            >
              <HStack justify='space-between' width='100%'>
                <HStack spacing={4}>
                  <Icon
                    as={item.icon}
                    boxSize={6}
                    color={field.value ? 'blue.500' : 'gray.400'}
                  />
                  <Stack spacing={0.5}>
                    <Text fontWeight='semibold' color='gray.900'>
                      {item.title}
                    </Text>
                    <Text fontSize='sm' color='gray.500'>
                      {item.description}
                    </Text>
                  </Stack>
                </HStack>
                <Box onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isChecked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    colorScheme='blue'
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

export default RequirementBox;
