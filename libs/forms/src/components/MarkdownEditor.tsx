'use client';

import '@uiw/react-md-editor/markdown-editor.css';

import MDEditor from '@uiw/react-md-editor';
import { pick } from 'lodash';
import { UseFormReturn } from 'react-hook-form';

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
  isDisabled,
}: {
  name: string;
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  isDisabled?: boolean;
}) => {
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
  const value = watch(name);

  return (
    <div
      className={`rounded-lg border border-gray-200 [&_.w-md-editor-input]:bg-white [&_.w-md-editor-toolbar]:rounded-t-lg [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-gray-200 [&_.w-md-editor-toolbar]:bg-gray-50 [&_.w-md-editor]:rounded-lg [&_.w-md-editor]:bg-white ${
        isDisabled ? 'cursor-not-allowed opacity-60' : ''
      }`}
      style={editorStyles}
      data-color-mode='light'
    >
      <MDEditor
        value={value}
        onChange={isDisabled ? undefined : (value) => setValue(name, value || '')}
        preview='edit'
        height={400}
        className='!border-0'
        textareaProps={{ placeholder, disabled: isDisabled }}
        hideToolbar={false}
        // toolbarHeight={40} // deprecated?
      />
    </div>
  );
};

export default MarkdownEditor;
