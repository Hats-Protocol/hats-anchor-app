'use client';

import { type Editor } from '@tiptap/react';
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, StrikethroughIcon } from 'lucide-react';
import { Toggle } from 'ui';

type Props = {
  editor: Editor | null;
};

function Toolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className='border-input my-2 flex flex-wrap items-center gap-1 rounded-lg border p-1'>
      <div className='flex gap-1 border-r pr-1'>
        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label='Heading 1'
        >
          <Heading1 className='h-4 w-4' />
        </Toggle>
        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label='Heading 2'
        >
          <Heading2 className='h-4 w-4' />
        </Toggle>
        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label='Heading 3'
        >
          <Heading3 className='h-4 w-4' />
        </Toggle>
      </div>

      <div className='flex gap-1 border-r pr-1'>
        <Toggle
          size='sm'
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label='Bold'
        >
          <Bold className='h-4 w-4' />
        </Toggle>
        <Toggle
          size='sm'
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label='Italic'
        >
          <Italic className='h-4 w-4' />
        </Toggle>
        <Toggle
          size='sm'
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label='Strikethrough'
        >
          <StrikethroughIcon className='h-4 w-4' />
        </Toggle>
      </div>

      <div className='flex gap-1'>
        <Toggle
          size='sm'
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label='Bullet List'
        >
          <List className='h-4 w-4' />
        </Toggle>
        <Toggle
          size='sm'
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label='Numbered List'
        >
          <ListOrdered className='h-4 w-4' />
        </Toggle>
      </div>
    </div>
  );
}

export { Toolbar };
