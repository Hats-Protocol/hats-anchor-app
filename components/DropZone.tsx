/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-props-no-spreading */
import { Stack, Box, Flex } from '@chakra-ui/react';
import { useMemo, useEffect } from 'react';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
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
  image,
}: DropZoneProps) => {
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );

  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 'auto',
    height: 100,
    padding: 4,
    // boxSizing: 'border-box',
  };

  const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
  };

  const thumbs =
    image !== undefined ? (
      <Box style={thumb} key={image.name}>
        <Flex minWidth={0} overflow='hidden'>
          <img
            src={image.preview}
            style={img}
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(image.preview);
            }}
            alt='Uploaded item from user'
          />
        </Flex>
      </Box>
    ) : null;

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
    <Stack spacing={2}>
      <div>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          {image !== undefined ? (
            <p>
              Image uploaded! For another image, drag n drop, or click to select
            </p>
          ) : (
            <p>Drag n drop, or click to select</p>
          )}
        </div>
      </div>
      <Flex wrap='wrap' marginTop={16}>
        {thumbs}
      </Flex>
    </Stack>
  );
};

export default DropZone;

interface DropZoneProps {
  getRootProps: any;
  getInputProps: any;
  // acceptedFiles?: string[];
  isFocused?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
  image?: any;
}
