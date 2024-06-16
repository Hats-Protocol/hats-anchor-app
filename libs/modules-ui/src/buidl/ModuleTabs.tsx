'use client';

import {
  Flex,
  Heading,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { orderedChains } from '@hatsprotocol/constants';
import { useHatsModules } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ModuleDetails, SupportedChains } from 'types';
import { chainsMap, explorerUrl, formatAddress } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const ModulesForChain = ({ chainId }: { chainId: SupportedChains }) => {
  const { modules } = useHatsModules({ chainId });

  return (
    <TabPanel minH='450px' as={Flex} direction='column' justify='space-between'>
      <Stack spacing={3}>
        {_.map(modules, (m: ModuleDetails) => (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${m.implementationAddress}`}
            isExternal
          >
            <Flex key={m.id} justify='space-between'>
              <Heading size='xs'>{m.name}</Heading>
              <Text variant='mono'>
                {formatAddress(m.implementationAddress)}
              </Text>
            </Flex>
          </ChakraNextLink>
        ))}
      </Stack>
      <Flex justify='end'>
        <Text>Total Modules: {_.size(modules)}</Text>
      </Flex>
    </TabPanel>
  );
};

const LONG_NAMES = [10, 42161];

const ModuleTabs = () => {
  return (
    <Tabs colorScheme='blue'>
      <TabList overflow='scroll'>
        {_.map(orderedChains, (chainId: SupportedChains) => (
          <Tab
            key={chainId}
            minW={_.includes(LONG_NAMES, chainId) ? '140px' : 'auto'}
            _selected={{
              color: 'blue.500',
              fontWeight: 'bold',
              bg: 'blue.50',
            }}
          >
            {chainsMap(chainId)?.name}
          </Tab>
        ))}
      </TabList>
      {/* indicator not working with overflow: scroll on tablist */}
      {/* <TabIndicator
                mt='-1.5px'
                height='2px'
                bg='blue.500'
                borderRadius='1px'
              /> */}

      <TabPanels>
        {_.map(orderedChains, (chainId: SupportedChains) => (
          <ModulesForChain key={chainId} chainId={chainId} />
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default ModuleTabs;
