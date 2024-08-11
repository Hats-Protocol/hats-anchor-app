'use client';

import { Box, HStack, IconButton, Link, Stack, Text } from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useHatForm } from 'contexts';
import _ from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { getHostnameFromURL } from 'utils';

interface AuthoritiesFormItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  index: number;
  remove: (index: number) => void;
  setIndex: (index: number) => void;
  onOpen: () => void;
}

const AuthoritiesFormItem = ({
  index,
  formName,
  remove,
  setIndex,
  onOpen,
}: AuthoritiesFormItemProps) => {
  const { localForm } = useHatForm();
  const { getValues } = _.pick(localForm, ['getValues']);
  const { gate, type, label, link } = getValues?.(`${formName}.${index}`) ?? {};
  const isGate = type === AUTHORITY_TYPES.gate || type === 'token'; // originally set as 'token'/ gate is more general
  const hostname = getHostnameFromURL(gate);

  if (!localForm) return null;

  return (
    <Box borderBottom='1px solid' borderColor='blackAlpha.300' pb={2}>
      <HStack justifyContent='space-between' w='full' alignItems='center'>
        <Stack flex={1} spacing='1px'>
          <Text size='sm' variant='lightMedium'>
            {label || 'New Authority'}
          </Text>
          {isGate && ( // TODO handle when combined with social overrides
            <Box>
              <Link
                // TODO this override is only necessary because snapshot gate should be equal to the link, probably?
                href={hostname === 'snapshot.org' ? link : gate}
                isExternal
                fontSize='xs'
                color='blue.500'
              >
                {hostname}
              </Link>
            </Box>
          )}
        </Stack>
        <IconButton
          onClick={() => {
            onOpen();
            setIndex(index);
          }}
          icon={<FaRegEdit />}
          aria-label='Edit'
          variant='ghost'
          color='blackAlpha.900'
        />
        <IconButton
          onClick={() => remove(index)}
          icon={<FaRegTrashAlt />}
          aria-label='Remove'
          variant='ghost'
          isDisabled={isGate}
          color='blackAlpha.900'
        />
      </HStack>
    </Box>
  );
};

export default AuthoritiesFormItem;
