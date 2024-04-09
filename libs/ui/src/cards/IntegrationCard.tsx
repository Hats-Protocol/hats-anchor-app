import { As, Box, Card, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { IntegrationCard as IntegrationCardType } from '@hatsprotocol/constants';
import _ from 'lodash';

const IntegrationCard = ({
  integration,
}: {
  integration: IntegrationCardType;
}) => {
  const { label, icons } = _.pick(integration, ['label', 'icons']);

  return (
    <Card border='1px solid' w={{ base: '100%', md: '25%' }} maxW='300px'>
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
          {_.map(icons, (icon: As, i: number) => (
            <Icon
              as={icon}
              key={i}
              w='50px'
              minH='40px'
              color='blackAlpha.800'
            />
          ))}
        </HStack>
      </Flex>
      <Flex p={2}>
        <Text size='xl' variant='medium'>
          {label}
        </Text>
      </Flex>
    </Card>
  );
};

export default IntegrationCard;
