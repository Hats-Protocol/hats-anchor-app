import { Meta, StoryObj } from '@storybook/react/*';
import { Crown, Shield, Users } from 'lucide-react';

// Mock component for Storybook only
const IconHandlerStory = ({
  icon,
  authorityEnforcement,
  imageUrl,
  isExpanded,
}: {
  icon?: React.ReactNode;
  authorityEnforcement?: { icon?: React.ReactNode; imageUri?: string };
  imageUrl?: string;
  isExpanded?: boolean;
}) => {
  if (icon) {
    return <div className='z-[5] text-slate-800'>{icon}</div>;
  }

  if (authorityEnforcement?.icon) {
    return <div className='z-[5] text-slate-800'>{authorityEnforcement.icon}</div>;
  }

  if (imageUrl || authorityEnforcement?.imageUri) {
    return (
      <img
        src={imageUrl || authorityEnforcement?.imageUri}
        className='z-[5] h-[18px] w-[18px] rounded-full border border-slate-300'
        alt='authority enforcement type'
      />
    );
  }

  return <div className='z-[5] h-[14px] w-[14px] rounded bg-slate-800'>{/* Fallback Key icon representation */}</div>;
};

const meta: Meta<typeof IconHandlerStory> = {
  title: 'Components/IconHandler',
  component: IconHandlerStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => <div className='flex items-center justify-center gap-8 p-4'>{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  args: {
    icon: <Crown className='h-[14px] w-[14px]' />,
    authorityEnforcement: {},
    isExpanded: false,
  },
};

export const WithAuthorityIcon: Story = {
  args: {
    authorityEnforcement: {
      icon: <Shield className='h-[14px] w-[14px]' />,
    },
    isExpanded: false,
  },
};

export const WithImage: Story = {
  args: {
    imageUrl: 'https://github.com/shadcn.png',
    authorityEnforcement: {},
    isExpanded: false,
  },
};

export const WithAuthorityImage: Story = {
  args: {
    authorityEnforcement: {
      imageUri: 'https://github.com/shadcn.png',
    },
    isExpanded: false,
  },
};

export const WithExpandedIcon: Story = {
  args: {
    icon: <Users className='h-[14px] w-[14px]' />,
    authorityEnforcement: {},
    isExpanded: true,
  },
};

export const Fallback: Story = {
  args: {
    authorityEnforcement: {},
    isExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'When no icon or image is provided, the component falls back to a Key icon.',
      },
    },
  },
};
