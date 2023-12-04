import { Box, HStack, IconButton, Link, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

import { AUTHORITY_TYPES } from '@/utils/constants';
import { useHatForm } from '@/contexts/HatFormContext';
import { getHostnameFromURL } from '@/lib/general';

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
  const { gate, type, label } = getValues?.(`${formName}.${index}`) ?? {};
  const isGate = type === AUTHORITY_TYPES.gate || type === 'token'; // originally set as 'token'/ gate is more general
  const hostname = getHostnameFromURL(gate);

  if (!localForm) return null;

  return (
    <Box borderBottom='1px solid' borderColor='blackAlpha.300' pb={2}>
      <HStack justifyContent='space-between' w='full' alignItems='center'>
        <Stack flex={1} spacing='1px'>
          <Text mb={0} fontSize='sm' color='blackAlpha.800'>
            {label}
          </Text>
          {isGate && (
            <Link href={gate} isExternal fontSize='xs' color='blue.500'>
              {hostname}
            </Link>
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
          borderColor='blackAlpha.300'
        />
        <IconButton
          onClick={() => remove(index)}
          icon={<FaRegTrashAlt />}
          aria-label='Remove'
          variant='ghost'
          borderColor='blackAlpha.300'
          isDisabled={isGate}
        />
      </HStack>
    </Box>
  );
};

export default AuthoritiesFormItem;
