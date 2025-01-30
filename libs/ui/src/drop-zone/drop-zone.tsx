'use client';

import * as React from 'react';
import { type DropzoneInputProps, type DropzoneRootProps } from 'react-dropzone';
import { ImageFile } from 'types';

import { cn } from '../lib/utils';

interface DropZoneProps {
  label?: string;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isFocused?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
  isFullWidth?: boolean;
  image?: ImageFile;
  imageUrl?: string | null;
  isNewImage?: boolean;
  maxSize?: number;
}

const DropZone = React.forwardRef<HTMLDivElement, DropZoneProps>(
  (
    {
      label,
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject,
      isFullWidth,
      image,
      imageUrl,
      isNewImage,
      maxSize,
    },
    ref,
  ) => {
    React.useEffect(() => {
      return () => {
        if (image?.preview) {
          URL.revokeObjectURL(image.preview);
        }
      };
    }, [image]);

    return (
      <div ref={ref} className='flex w-full flex-col gap-2'>
        {label && <h2 className='text-muted-foreground text-sm font-medium uppercase'>{label}</h2>}
        <div className='flex gap-3'>
          {(image || imageUrl) && (
            <div className='flex flex-wrap'>
              <div
                className={cn(
                  'inline-flex h-[100px] w-[100px] items-center justify-center rounded-sm border p-1',
                  isNewImage ? 'border-2 border-dashed border-cyan-500' : 'border-border',
                )}
              >
                <div className='min-w-0 overflow-hidden'>
                  <img
                    src={image?.preview ?? imageUrl ?? undefined}
                    className='block h-full w-auto object-cover'
                    onLoad={() => {
                      if (image?.preview) URL.revokeObjectURL(image.preview);
                    }}
                    alt='Uploaded item from user'
                  />
                </div>
              </div>
            </div>
          )}

          <div
            {...getRootProps()}
            className={cn(
              'flex h-[100px] flex-grow cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed bg-[#fafafa] p-5 text-[#bdbdbd] outline-none transition-colors duration-200 ease-in-out',
              isFullWidth ? 'w-full' : 'w-[83%]',
              isFocused && 'border-[#2196F3]',
              isDragAccept && 'border-[#00E676]',
              isDragReject && 'border-[#FF1744]',
            )}
          >
            <input {...getInputProps()} type='file' className='hidden' />
            <p className='text-sm'>
              {image
                ? 'Image uploaded! For another image, drag n drop, or click to select'
                : 'Drag n drop, or click to select'}
            </p>
            {maxSize && <p className='text-xs'>Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB</p>}
          </div>
        </div>
      </div>
    );
  },
);
DropZone.displayName = 'DropZone';

export { DropZone, type DropZoneProps };
