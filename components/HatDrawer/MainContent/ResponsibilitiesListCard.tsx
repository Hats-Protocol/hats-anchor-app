import { Card, Flex } from '@chakra-ui/react';

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
    <Card borderRadius='4px' mb={4} px={4} py={2}>
      <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
      <Flex ml={14}>
        {description && <Markdown smallFont>{description}</Markdown>}
      </Flex>
    </Card>
  );
};

export default ResponsibilitiesListCard;
