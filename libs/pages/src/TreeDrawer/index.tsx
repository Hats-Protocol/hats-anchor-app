'use client';

import { Box } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
import { useState } from 'react';

import BottomMenu from './BottomMenu';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const TreeDrawer = () => {
  const [accordionIndex, setAccordionIndex] = useState<number[]>([]);
  const isExpanded = _.includes(accordionIndex, 0);
  const { editMode } = useTreeForm();

  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      right={0}
      zIndex={12}
      background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
    >
      <TopMenu />
      <MainContent isExpanded={isExpanded} />
      <BottomMenu
        isExpanded={isExpanded}
        setAccordionIndex={setAccordionIndex}
      />
    </Box>
  );
};

export default TreeDrawer;
