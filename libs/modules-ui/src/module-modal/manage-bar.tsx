import { Button, Flex, HStack } from '@chakra-ui/react';
import { find, map, some } from 'lodash';
import { ReactNode, useMemo } from 'react';

interface Section {
  label: string;
  value: boolean;
  hasRole: boolean;
  section: ReactNode;
}

interface ManageButton {
  label: string;
  onClick: () => void;
  colorScheme?: string;
  hasRole?: boolean;
  section?: string;
}

interface ManageBarProps {
  sections: Section[];
  buttons: ManageButton[];
}

export const ManageBar = ({ sections, buttons }: ManageBarProps) => {
  const activeSection = useMemo(() => {
    return find(sections, (s) => s.value);
  }, [sections]);
  console.log({ sections, buttons });
  const hasAnyRole = useMemo(() => {
    return (
      some(sections, ({ hasRole }) => hasRole) ||
      some(buttons, ({ hasRole }) => hasRole)
    );
  }, [sections, buttons]);

  if (activeSection) {
    return (
      <Flex
        position='absolute'
        bottom={0}
        minH='100px'
        bg='whiteAlpha.900'
        w='100%'
        borderBottomRightRadius='md'
        borderBottomLeftRadius={{ base: 'md', md: 'none' }}
        borderTop='1px solid'
        borderColor='blackAlpha.200'
        py={{ base: 4, md: 10 }}
      >
        {activeSection.section}
      </Flex>
    );
  }

  if (!hasAnyRole) return null;

  return (
    <Flex
      position='absolute'
      bottom={0}
      minH='100px'
      bg='whiteAlpha.900'
      w='100%'
      borderBottomRightRadius='md'
      borderBottomLeftRadius={{ base: 'md', md: 'none' }}
      borderTop='1px solid'
      borderColor='blackAlpha.200'
      py={{ base: 4, md: 10 }}
    >
      <Flex w='full' justify='center' align='center'>
        <HStack>
          {map(buttons, ({ onClick, label, colorScheme }) => (
            <Button
              variant='outlineMatch'
              colorScheme={colorScheme || 'blue.500'}
              size='sm'
              onClick={onClick}
              key={label}
            >
              {label}
            </Button>
          ))}
        </HStack>
      </Flex>
    </Flex>
  );
};
