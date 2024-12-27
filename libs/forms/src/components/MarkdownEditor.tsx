'use client';

import '@uiw/react-md-editor/markdown-editor.css';

import { pick } from 'lodash';
import dynamic from 'next/dynamic';
import { UseFormReturn } from 'react-hook-form';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

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

const MarkdownEditor = ({
  name,
  placeholder,
  localForm,
}: {
  name: string;
  placeholder: string;
  localForm: UseFormReturn<any>;
}) => {
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
  const value = watch(name);

  return (
    <div
      className='rounded-lg border border-gray-200 [&_.w-md-editor-input]:bg-white [&_.w-md-editor-toolbar]:rounded-t-lg [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-gray-200 [&_.w-md-editor-toolbar]:bg-gray-50 [&_.w-md-editor]:rounded-lg [&_.w-md-editor]:bg-white'
      style={editorStyles}
      data-color-mode='light'
    >
      <MDEditor
        value={value}
        onChange={(value) => setValue(name, value || '')}
        preview='edit'
        height={400}
        className='!border-0'
        textareaProps={{ placeholder }}
        hideToolbar={false}
        toolbarHeight={40}
      />
    </div>
  );
};

export default MarkdownEditor;
