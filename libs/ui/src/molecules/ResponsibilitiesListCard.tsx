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
    <AccordionItem border='none' mb={4} my={2}>
      <AccordionButton _hover={{ bg: 'white' }} px={0}>
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
