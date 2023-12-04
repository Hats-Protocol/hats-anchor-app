import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  Icon,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { DetailsItem } from 'hats-types';
import { ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { validateURL } from '../../../lib/general';
import ChakraNextLink from '../../atoms/ChakraNextLink';

const AccordionWrap = ({
  title,
  children,
  inline = false,
}: {
  title?: string;
  children: ReactNode;
  inline?: boolean;
}) => (
  <Accordion allowToggle>
    <AccordionItem border={inline ? '0' : undefined}>
      <AccordionButton px={inline ? 0 : undefined}>
        <Heading
          size={inline ? 'xs' : 'sm'}
          fontWeight='medium'
          textTransform='uppercase'
        >
          {title || 'Qualifications'}
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>{children}</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const DetailList = ({
  title,
  details,
  inline = false,
}: {
  title: string;
  details?: DetailsItem[];
  inline?: boolean;
}) => {
  const toggleOrEligibility =
    title === 'Eligibility Criteria' || title === 'Toggle Criteria';

  const renderDetails = () => (
    <Stack>
      {!toggleOrEligibility && (
        <Heading
          size={toggleOrEligibility ? 'xs' : 'sm'}
          fontWeight='medium'
          textTransform='uppercase'
        >
          {title}
        </Heading>
      )}
      <UnorderedList>
        {details?.length ? (
          details.map(({ label, link }: DetailsItem) => (
            <ListItem key={label}>
              <Flex justifyContent='space-between'>
                {link && validateURL(link) ? (
                  <ChakraNextLink isExternal href={link}>
                    <Text>{label}</Text>
                  </ChakraNextLink>
                ) : (
                  <Text>{label}</Text>
                )}
                {link && validateURL(link) && (
                  <ChakraNextLink isExternal href={link} display='block'>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </ChakraNextLink>
                )}
              </Flex>
            </ListItem>
          ))
        ) : (
          <ListItem>None</ListItem>
        )}
      </UnorderedList>
    </Stack>
  );

  return toggleOrEligibility ? (
    <AccordionWrap title={title} inline={inline}>
      {renderDetails()}
    </AccordionWrap>
  ) : (
    renderDetails()
  );
};

export default DetailList;
