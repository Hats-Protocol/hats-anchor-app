import { UnlockSubscriptionDev } from 'forms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';

const LoopSubscriptionDev = () => {
  return (
    <div>
      <h1>Loop Subscription Dev</h1>
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
