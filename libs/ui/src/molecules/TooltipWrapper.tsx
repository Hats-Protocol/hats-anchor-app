'use client';

import { Tooltip } from '@chakra-ui/react';

// TooltipWrapper component
const TooltipWrapper = ({
  children,
  label,
  isSameChain,
}: {
  children: React.ReactNode;
  label: string;
  isSameChain: boolean;
}) => (
  <Tooltip label={!isSameChain ? label : ''} shouldWrapChildren>
    {children}
  </Tooltip>
);

export default TooltipWrapper;
