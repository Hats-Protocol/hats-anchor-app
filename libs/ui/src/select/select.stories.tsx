import { type Meta, type StoryObj } from '@storybook/react';

import { CreatableReactSelect } from './creatable-select';
import { ReactSelect, ReactSelectOption } from './select';

const meta: Meta<typeof ReactSelect> = {
  title: 'Components/Forms/ReactSelect',
  component: ReactSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockOptions: ReactSelectOption[] = [
  {
    value: 'ethereum',
    label: 'Ethereum',
    iconUrl: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/info/logo.png',
  },
  {
    value: 'optimism',
    label: 'Optimism',
    iconUrl: 'https://raw.githubusercontent.com/ethereum-optimism/brand-kit/main/assets/svg/Profile-Logo.svg',
  },
  {
    value: 'arbitrum',
    label: 'Arbitrum',
    iconUrl: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/info/logo.png',
  },
];

const mockOptionsWithoutIcons: ReactSelectOption[] = [
  {
    value: 'view',
    label: 'View Only',
    iconUrl: '',
  },
  {
    value: 'edit',
    label: 'Can Edit',
    iconUrl: '',
  },
  {
    value: 'admin',
    label: 'Admin',
    iconUrl: '',
  },
];

export const Default: Story = {
  render: () => <ReactSelect options={mockOptions} placeholder='Select a chain' className='w-[200px]' />,
};

export const WithCustomIconSize: Story = {
  render: () => (
    <ReactSelect options={mockOptions} placeholder='Select a chain' className='w-[200px]' iconClassName='h-6 w-6' />
  ),
};

export const Disabled: Story = {
  render: () => <ReactSelect options={mockOptions} placeholder='Select a chain' className='w-[200px]' isDisabled />,
};

export const WithValue: Story = {
  render: () => (
    <ReactSelect options={mockOptions} placeholder='Select a chain' className='w-[200px]' value={mockOptions[0]} />
  ),
};

export const WithoutIcons: Story = {
  render: () => (
    <ReactSelect options={mockOptionsWithoutIcons} placeholder='Select a permission' className='w-[200px]' />
  ),
};

export const Creatable: Story = {
  render: () => {
    const organizationOptions: ReactSelectOption[] = [
      {
        value: 'Hats Protocol',
        label: 'Hats Protocol',
      },
      {
        value: 'Ethereum Foundation',
        label: 'Ethereum Foundation',
      },
      {
        value: 'Optimism',
        label: 'Optimism',
      },
    ];

    return (
      <CreatableReactSelect
        options={organizationOptions}
        placeholder='Select or create an organization'
        className='w-[300px]'
        formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
        noOptionsMessage={() => 'Type to create a new organization'}
      />
    );
  },
};
