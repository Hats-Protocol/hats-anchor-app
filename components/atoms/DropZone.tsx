/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-props-no-spreading */
import { Box, Flex, Image, Input, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';

import { ImageFile } from '@/types';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 'grow',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  width: '83%',
  height: 100,
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

/**
 * Props are as returned from the useDropzone hook
 */
const DropZone = ({
  getRootProps,
  getInputProps,
  isFocused,
  isDragAccept,
  isDragReject,
  isFullWidth,
  image,
  imageUrl,
}: DropZoneProps) => {
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
      ...(isFullWidth ? { width: '100%' } : {}),
    }),
    [isFocused, isDragAccept, isDragReject, isFullWidth],
  );

  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    fit: 'cover',
    width: 100,
    height: 100,
    padding: 4,
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => {
      if (image !== undefined) {
        URL.revokeObjectURL(image.preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={2} w='full'>
      <Flex gap={3}>
        <Box {...getRootProps({ style })}>
          <Input {...getInputProps()} display='none' />{' '}
          <Text>
            {image
              ? 'Image uploaded! For another image, drag n drop, or click to select'
              : 'Drag n drop, or click to select'}
          </Text>
        </Box>
        {(image || imageUrl) && (
          <Flex wrap='wrap'>
            <Box style={thumb}>
              <Flex minWidth={0} overflow='hidden'>
                <Image
                  src={image?.preview ?? (imageUrl || undefined)}
                  display='block'
                  width='auto'
                  height='100%'
                  onLoad={() => {
                    if (image) URL.revokeObjectURL(image.preview);
                  }}
                  alt='Uploaded item from user'
                />
              </Flex>
            </Box>
          </Flex>
        )}
      </Flex>
    </Stack>
  );
};

export default DropZone;

interface DropZoneProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRootProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInputProps: any;
  // acceptedFiles?: string[];
  isFocused?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
  isFullWidth?: boolean;
  image?: ImageFile;
  imageUrl?: string | null;
}
