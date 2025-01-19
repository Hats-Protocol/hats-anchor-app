'use client';

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
import { ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { DetailsItem } from 'types';
import { Link } from 'ui';
import { validateURL } from 'utils';

const AccordionWrap = ({
  title,
  children,
  inline = false,
}: {
  title?: string;
  children: ReactNode;
  inline?: boolean;
}) => (
  <Accordion allowToggle px={{ base: 4, md: 10 }}>
    <AccordionItem border={inline ? '0' : undefined}>
      <AccordionButton px={inline ? 0 : undefined}>
        <Heading size={inline ? 'xs' : 'sm'} variant='medium' textTransform='uppercase'>
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
  const toggleOrEligibility = title === 'Eligibility Criteria' || title === 'Toggle Criteria';

  const renderDetails = () => (
    <Stack px={{ base: 4, md: 0 }}>
      {!toggleOrEligibility && (
        <Heading size={toggleOrEligibility ? 'xs' : 'sm'} variant='medium' textTransform='uppercase'>
          {title}
        </Heading>
      )}
      <UnorderedList>
        {details?.length ? (
          details.map(({ label, link }: DetailsItem) => (
            <ListItem key={label}>
              <Flex justifyContent='space-between'>
                {link && validateURL(link) ? (
                  <Link isExternal href={link}>
                    <Text size='sm'>{label}</Text>
                  </Link>
                ) : (
                  <Text size='sm'>{label}</Text>
                )}
                {link && validateURL(link) && (
                  <Link href={link} className='block' isExternal>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </Link>
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

  // TODO stable component render
  return toggleOrEligibility ? (
    <AccordionWrap title={title} inline={inline}>
      {renderDetails()}
    </AccordionWrap>
  ) : (
    renderDetails()
  );
};

export default DetailList;
