import React from 'react';
import { HStack, Text, Stack } from '@chakra-ui/react';

/**
 * Builds a horizontal data table for showing key-value data
 * @param {any[]} data key value pairs to be represented in horizontal data table
 * @param {string} labelWidth width of label column, defaults to 25%
 * @returns horizontal "Table" component
 */
const DataTable = ({
  data,
  labelWidth = '25%',
  justify = 'flex-start',
  minH = 6,
}) => {
  return (
    <Stack>
      {data.map((row) => (
        <HStack
          key={row.key || row.label}
          justify={justify}
          spacing={3}
          borderBottom='1px solid'
          borderColor='gray.200'
          py={1}
          minH={minH}
        >
          <Text w={labelWidth} fontWeight={700} fontSize='sm'>
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
