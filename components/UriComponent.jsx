import { Card, CardBody, Heading, Stack } from '@chakra-ui/react';
import React from 'react';
import _ from 'lodash';
import { parseUri, decodeUri } from '../lib/general';
import InlineTable from './InlineTable';

const hatTableHeaders = ['Name', 'Domain', 'Hat ID', 'Pretty Hat ID', 'Status'];
const propertiesTableHeaders = [
  'Current Supply',
  'Supply Cap',
  'Admin Hat ID',
  'Admin Pretty Hat ID',
  'Oracle Address',
  'Conditions Address',
];

const UriComponent = ({ c }) => {
  const legibleUri = parseUri(decodeUri(c));
  const { properties } = legibleUri;

  const hatTableRows = [
    {
      name: legibleUri['name & description'],
      domain: legibleUri.domain,
      id: legibleUri.id,
      prettyId: legibleUri['pretty id'],
      status: legibleUri.status,
    },
  ];

  const propertiesTableRows = [
    {
      currentSupply: properties['current supply'],
      supplyCap: properties['supply cap'],
      adminId: properties['admin (id)'],
      adminPrettyId: properties['admin (pretty id)'],
      oracleAddress: properties['oracle address'],
      conditionsAddress: properties['conditions address'],
    },
  ];

  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <Stack>
            <Heading>Hats Protocol 4 lyfe</Heading>
          </Stack>

          <InlineTable
            title='Hat Details'
            headings={hatTableHeaders}
            rows={hatTableRows}
            keys={_.keys(_.first(hatTableRows))}
          />

          <InlineTable
            title='Hat Properties'
            headings={propertiesTableHeaders}
            rows={propertiesTableRows}
            keys={_.keys(_.first(propertiesTableRows))}
          />
        </Stack>
      </CardBody>
    </Card>
  );
};

export default UriComponent;
