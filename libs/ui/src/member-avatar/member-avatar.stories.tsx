import { type Meta, type StoryObj } from '@storybook/react';

// Mock component for Storybook only
const MockMemberAvatar = ({ member, stack = false }: { member: any; stack?: boolean }) => {
  const mockMember = {
    name: member.name,
    address: member.address || '0x1234567890123456789012345678901234567890',
    id: member.id || '0x1234567890123456789012345678901234567890',
  };

  return (
    <div className='flex items-center gap-2'>
      <div className={`bg-gray-200 ${stack ? 'h-10 w-8' : 'h-5 w-4 rounded-sm'}`} />
      <div className='flex flex-col gap-0.5'>
        {mockMember.name && <span className='text-sm font-medium text-gray-900'>{mockMember.name}</span>}
        <span className='font-jb-mono text-sm text-gray-600'>0x1234...7890</span>
      </div>
    </div>
  );
};

const meta: Meta<typeof MockMemberAvatar> = {
  title: 'Components/MemberAvatar',
  component: MockMemberAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    member: {
      name: 'John Doe',
      address: '0x1234567890123456789012345678901234567890',
    },
  },
};

export const WithoutName: Story = {
  args: {
    member: {
      address: '0x1234567890123456789012345678901234567890',
    },
  },
};

export const Stacked: Story = {
  args: {
    member: {
      name: 'John Doe',
      address: '0x1234567890123456789012345678901234567890',
    },
    stack: true,
  },
};
