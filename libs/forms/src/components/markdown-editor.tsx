'use client';

import Heading from '@tiptap/extension-heading';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Toolbar } from './markdown-toolbar';

const Tiptap = ({ field, label }: { field: ControllerRenderProps<FieldValues, string>; label?: string }) => {
  const converter = new showdown.Converter();
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
      // console.log(editor.getHTML());
    },
  });

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className='flex flex-col justify-stretch'>
          <Toolbar editor={editor} />
          <EditorContent className='max-h-[400px] min-h-[250px]' editor={editor} />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

const MarkdownEditor = ({ name, label, placeholder, localForm, isDisabled }: MarkdownEditorProps) => {
  // const { watch, setValue } = pick(localForm, ['watch', 'setValue']);

  // TODO handle form options (required, length)

  return (
    <FormField
      control={localForm.control}
      name={name}
      render={({ field }) => {
        return <Tiptap field={field} label={label} />;
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
}

export { MarkdownEditor, type MarkdownEditorProps };
