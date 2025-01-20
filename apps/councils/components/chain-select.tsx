import { councilsChainsList } from '@hatsprotocol/config';
import { Select } from 'forms';
import { map, values } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { SelectItem } from 'ui';

interface ChainSelectProps {
  form: UseFormReturn<any>;
  name: string;
  placeholder: string;
  isDisabled?: boolean;
  className?: string;
}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

export const ChainSelect = ({ form, name, placeholder, isDisabled, className }: ChainSelectProps) => {
  const { watch } = form;
  const value = watch(name);
  // const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <Select
      name='chainSelect'
      placeholder={value ? undefined : placeholder}
      localForm={form}
      // sx={{
      //   '& > option': {
      //     paddingLeft: '2rem',
      //     backgroundRepeat: 'no-repeat',
      //     backgroundPosition: '8px center',
      //     backgroundSize: '20px',
      //   },
      //   ...options.reduce(
      //     (acc, opt) => ({
      //       ...acc,
      //       [`& option[value="${opt.value}"]`]: {
      //         backgroundImage: `url(${opt.icon})`,
      //       },
      //     }),
      //     {},
      //   ),
      //   '&': {
      //     paddingLeft: selectedOption ? '2.5rem' : '1rem',
      //     paddingRight: '2rem',
      //     backgroundImage: selectedOption ? `url(${selectedOption.icon})` : 'none',
      //     backgroundRepeat: 'no-repeat',
      //     backgroundPosition: '0.5rem center',
      //     backgroundSize: '1.25rem',
      //   },
      // }}
    >
      {chainOptions.map((option: any) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

ChainSelect.displayName = 'ChainSelect';
