import React from 'react';
import { HStack, Text, Stack } from '@chakra-ui/react';

/**
 * Builds a horizontal data table for showing key-value data
 * @param {any[]} data data to be represented in horizontal data table
 * @returns horizontal "Table" component
 */
const DataTable = ({ data, labelWidth = '25%' }) => {
  return (
    <Stack>
      {data.map((row) => (
        <HStack key={row.label} spacing={3}>
          <Text w={labelWidth} fontWeight={800} fontSize='sm'>
            {row.label}
          </Text>
          {typeof row.value === 'string' ? (
            <Text fontSize='sm'>{row.value}</Text>
          ) : (
            row.value
          )}
        </HStack>
      ))}
    </Stack>
  );
};

export default DataTable;
