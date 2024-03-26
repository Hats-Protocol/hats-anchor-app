import { Heading, Text } from '@chakra-ui/react';
import { useFeatureFlagEnabled } from 'posthog-js/react';

const FlagTest = () => {
  const flagEnabled = useFeatureFlagEnabled('new_test_flag_1');
  console.log(flagEnabled);

  return (
    <div>
      <Heading>Flag Test</Heading>
      {flagEnabled && <Text>Flag Test</Text>}
    </div>
  );
};

export default FlagTest;
