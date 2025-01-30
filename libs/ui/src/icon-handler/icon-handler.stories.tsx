import { type Meta, type StoryObj } from '@storybook/react';

// Mock component for Storybook only
const IconHandler = ({
  icon,
  authorityEnforcement,
  imageUrl,
  isExpanded,
}: {
  icon: React.ReactNode | undefined;
  authorityEnforcement: any;
  imageUrl: string | undefined;
  isExpanded: boolean;
}) => {
  if (icon) {
    return <div className='z-[5] h-[14px] w-[14px] rounded bg-slate-800' />;
  }

  if (authorityEnforcement?.icon) {
    return <div className='z-[5] h-[14px] w-[14px] rounded bg-slate-800' />;
  }

  if (imageUrl || authorityEnforcement.imageUri) {
    return (
      <img
        src={imageUrl || authorityEnforcement.imageUri}
        className='z-[5] h-[18px] w-[18px] rounded-full border border-slate-300'
        alt='authority enforcement type'
      />
    );
  }

  return <div className='z-[5] h-[14px] w-[14px] rounded bg-slate-800' />;
};

const meta: Meta<typeof IconHandler> = {
  title: 'Components/IconHandler',
  component: IconHandler,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  args: {
    icon: true,
    authorityEnforcement: {},
    imageUrl: undefined,
    isExpanded: false,
  },
};

export const WithAuthorityIcon: Story = {
  args: {
    icon: undefined,
    authorityEnforcement: { icon: true },
    imageUrl: undefined,
    isExpanded: false,
  },
};

export const WithImage: Story = {
  args: {
    icon: undefined,
    authorityEnforcement: {},
    imageUrl: 'https://picsum.photos/18',
    isExpanded: false,
  },
};

export const WithAuthorityImage: Story = {
  args: {
    icon: undefined,
    authorityEnforcement: { imageUri: 'https://picsum.photos/18' },
    imageUrl: undefined,
    isExpanded: false,
  },
};

export const Fallback: Story = {
  args: {
    icon: undefined,
    authorityEnforcement: {},
    imageUrl: undefined,
    isExpanded: false,
  },
};
