// import { PaperClipIcon } from '@heroicons/react/20/solid'
import { ethers, BigNumber } from 'ethers';
import _ from 'lodash';
import { useState } from 'react';
import {
  Flex,
  Button,
  Box,
  Input,
  HStack,
  Card,
  CardBody,
  Stack,
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import InlineTable from '../../components/InlineTable';
import { tempHeadings, tempData } from '../../constants/temp';

import abi from '../../contracts/Hats.json';

const HATS_POLYGON_ADDRESS = '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A';
// '0x95647f88dcbc12986046fc4f49064edd11a25d38' (polygon, current is goerli)
// const node = "https://polygon-mainnet.infura.io/v3/f7b3bd0fdb174f0fac4aded22da36341";
// const provider = new ethers.providers.WebSocketProvider(node);
const provider = ethers.getDefaultProvider('goerli');

const contract = new ethers.Contract(HATS_POLYGON_ADDRESS, abi, provider);

const ViewTree = () => {
  const [hatId, setHatId] = useState('');
  const [hatIds, setHatIds] = useState([]);
  // const [contractVar, setContractVar] = useState("")
  const [contractVars, setContractVars] = useState([]);

  // async function getContractUri(hatId: string) {
  //   const contractVar = await contract.uri(hatId)
  //   setContractVar(contractVar)
  //   setFormSubmitted(true)
  // }

  function buildNextId(hId, n, level) {
    const hatIdAsBigNum = BigNumber.from(hId);

    /*
      have the hatId 26959946667150639794667015087019630673637144422540572481103610249216
      pretty version 0x0000000100000000000000000000000000000000000000000000000000000000
      what we want:  0x0000000101000000000000000000000000000000000000000000000000000000
      what's incremented: the byte at the level
      this is equal to 2 ^ (8 * (28 - 1 - level)
      -1 is because we are building Ids for level 1, given a level 0 hat, etc
      ie 2^224 = hatId above
      and 2^224 + 2^216 = desired return of
        27065258958819196981364933114703301105956039517941121592357921226752

      so, increment = input n * (2 ^ (8 * (28 - level))
    */
    const increment = BigNumber.from(2)
      .pow(8 * (28 - 1 - level))
      .mul(n);

    const nextId = hatIdAsBigNum.add(increment).toString();
    console.log('nextId');
    console.log(nextId);
    return nextId;
  }

  return (
    <Layout>
      <Stack spacing={6}>
        <HStack>
          {/* <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700"
          >
            Enter a Hat ID
          </label> */}
          <Box>
            <Input
              onChange={(e) => setHatId(e.target.value)}
              id='hatid'
              name='hatid'
              type='text'
              required
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm'
              placeholder='0xdec1a551edc8E90514F3b74740792bCCdA267b00'
            />
          </Box>
          <Flex justify='center'>
            <Button>Get Hats</Button>
          </Flex>
        </HStack>
        <Box>
          <Card>
            <CardBody>
              <InlineTable
                title='Wearers / Supply'
                headings={tempHeadings}
                rows={tempData}
                keys={_.keys(_.first(tempData))}
              />
            </CardBody>
          </Card>
        </Box>
      </Stack>
    </Layout>
  );
};

export default ViewTree;

// personal top hat BREAKS!
// 53919893334301279589334030174039261347274288845081144962207220498432
// mastermind hat id
// 54025205625969836776031948201722931779593183940481694073461531475968

// alpha hat
// 27065258958819196981364933114703301105956039517941121592357921226752
// downstream hat
// 27065670334958527282875471856998940443582285201907529987323758379008

// function URIComponent(c) {
//   var legibleUri = parseUri(decodeUri(c))
//   var properties = legibleUri.properties
//   return <section>
//       <p>Name: {legibleUri['name & description']}</p>
//       <p>Domain: {legibleUri['domain']}</p>
//       <p>Hat ID: {legibleUri['id']}</p>
//       <p>Pretty Hat ID: {legibleUri['pretty id']}</p>
//       <p>Status: {legibleUri['status']}</p>
//       <p>Properties:</p>
//       <p>Current Supply: {properties['current supply']}</p>
//       <p>Supply Cap: {properties['supply cap']}</p>
//       <p>Admin Hat ID: {properties['admin (id)']}</p>
//       <p>Admin Pretty Hat ID: {properties['admin (pretty id)']}</p>
//       <p>Oracle Address: {properties['oracle address']}</p>
//       <p>Conditions Address: {properties['conditions address']}</p>
//     </section>
// }
