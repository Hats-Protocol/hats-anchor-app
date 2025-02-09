'use client';

import { map, range } from 'lodash';
import { cn } from 'ui';
import { paddingForMaxDepth } from 'utils';

const DEFAULT_PADDING = 2;
const INDENT_SPACING = 4;

const VerticalDividers = ({ count }: { count: number }) =>
  map(range(count), (index: number) => {
    // skip the first level
    if (index === 0) return null;
    // top level is fixed position
    let padding = DEFAULT_PADDING * INDENT_SPACING;
    if (index > 2) {
      // start from 1 ((x = 2) - 1) to match card padding
      padding = (index - 2) * paddingForMaxDepth(count - 2) + DEFAULT_PADDING * INDENT_SPACING; // add default padding to match card padding
    }

    return <hr key={index} className={cn('h-100% fixed absolute w-[1px] border-gray-400', `left-[${padding}px]`)} />;
  });

export { VerticalDividers };
