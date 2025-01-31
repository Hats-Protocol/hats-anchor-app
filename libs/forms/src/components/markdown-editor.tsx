'use client';

import { pick } from 'lodash';
import { ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import { cn } from 'ui';

import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';
import Toolbar from './toolbar';

// Custom styles to match the design
const editorStyles = {
  '--color-canvas-default': '#ffffff',
  '--color-border-default': '#E2E8F0',
  '--color-fg-default': '#1A202C',
  '--color-canvas-subtle': '#F7FAFC',
  '--color-neutral-muted': '#EDF2F7',
  '--md-toolbar-height': '40px',
  '--md-toolbar-color': '#4A5568',
  '--md-toolbar-background': '#F7FAFC',
  '--md-toolbar-border': '#E2E8F0',
} as React.CSSProperties;

const Tiptap = ({ field, label }: { field: ControllerRenderProps<any, string>; label: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      // Heading.configure({
      //   HTMLAttributes: {
      //     class: 'text-xl font-bold',
      //     levels: [2],
      //   },
    ],
    content: field.value,
    editorProps: {
      attributes: {
        class:
          'rounded-md border min-h-[150px] border-input bg-backgr{ound focus:ring-offset-2 disabled:cursor-not-allows disabled:opacity-50 p-2',
      },
    },
    onUpdate({ editor }) {
      field.onChange(editor.getHTML());
      console.log(editor.getHTML());
    },
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className='flex min-h-[250px] flex-col justify-stretch'>
          <Toolbar editor={editor} />
          <EditorContent editor={editor} />
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
  label: string;
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  isDisabled?: boolean;
}

export { MarkdownEditor, type MarkdownEditorProps };
