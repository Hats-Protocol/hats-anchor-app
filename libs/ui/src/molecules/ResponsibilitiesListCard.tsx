import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Card,
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
      <Card borderRadius='4px' mb={4} p={4}>
        <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
      </Card>
    );
  }
  return (
    <Card borderRadius='4px' mb={4}>
      <AccordionItem border='none' mb={4} my={2}>
        <AccordionButton _hover={{ bg: 'white' }}>
          <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} />
          <AccordionIcon ml={2} />
        </AccordionButton>
        <AccordionPanel pb={4} pl={20}>
          <Flex>
            {description && <Markdown smallFont>{description}</Markdown>}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Card>
  );
};

export default ResponsibilitiesListCard;
