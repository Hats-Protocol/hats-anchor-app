import { forwardRef, Select, SelectProps } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';

interface ChainSelectProps extends Omit<SelectProps, 'children' | 'form'> {
  options: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  form: UseFormReturn<any>;
  name: string;
}

export const ChainSelect = forwardRef<ChainSelectProps, 'select'>(
  ({ options, form, name, ...props }, ref) => {
    const selectedOption = options.find(
      (opt) => opt.value === form.watch(name),
    );

    return (
      <Select
        ref={ref}
        {...props}
        value={form.watch(name)}
        onChange={(e) => form.setValue(name, e.target.value)}
        sx={{
          '& > option': {
            paddingLeft: '2rem',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '8px center',
            backgroundSize: '20px',
          },
          ...options.reduce(
            (acc, opt) => ({
              ...acc,
              [`& option[value="${opt.value}"]`]: {
                backgroundImage: `url(${opt.icon})`,
              },
            }),
            {},
          ),
          '&': {
            paddingLeft: selectedOption ? '2.5rem' : '1rem',
            paddingRight: '2rem',
            backgroundImage: selectedOption
              ? `url(${selectedOption.icon})`
              : 'none',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0.5rem center',
            backgroundSize: '1.25rem',
          },
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  },
);

ChainSelect.displayName = 'ChainSelect';
