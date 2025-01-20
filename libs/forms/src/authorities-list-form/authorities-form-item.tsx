'use client';

import { Box, HStack, IconButton, Link, Stack, Text, Tooltip } from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useHatForm } from 'contexts';
import _ from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { getHostnameFromURL } from 'utils';

const NON_EDIT_AUTHORITIES = [AUTHORITY_TYPES.hsg, AUTHORITY_TYPES.modules, AUTHORITY_TYPES.account];

const AuthoritiesFormItem = ({ index, formName, remove, setIndex, onOpen }: AuthoritiesFormItemProps) => {
  const { localForm } = useHatForm();
  const { getValues } = _.pick(localForm, ['getValues']);
  const { gate, type, label, link } = getValues?.(`${formName}.${index}`) ?? {};
  const isGate = type === AUTHORITY_TYPES.gate || type === 'token'; // originally set as 'token'/ gate is more general
  const hostname = getHostnameFromURL(gate);
  const isNonEditAuthority = NON_EDIT_AUTHORITIES.includes(type);

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

        <Tooltip label={isNonEditAuthority ? 'Cannot edit this authority' : ''}>
          <IconButton
            onClick={() => {
              if (isNonEditAuthority) return;
              onOpen();
              setIndex(index);
            }}
            icon={<FaRegEdit />}
            isDisabled={isNonEditAuthority}
            aria-label='Edit'
            variant='ghost'
            color='blackAlpha.900'
          />
        </Tooltip>

        <Tooltip label={isNonEditAuthority ? 'Cannot remove this authority' : ''}>
          <IconButton
            onClick={() => {
              if (isNonEditAuthority) return;
              remove(index);
            }}
            icon={<FaRegTrashAlt />}
            aria-label='Remove'
            variant='ghost'
            isDisabled={isGate || isNonEditAuthority}
            color='blackAlpha.900'
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

interface AuthoritiesFormItemProps {
  formName: string;
  index: number;
  remove: (index: number) => void;
  setIndex: (index: number) => void;
  onOpen: () => void;
}

export default AuthoritiesFormItem;
