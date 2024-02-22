import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
} from '@chakra-ui/react';
import { Authority } from 'hats-types';

import { Markdown } from '../atoms';
import ResponsibilityHeader from './ResponsibilityHeader';

const ResponsibilitiesListCard = ({
  responsibility,
}: {
  responsibility?: Authority;
}) => {
  const { label, description, link, imageUrl } = responsibility || {};

  if (!description) {
    return (
      <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
    );
  }
  return (
    <AccordionItem border='none' w='calc(100% + 32px)' ml={-4}>
      <AccordionButton
        borderBottom='1px solid'
        borderColor='transparent'
        _hover={{ borderColor: 'blue.300', bg: 'white' }}
        borderRadius={8}
      >
        <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
        <AccordionIcon ml={2} />
      </AccordionButton>
      <AccordionPanel px={0}>
        <Flex>
          {description && <Markdown smallFont>{description}</Markdown>}
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ResponsibilitiesListCard;
