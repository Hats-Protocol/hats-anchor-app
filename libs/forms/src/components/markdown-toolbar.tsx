'use client';

import { type Editor } from '@tiptap/react';
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, StrikethroughIcon } from 'lucide-react';
import { Toggle } from 'ui';

type Props = {
  editor: Editor | null;
  isDisabled?: boolean;
};

function Toolbar({ editor, isDisabled }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className='border-input my-2 flex gap-3 rounded-lg border p-1'>
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={isDisabled}
      >
        <Heading1 className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={isDisabled}
      >
        <Heading2 className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={isDisabled}
      >
        <Heading3 className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={isDisabled}
      >
        <Bold className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={isDisabled}
      >
        <Italic className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={isDisabled}
      >
        <StrikethroughIcon className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        disabled={isDisabled}
      >
        <List className='h-4 w-4' />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={isDisabled}
      >
        <ListOrdered className='h-4 w-4' />
      </Toggle>
    </div>
  );
}

export { Toolbar };
