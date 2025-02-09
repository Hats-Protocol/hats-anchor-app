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
  name,
  localForm,
  helperText,
  tooltip,
  headerNote,
  subLabel,
  isDisabled,
  placeholder,
  className,
  ...props
}: TextareaProps) => {
  const {
    control,
    // register,
    resetField,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = dirtyFields[name];

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };

  const error = errors[name] && errors[name]?.message;

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className='flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            {label && (
              <FormLabel className='m-0 flex items-baseline text-sm'>
                {toUpper(label)}
                <p className='text-gray-500'>{headerNote}</p>
              </FormLabel>
            )}
            {tooltip && (
              <Tooltip label={tooltip}>
                <div className='bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full'>
                  <AiOutlineInfoCircle className='h-4 w-4' />
                </div>
              </Tooltip>
            )}
          </div>

          <div className='relative flex flex-col gap-1'>
            {subLabel && <FormDescription>{subLabel}</FormDescription>}
            <FormControl className='flex w-full flex-grow'>
              <>
                <BaseTextarea
                  className={cn(isDirty && 'border-2 border-cyan-500', className)}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  {...field}
                />

                {isDirty && (
                  <div className='absolute right-2 top-2'>
                    <Button aria-label='Reset' onClick={onReset} size='xs' className='bg-cyan-500'>
                      <GrUndo />
                    </Button>
                  </div>
                )}
              </>
            </FormControl>
          </div>

          {helperText && <FormDescription>{helperText}</FormDescription>}
          {typeof error === 'string' && <FormDescription className='text-destructive'>{error}</FormDescription>}
        </FormItem>
      )}
    />
  );
};

interface TextareaProps {
  label?: string;
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
}

export { Textarea, type TextareaProps };
