import {
  Flex,
  Box,
  Button,
  Heading,
  Table,
  Th,
  Thead,
  Tbody,
  Tr,
  Td,
  Stack,
} from '@chakra-ui/react';
import React from 'react';

const InlineTable = ({ title, headings, rows, keys }) => {
  return (
    <Stack spacing={4}>
      <Flex w='100%' justify='space-between'>
        <Heading fontSize='xl'>{title}</Heading>
        <Button>Add item</Button>
      </Flex>
      <Box>
        <Table>
          <Thead>
            <Tr>
              {keys.map((h) => (
                <Th key={h} fontSize='sm'>
                  {headings[h]}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row[keys[0]]}>
                {keys.map((k) => (
                  <Td key={[row[keys[0]], k]} fontSize='sm'>
                    {row[k]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

export default InlineTable;
