import React, { useEffect } from 'react';
import _ from 'lodash';
import { HStack, Text, IconButton, Icon, useClipboard } from '@chakra-ui/react';
import { FaRegCopy } from 'react-icons/fa';
import useToast from '@/hooks/useToast';

const CopyToClipboard = ({
  children,
  copyValue,
  description,
  fontSize = 'sm',
  iconSize = '12px',
}) => {
  const toCopy = copyValue || children;
  const toast = useToast();
  const { onCopy, hasCopied } = useClipboard(toCopy);

  useEffect(() => {
    if (!hasCopied) return;
    toast.success({
      title: 'Copied to clipboard',
      description: _.gt(toCopy.length, 30)
        ? `${description ? `${description}: ` : 'Value: '}${toCopy.slice(
            0,
            30,
          )}...`
        : `${description ? `${description}: ` : 'Value: '}${toCopy}`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCopied]);

  return (
    <HStack onClick={onCopy} spacing={1}>
      <Text fontSize={fontSize}>{children}</Text>
      <IconButton
        icon={
          <Icon
            as={FaRegCopy}
            h={iconSize}
            w={iconSize}
            color='gray.500'
            p={0}
          />
        }
        minW='auto'
        w={8}
        h={8}
        p={0}
        variant='ghost'
      />
    </HStack>
  );
};

export default CopyToClipboard;
