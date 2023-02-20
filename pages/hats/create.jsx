import _ from 'lodash';
import { Card, CardBody, Stack, Heading, Text } from '@chakra-ui/react';
import { useState } from 'react';
import Layout from '../../components/Layout';
import RadioBox from '../../components/RadioBox';

// const navigation = [
//   { name: 'Create a new hat', href: '#', icon: UserCircleIcon },
//   { name: 'Add authorities', href: '#', icon: SquaresPlusIcon },
//   { name: 'Mint your hat', href: '#', icon: UserGroupIcon },
// ];

// TODO migrate to form modal
const difficulties = {
  1: 'Normal',
  2: 'Hard',
  3: 'Very Hard',
};

const CreateHat = () => {
  const [step, setStep] = useState(1);
  const [difficulty, setDifficulty] = useState();

  // TODO
  // - setDifficulty and change step
  // - add image upload
  // - (double check image input)
  // - add form validation
  // - handle form submission
  // - handle calling the smart contract

  async function handleFormSubmission() {
    // this function gets called when the form onSubmit button gets hit
    // here you will then call the smart contract and resolve it's value
    // might want to use await to wait for response of the smart contract
  }

  // step 1 select customization
  // step 2 add authorities
  // step 3 mint your hat

  return (
    <Layout>
      <Card>
        <CardBody>
          {step === 1 && (
            <Stack>
              <Heading as='h3'>Create a new hat</Heading>
              <Text>How much would you like to customize this new hat?</Text>
              <RadioBox
                name='test'
                label='cool there is a label still'
                options={_.values(difficulties)}
                value={difficulty}
                updateRadio={setDifficulty}
              />
            </Stack>
          )}
        </CardBody>
      </Card>
    </Layout>
  );
};

export default CreateHat;
