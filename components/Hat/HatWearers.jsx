/* eslint-disable no-plusplus */
import _ from 'lodash';
import { useMemo, useState } from 'react';
import {
  Icon,
  IconButton,
  Button,
  HStack,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
// import AddressLink from '../AddressLink';
import Link from '../ChakraNextLink';
import { formatAddress, explorerUrl } from '../../lib/general';

const WEARERS_PER_PAGE = 5;

function HatWearers({ wearers, chainId }) {
  const [currentPage, setCurrentPage] = useState(0);

  const wearerPages = useMemo(() => {
    const w = [];
    let tempArray = [];
    for (let i = 0; i < wearers.length; i++) {
      if (tempArray.length === WEARERS_PER_PAGE) {
        w.push(tempArray);
        tempArray = [];
      }
      tempArray.push(wearers[i].id);
    }
    if (tempArray.length > 0) {
      w.push(tempArray);
    }

    return {
      pages: w,
      count: _.size(w),
      pageNumbers: Array.from({ length: _.size(w) }, (__, i) => i + 1),
    };
  }, [wearers]);

  const decrementCurrentPage = () => {
    if (currentPage !== 1) setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage !== wearerPages.count) setCurrentPage((curr) => curr + 1);
  };

  return (
    <Stack align='center' spacing={4}>
      <Stack w='100%'>
        {wearerPages.pages?.[currentPage]?.map((wearer) => (
          <Link href={`${explorerUrl(chainId)}/address/${wearer}`} key={wearer}>
            <Flex
              borderBottom='1px solid'
              key={wearer}
              align='center'
              justify='space-between'
              p={1}
            >
              <Text>{formatAddress(wearer)}</Text>

              <Icon as={FaExternalLinkAlt} />
            </Flex>
          </Link>
        ))}
      </Stack>

      <HStack spacing={3}>
        <IconButton
          icon={<Icon as={BsChevronLeft} />}
          onClick={decrementCurrentPage}
          isDisabled={currentPage === 0}
        />
        {wearerPages?.pageNumbers?.map((number) => {
          return (
            <Button
              onClick={() => setCurrentPage(number)}
              key={number}
              isDisabled={currentPage + 1 === number}
            >
              {number}
            </Button>
          );
        })}
        <IconButton
          icon={<Icon as={BsChevronRight} />}
          onClick={incrementCurrentPage}
          isDisabled={currentPage === wearerPages.count - 1}
        />
      </HStack>
    </Stack>
  );
}

export default HatWearers;
