'use client';

import { Divider } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import _ from 'lodash';
import { paddingForMaxDepth } from 'utils';

const VerticalDividers = ({ count }: { count: number }) =>
  _.map(_.range(count), (index: number) => {
    // skip the first level
    if (index === 0) return null;
    // top level is fixed position
    let padding = CONFIG.DEFAULT_PADDING * CONFIG.CHAKRA_SPACING;
    if (index > 1) {
      // start from 1 ((x = 2) - 1) to match card padding
      padding = (index - 1) * paddingForMaxDepth(count - 2) + 4; // trying to figure out the right value here (supposed to be 8, but 4 looks better)
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
