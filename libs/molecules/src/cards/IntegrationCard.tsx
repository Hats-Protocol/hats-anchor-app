'use client';

import { Box, Card, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { IntegrationCard as IntegrationCardType } from '@hatsprotocol/constants';
import { map, pick } from 'lodash';
import { Link } from 'ui';

const IntegrationCard = ({ integration }: { integration: IntegrationCardType }) => {
  const { label, icons, link } = pick(integration, ['label', 'icons', 'link']);

  return (
    <Link href={link} className='w-full md:w-[48%] xl:w-[23%]' isExternal>
      <Card border='1px solid' minW='200px'>
        <Flex
          h='100px'
          justify='center'
          align='center'
          position='relative'
          bg='gray.50'
          overflow='hidden'
          borderTopRadius='md'
        >
          <Box
            position='absolute'
            w='100%'
            h='100%'
            bgImage='/bg-topography.svg'
            bgRepeat='repeat'
            bgClip='border-box'
          />
          <HStack spacing={8}>
            {map(icons, (icon: any, i: number) => (
              <Icon as={icon} key={i} w='50px' minH='40px' color='blackAlpha.800' />
            ))}
          </HStack>
        </Flex>
        <Flex p={2}>
          <Text size='xl' variant='medium'>
            {label}
          </Text>
        </Flex>
      </Card>
    </Link>
  );
};

export default IntegrationCard;
