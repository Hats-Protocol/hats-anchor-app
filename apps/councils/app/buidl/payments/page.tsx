import { UnlockSubscriptionDev } from 'forms';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';

const LOOP_LINK =
  'https://demo.checkout.loopcrypto.xyz/7db01617-c845-4167-a5ea-9d3c49c9f83c/d44cdb6c-d1b3-4d6e-9425-92e329d58e2c?email=hq%40hatsprotocol.xyz&minimumBalanceRequired=600';

const LoopSubscriptionDev = () => {
  return (
    <div className='flex flex-col items-center gap-4'>
      <h1>Loop Subscription Dev</h1>

      <a href={LOOP_LINK}>
        <Button variant='outline-blue'>Start Subscription</Button>
      </a>
    </div>
  );
};

const Payments = () => {
  return (
    <div className='mx-auto flex max-w-screen-lg flex-col gap-6'>
      <div className='flex justify-center'>
        <div className='flex flex-col items-center gap-1'>
          <h1 className='text-2xl font-bold'>Payments Playground</h1>
          <p className='text-muted-foreground text-sm'>Testing out payment features</p>
        </div>
      </div>

      <Tabs defaultValue='unlock' className='flex w-full flex-col gap-6'>
        <TabsList className='w-full justify-center'>
          <TabsTrigger value='unlock'>Unlock</TabsTrigger>
          <TabsTrigger value='loop'>Loop</TabsTrigger>
        </TabsList>
        <TabsContent value='unlock'>
          <UnlockSubscriptionDev />
        </TabsContent>
        <TabsContent value='loop'>
          <LoopSubscriptionDev />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;
