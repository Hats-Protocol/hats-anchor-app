'use client';

import { Content } from '@tiptap/react';
import { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { MinimalTiptapEditor } from './minimal-tiptap';

interface MarkdownEditorTiptapProps {
  name: string;
  label?: string;
  placeholder?: string;
  localForm: UseFormReturn<any>;
  isDisabled?: boolean;
  className?: string;
}

const TiptapWrapper = ({
  field,
  label,
  placeholder,
  className,
  isDisabled,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
}) => {
  const converter = new showdown.Converter();
  const initialHtml = converter.makeHtml(field.value || '');

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <MinimalTiptapEditor
          value={initialHtml}
          onChange={(html) => {
            // Convert HTML back to markdown before saving to form
            const markdown = converter.makeMarkdown(typeof html === 'string' ? html : '');
            field.onChange(markdown);
          }}
          className={className}
          editorContentClassName='p-4'
          output='html'
          placeholder={placeholder}
          autofocus={false}
          editable={!isDisabled}
          editorClassName='focus:outline-none'
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export function MarkdownEditorTiptap({
  name,
  label,
  placeholder,
  localForm,
  isDisabled,
  className,
}: MarkdownEditorTiptapProps) {
  return (
    <FormField
      control={localForm.control}
      name={name}
      render={({ field }) => (
        <TiptapWrapper
          field={field}
          label={label}
          placeholder={placeholder}
          className={className}
          isDisabled={isDisabled}
        />
      )}
    />
  );
}
