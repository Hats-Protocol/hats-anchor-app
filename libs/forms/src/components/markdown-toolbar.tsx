'use client';

import { type Editor } from '@tiptap/react';
import { Bold, Italic, Link, List, ListOrdered, Strikethrough, Underline } from 'lucide-react';
import { Toggle } from 'ui';

type Props = {
  editor: Editor | null;
};

function Toolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className='bg-muted/20 flex items-center gap-1 rounded-t-lg border-b p-2'>
      {/* Text formatting */}
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
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label='Underline'
      >
        <Underline className='h-4 w-4' />
      </Toggle>

      <Toggle
        size='sm'
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label='Strikethrough'
      >
        <Strikethrough className='h-4 w-4' />
      </Toggle>

      {/* Separator */}
      <div className='bg-border/50 h-4 w-px' />

      {/* Link */}
      <Toggle
        size='sm'
        pressed={editor.isActive('link')}
        onPressedChange={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('Enter URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }
        }}
        aria-label='Link'
      >
        <Link className='h-4 w-4' />
      </Toggle>

      {/* Separator */}
      <div className='bg-border/50 h-4 w-px' />

      {/* Headings */}
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label='Heading 1'
      >
        H1
      </Toggle>

      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label='Heading 2'
      >
        H2
      </Toggle>

      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label='Heading 3'
      >
        H3
      </Toggle>

      {/* Separator */}
      <div className='bg-border/50 h-4 w-px' />

      {/* Lists */}
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
  );
}

export { Toolbar };
