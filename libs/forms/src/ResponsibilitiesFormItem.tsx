import { Box, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { useHatForm } from 'contexts';
import _ from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

interface ResponsibilitiesFormItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  index: number;
  remove: (index: number) => void;
  setIndex: (index: number) => void;
  onOpen: () => void;
}

const ResponsibilitiesFormItem = ({
  index,
  formName,
  remove,
  setIndex,
  onOpen,
}: ResponsibilitiesFormItemProps) => {
  const { localForm } = useHatForm();
  const { getValues } = _.pick(localForm, ['getValues']);
  const { label } = getValues?.(`${formName}.${index}`) ?? {};

  if (!localForm) return null;

  return (
    <Box borderBottom='1px solid' borderColor='blackAlpha.300' pb={2}>
      <HStack justifyContent='space-between' alignItems='center'>
        <Stack flex={1}>
          <Text mb={0} size='sm' variant='lightMedium'>
            {label || 'New Responsibility'}
          </Text>
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
        />
      </HStack>
    </Box>
  );
};

export default ResponsibilitiesFormItem;
