'use client';

import Heading from '@tiptap/extension-heading';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';
import { logger } from 'utils';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Toolbar } from './markdown-toolbar';
const Tiptap = ({
  field,
  label,
  // existingAgreements,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  // existingAgreements?: { agreement: string; councilName: string }[];
}) => {
  const converter = new showdown.Converter();

  logger.info('field.value:', field.value);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Heading.configure({
        HTMLAttributes: {
          class: 'text-xl font-bold',
          levels: [1, 2, 3],
        },
      }),
    ],
    content: converter.makeHtml(field.value),
    editorProps: {
      attributes: {
        class:
          'rounded-md border min-h-[150px] max-h-[400px] overflow-y-auto border-input bg-background focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-2',
      },
      scrollThreshold: 80,
      scrollMargin: 80,
    },
    onUpdate({ editor }) {
      field.onChange(editor.getHTML());
    },
  });

  // Update editor content when field.value changes externally
  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(converter.makeHtml(field.value));
    }
  }, [editor, field.value]);

  // Check if current content matches an existing agreement (read-only check)
  // const matchingAgreement = existingAgreements?.find((existing) => existing.agreement === field.value);

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className='flex flex-col justify-stretch gap-2'>
          <Toolbar editor={editor} />
          <EditorContent className='max-h-[400px] min-h-[250px]' editor={editor} />
          {/* {matchingAgreement && (
            <div className='text-muted-foreground text-xs'>Note: This matches an existing agreement</div>
          )} */}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

const MarkdownEditor = ({
  name,
  label,
  placeholder,
  localForm,
  isDisabled,
  existingAgreements,
}: MarkdownEditorProps) => {
  // const { watch, setValue } = pick(localForm, ['watch', 'setValue']);

  // TODO handle form options (required, length)

  return (
    <FormField
      control={localForm.control}
      name={name}
      render={({ field }) => {
        return <Tiptap field={field} label={label} existingAgreements={existingAgreements} />;
      }}
    />
  );
};

interface MarkdownEditorProps {
  name: string;
  label?: string;
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  isDisabled?: boolean;
  existingAgreements?: { agreement: string; councilName: string }[];
}

export { MarkdownEditor, type MarkdownEditorProps };
