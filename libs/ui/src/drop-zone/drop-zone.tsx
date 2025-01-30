import { UploadCloud } from 'lucide-react';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '../lib/utils';

export interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
  onDrop?: (acceptedFiles: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

const DropZone = React.forwardRef<HTMLDivElement, DropZoneProps>(
  ({ className, disabled = false, onDrop, maxSize, accept, ...props }, ref) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      disabled,
      maxSize,
      accept,
    });

    return (
      <div
        {...getRootProps()}
        ref={ref}
        className={cn(
          'border-muted-foreground/25 hover:border-muted-foreground/40 group relative rounded-lg border-2 border-dashed p-12 text-center',
          isDragActive && 'border-muted-foreground/50',
          disabled && 'pointer-events-none opacity-60',
          className,
        )}
        {...props}
      >
        <input {...getInputProps()} />

        <div className='text-muted-foreground'>
          <UploadCloud className='mx-auto mb-4 h-10 w-10' />
          <p className='mb-2 text-sm'>Drag & drop files here, or click to select files</p>
          <p className='text-xs'>
            {maxSize ? `Maximum file size: ${Math.round(maxSize / 1024 / 1024)}MB` : 'No file size limit'}
          </p>
        </div>
      </div>
    );
  },
);
DropZone.displayName = 'DropZone';

export { DropZone };
