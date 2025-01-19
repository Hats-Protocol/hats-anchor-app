'use client';

import { Divider } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/config';
import { map, range } from 'lodash';
import { paddingForMaxDepth } from 'utils';

const VerticalDividers = ({ count }: { count: number }) =>
  map(range(count), (index: number) => {
    // skip the first level
    if (index === 0) return null;
    // top level is fixed position
    let padding = CONFIG.DEFAULT_PADDING * CONFIG.CHAKRA_SPACING;
    if (index > 2) {
      // start from 1 ((x = 2) - 1) to match card padding
      padding = (index - 2) * paddingForMaxDepth(count - 2) + CONFIG.DEFAULT_PADDING * CONFIG.CHAKRA_SPACING; // add default padding to match card padding
    }

    return (
      <Divider
        key={index}
        h='100%'
        orientation='vertical'
        position='fixed'
        left={`${padding}px`}
        borderColor='gray.400'
      />
    );
  });

export default VerticalDividers;
