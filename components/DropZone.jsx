/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react';
import { Stack } from '@chakra-ui/react';

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
  acceptedFiles,
  isFocused,
  isDragAccept,
  isDragReject,
}) => {
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );

  return (
    <Stack spacing={2}>
      <div className='container'>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag n drop, or click to select</p>
        </div>
        <p>{acceptedFiles ? acceptedFiles[0]?.name : ''}</p>
      </div>
    </Stack>
  );
};

export default DropZone;
