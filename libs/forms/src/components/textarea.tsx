'use client';

import { toUpper } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GrUndo } from 'react-icons/gr';
import { BaseTextarea, Button, cn, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

/**
 * Textarea Input form component
 * @param props - `TextareaProps`
 * @param label - The label for the textarea
 * @param labelNote - Supporting text for the label (e.g. 'Optional', 'Hidden')
 * @param name - The name of the textarea
 * @param localForm - The local form
 * @param helperText - The helper text for the textarea
 * @param tooltip - The tooltip for the textarea
 * @param headerNote - The header note for the textarea
 * @param subLabel - The sub label for the textarea
 * @param isDisabled - Whether the textarea is disabled
 */
const Textarea = ({
  label,
  labelNote,
  name,
  localForm,
  helperText,
  tooltip,
  headerNote,
  subLabel,
  isDisabled,
  placeholder,
  className,
  variant = 'default',
  ...props
}: TextareaProps) => {
  const {
    control,
    // register,
    resetField,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = dirtyFields[name];
  const isError = errors[name] && errors[name]?.message;

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };

  const error = errors[name] && errors[name]?.message;

  const getVariantStyles = (variant: TextareaProps['variant'] = 'default') => {
    switch (variant) {
      case 'councils':
        return {
          label: 'font-bold normal-case text-base',
          description: 'text-gray-400',
          container: 'flex items-center justify-between w-full',
          tooltipContainer: 'max-w-md',
        };
      default:
        return {
          label: 'font-normal uppercase',
          description: '',
          container: 'flex items-center gap-1',
          tooltipContainer: 'max-w-xs',
        };
    }
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-1'>
          <div className={getVariantStyles(variant).container}>
            {label && (
              <FormLabel className={cn('m-0 flex items-baseline', getVariantStyles(variant).label)}>
                {variant === 'default' ? toUpper(label) : label}
                {labelNote && <span className='ml-2 text-sm font-normal text-gray-400'>{labelNote}</span>}
                <p className='text-gray-500'>{headerNote}</p>
              </FormLabel>
            )}
            {tooltip && (
              <Tooltip label={tooltip} className={getVariantStyles(variant).tooltipContainer}>
                <div className='bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full'>
                  <AiOutlineInfoCircle className='h-4 w-4' />
                </div>
              </Tooltip>
            )}
          </div>

          <div className='relative flex flex-col gap-1'>
            {subLabel && <FormDescription variant={variant}>{subLabel}</FormDescription>}
            <FormControl className='flex w-full flex-grow'>
              <div className='relative'>
                <BaseTextarea
                  className={cn(
                    'transition-colors duration-200 focus:outline-none focus:ring-0',
                    variant === 'default' && [
                      isDirty && !isError && 'border-cyan-500 focus:border-cyan-500',
                      isError && 'border-destructive focus:border-destructive',
                    ],
                    className,
                  )}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  {...field}
                />

                {isDirty && variant === 'default' && (
                  <Button
                    aria-label='Reset'
                    onClick={onReset}
                    size='xs'
                    className='absolute right-1 top-1.5 bg-cyan-500'
                  >
                    <GrUndo />
                  </Button>
                )}
              </div>
            </FormControl>
          </div>

          {helperText && <FormDescription variant={variant}>{helperText}</FormDescription>}
          {typeof error === 'string' && (
            <FormDescription className='text-destructive' variant={variant}>
              {error}
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};

interface TextareaProps {
  label?: string;
  labelNote?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  helperText?: string;
  tooltip?: string;
  placeholder?: string;
  headerNote?: string;
  subLabel?: string;
  isDisabled?: boolean;
  className?: string;
  variant?: 'default' | 'councils';
}

export { Textarea, type TextareaProps };
