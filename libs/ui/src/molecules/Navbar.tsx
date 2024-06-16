import { ChakraNextLink } from '../atoms';
import ConnectWallet from './ConnectWallet';
import TreeLink from './TreeLink';
import WearerButton from './WearerButton';

const Navbar = ({
  tabName = 'test',
  chainId = 1,
}: {
  tabName?: string;
  chainId: number;
}) => {
  // const { setCommandPalette: setOpen } = localOverlay;

  // const isCtrl = useMemo(() => {
  //   if (typeof window === 'undefined') return false;
  //   return _.includes(['Windows', 'Linux', 'Unix'], getOperatingSystem(window));
  // }, []);

  return (
    <div className='flex w-full justify-between bg-white fixed z-[10] h-[75px] px-6 shadow-md border-b-1 border-gray-500'>
      <div className='flex gap-6 py-1'>
        <ChakraNextLink href='/'>
          <img src='/icon.jpeg' className='h-full' alt='Hats Logo' />
        </ChakraNextLink>
        <div className='flex gap-5 items-center'>
          <TreeLink tabName={tabName} />

          <WearerButton />
        </div>
      </div>

      <div className='flex gap-2 items-center'>
        {/* <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
          <IconButton
            icon={<Icon as={BsSearch} h='25px' w='25px' />}
            onClick={() => setOpen?.(true)}
            aria-label='Search'
            variant='ghost'
          />
        </Tooltip> */}

        <ConnectWallet />
      </div>
    </div>
  );
};

export default Navbar;
