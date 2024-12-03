import { Button } from '@chakra-ui/react';

const Mails = () => {
  return (
    <div>
      <h1>Mail Test</h1>

      <div>
        <Button>Send &quot;You&apos;ve been invited&quot;</Button>
        <Button>Send &quot;You&apos;ve been added to a council&quot;</Button>
        <Button>
          Send &quot;You&apos;ve been removed from a council&quot;
        </Button>
      </div>
    </div>
  );
};

export default Mails;
