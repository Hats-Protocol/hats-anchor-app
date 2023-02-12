import _ from 'lodash';
import {
  Card,
  CardBody,
  Stack,
  Heading,
  Text,
  CardHeader,
  Link as ChakraLink,
  UnorderedList,
  ListItem,
  Image,
  Grid,
  Flex,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import InlineTable from '../components/InlineTable';
import Layout from '../components/Layout';

// const breadcrumbs = [
//   { name: 'Top Hat', href: '#', current: false },
//   { name: 'Marketing', href: '#', current: false },
//   { name: 'Marketing Manager', href: '#', current: true },
// ];

const tempHeadings = ['Name', 'Title', 'Email', 'Role'];

const tempData = [
  {
    name: 'Lindsay Walson',
    title: 'Front-end Developer',
    email: 'lindsay.walson@example.com',
    role: 'Member',
  },
  {
    name: 'Bindsay Walson',
    title: 'Front-end Developer',
    email: 'lindsay.walson@example.com',
    role: 'Member',
  },
  {
    name: 'Cindsay Walson',
    title: 'Front-end Developer',
    email: 'lindsay.walson@example.com',
    role: 'Member',
  },
];

const details = {
  responsibilities: [
    'Fugiat ipsum ipsum deserunt culpa aute sint do.',
    'Ipsum ipsum deserunt culpa aute sint do.',
    'Aliquip ipsum ipsum deserunt culpa aute sint do.',
  ],
  authorities: [
    'Ipsum ipsum deserunt culpa aute sint do.',
    'Aliquip ipsum ipsum deserunt culpa aute sint do.',
    'Fugiat ipsum ipsum deserunt culpa aute sint do.',
  ],
  qualifications: [
    'Fugiat ipsum ipsum deserunt culpa aute sint do.',
    'Fugiat ipsum ipsum deserunt culpa aute sint do.',
  ],
};

export default function Example() {
  return (
    <Layout>
      <Grid gridTemplateColumns='1fr 2fr' gap={8}>
        <Stack spacing={4}>
          <Card>
            <Flex justify='center'>
              <Image
                src='https://ipfs.io/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
                height='300px'
                alt='Hat Image'
              />
            </Flex>
          </Card>

          <Card>
            <CardHeader>
              <Heading fontSize='2xl'>Hat Description</Heading>
              <Divider mt={4} />
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Stack>
                  <Heading size='md'>Summary</Heading>
                  <Text fontSize='sm'>
                    Odio nisi, lectus dis nulla. Ultrices maecenas vitae rutrum
                    dolor ultricies donec risus sodales. Tempus quis et. Odio
                    nisi, lectus dis nulla. Ultrices maecenas vitae rutrum dolor
                    ultricies donec risus sodales. Tempus quis et.
                  </Text>
                </Stack>
                {_.map(_.keys(details), (key) => (
                  <Stack key={key}>
                    <Heading size='md'>{_.startCase(key)}</Heading>
                    <UnorderedList>
                      {details[key].map((item) => (
                        <ListItem key={item} fontSize='sm' mx='5%'>
                          {item}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Stack>
                ))}
              </Stack>

              <ChakraLink as={Link} href='/hats/1.1'>
                Read full description
              </ChakraLink>
            </CardBody>
          </Card>
        </Stack>

        <Stack spacing={6}>
          <Stack>
            <Heading>Marketing Manager Hat</Heading>
            <Text>
              Hat ID 1.1 |
              27065258958819196981364933114703301105956039517941121592357921226752
            </Text>
          </Stack>
          <Card>
            <CardBody>
              <InlineTable
                title='Authorities (Token Gates)'
                headings={tempHeadings}
                rows={tempData}
                keys={_.keys(_.first(tempData))}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <InlineTable
                title='Accountability (Admin / Eligibility / Toggle)'
                headings={tempHeadings}
                rows={tempData}
                keys={_.keys(_.first(tempData))}
              />
            </CardBody>
          </Card>
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
        </Stack>
      </Grid>
    </Layout>
  );
}
