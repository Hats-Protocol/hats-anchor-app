'use client';

import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Strike from '@tiptap/extension-strike';
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
      StarterKit.configure({
        heading: false, // we'll configure heading separately
        bulletList: false, // we'll configure lists separately
        orderedList: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          1: { class: 'text-2xl font-bold' },
          2: { class: 'text-xl font-bold' },
          3: { class: 'text-lg font-bold' },
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-outside ml-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-outside ml-4',
        },
      }),
      ListItem,
      Bold.configure(),
      Italic.configure(),
      Strike.configure(),
    ],
    content: converter.makeHtml(field.value),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none rounded-md border min-h-[150px] max-h-[400px] overflow-y-auto border-input bg-background focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-2',
      },
      scrollThreshold: 80,
      scrollMargin: 80,
    },
    onUpdate({ editor }) {
      field.onChange(editor.getHTML());
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
