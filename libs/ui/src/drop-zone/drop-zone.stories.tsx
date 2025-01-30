import { type Meta, type StoryObj } from '@storybook/react';
import { useDropzone } from 'react-dropzone';

import { DropZone } from './drop-zone';

const meta: Meta<typeof DropZone> = {
  title: 'Components/Forms/DropZone',
  component: DropZone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => <div className='w-[600px] p-4'>{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to provide dropzone functionality
const DropZoneWrapper = (props: any) => {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    maxSize: props.maxSize,
    onDropRejected: (fileRejections) => {
      console.log('File rejected:', fileRejections);
    },
  });

  return (
    <DropZone
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      isFocused={isFocused}
      isDragAccept={isDragAccept}
      isDragReject={isDragReject}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <DropZoneWrapper />,
};

export const WithLabel: Story = {
  render: () => <DropZoneWrapper label='Upload Image' />,
};

export const WithMaxSize: Story = {
  render: () => (
    <DropZoneWrapper
      label='Max 5MB'
      maxSize={5 * 1024 * 1024} // 5MB in bytes
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'This variant shows a max file size limit of 5MB. Try uploading a larger file to see the rejection state.',
      },
    },
  },
};

export const WithImage: Story = {
  render: () => <DropZoneWrapper label='Profile Picture' imageUrl='https://github.com/shadcn.png' />,
};

export const WithNewImage: Story = {
  render: () => <DropZoneWrapper label='Profile Picture' imageUrl='https://github.com/shadcn.png' isNewImage />,
};

export const FullWidth: Story = {
  render: () => <DropZoneWrapper label='Full Width' isFullWidth />,
};
