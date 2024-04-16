import { Spinner, Stack, Text } from '@chakra-ui/react';
import { PROPOSALS } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { useProposalDetails } from 'hooks';
import _ from 'lodash';
import { idToIp } from 'shared';

import ProposalCountdown from './ProposalCountdown';
import ProposalDetails from './ProposalDetails';

// TODO fix hardcoded proposal id here

const ProposalView = () => {
  const { selectedHat, chainId } = useEligibility();

  // Assuming the structure of PROPOSALS is corrected as needed
  const { execute, elect } = _.pick(
    _.get(
      _.get(
        _.get(PROPOSALS, chainId as number), // chain first
        idToIp(selectedHat?.id), // then hat id
      ),
      107187481, // followed by proposal id
    ),
    ['execute', 'elect'],
  );

  const proposalId = chainId && (execute || elect);
  const { data: proposal, isLoading, error } = useProposalDetails(proposalId);
  const hasProposalStarted = proposal && proposal.start * 1000 <= Date.now();

  if (isLoading) return <Spinner />;
  if (error || !proposal) return <Text>Failed to load proposal details.</Text>;

  return (
    <Stack spacing={4}>
      {!hasProposalStarted && (
        <ProposalCountdown
          start={proposal.start}
          title={proposal.title}
          proposalId={proposal.id}
          spaceId={proposal.space.id}
        />
      )}
      {hasProposalStarted && <ProposalDetails proposal={proposal} />}
    </Stack>
  );
};

export default ProposalView;
