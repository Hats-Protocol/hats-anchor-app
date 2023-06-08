import { IconButton, Icon, Select, HStack, Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

// TODO archive if not used after v1

const networkOptions = [
  {
    value: 5,
    label: 'Goerli',
  },
  // {
  //   value: 1,
  //   label: 'Mainnet',
  // },
];

const SearchBar = () => {
  const [value, setValue] = useState('');
  const [chainId] = useState(5); // TODO set default

  const router = useRouter();

  const navigateToTree = () => {
    router.push(`/tree/${chainId}/${value}`);
  };

  function handleValueChange(e: any) {
    setValue(e.target.value);
  }

  const handleNetworkChange = (e: any) => {
    // eslint-disable-next-line no-console
    console.log(e);
    // setChainId(e)
  };

  return (
    <HStack>
      <Select value={chainId} onChange={handleNetworkChange}>
        {networkOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        value={value}
        onChange={(e) => handleValueChange(e)}
        variant='outline'
        placeholder='Search Tree Id'
        minW='200px'
      />
      <IconButton
        icon={<Icon as={FaSearch} />}
        onClick={navigateToTree}
        aria-label='Search'
      />
    </HStack>
  );
};

export default SearchBar;
