import { Box, Flex } from '@chakra-ui/react';

import Markdown from '@/components/atoms/Markdown';
import { Authority } from '@/types';

import ResponsibilityHeader from './ResponsibilityHeader';

const ResponsibilitiesListCard = ({
  responsibility,
}: {
  responsibility?: Authority;
}) => {
  const { label, description, link, imageUrl } = responsibility || {};

  return (
    <Box
      borderRadius='4px'
      border='1px solid var(--gray-100, #EDF2F7)'
      boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
      mb={4}
      px={4}
      py={2}
    >
      <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
      <Flex ml={14}>
        {description && <Markdown smallFont>{description}</Markdown>}
      </Flex>
    </Box>
  );
};

export default ResponsibilitiesListCard;
