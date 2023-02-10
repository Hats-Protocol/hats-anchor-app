import React from 'react';
import { Flex, Image, HStack, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

const navigation = [
  { name: 'View Tree', href: '/hats/tree' },
  { name: 'View Hat', href: '/hats/hat' },
  { name: 'Create Hat', href: '/hats/create' },
];

const Navbar = () => {
  return (
    <Flex w='100%' justify='space-between' align='center' px={8}>
      <HStack spacing={6}>
        <ChakraLink as={Link} href='/'>
          <Image
            src='https://ipfs.io/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
            alt='Hats Protocol'
            height='75px'
          />
        </ChakraLink>
        <HStack spacing={3}>
          {navigation.map((item) => (
            <ChakraLink as={Link} href={item.href} key={item.name}>
              {item.name}
            </ChakraLink>
          ))}
        </HStack>
      </HStack>
      <ConnectWallet />
    </Flex>
  );
};

export default Navbar;

// {/* <header className="bg-white shadow">
//       <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
//         <Popover className="flex h-16 justify-between">
//           <div className="flex px-2 lg:px-0">
//             <div className="flex flex-shrink-0 items-center">

//             </div>
//             <nav
//               aria-label="Global"
//               className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4"
//             >
//               {navigation.map((item) => (
//                 <a
//                   key={item.name}
//                   href={item.href}
//                   className="px-3 py-2 text-sm font-medium text-gray-900"
//                 >
//                   {item.name}
//                 </a>
//               ))}
//             </nav>
//           </div>
//           <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
//             <div className="w-full max-w-lg lg:max-w-xs">
//               <label htmlFor="search" className="sr-only">
//                 Search
//               </label>
//               <div className="relative">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//                   <MagnifyingGlassIcon
//                     className="h-5 w-5 text-gray-400"
//                     aria-hidden="true"
//                   />
//                 </div>
//                 <input
//                   id="search"
//                   name="search"
//                   className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 shadow-sm focus:border-blue-600 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
//                   placeholder="Search"
//                   type="search"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center lg:hidden">
//             {/* Mobile menu button */}
//             <Popover.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
//               <span className="sr-only">Open main menu</span>
//               <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
//             </Popover.Button>
//           </div>
//           <Transition.Root as={Fragment}>
//             <div className="lg:hidden">
//               <Transition.Child
//                 as={Fragment}
//                 enter="duration-150 ease-out"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="duration-150 ease-in"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//               >
//                 <Popover.Overlay
//                   className="fixed inset-0 z-20 bg-black bg-opacity-25"
//                   aria-hidden="true"
//                 />
//               </Transition.Child>

//               <Transition.Child
//                 as={Fragment}
//                 enter="duration-150 ease-out"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="duration-150 ease-in"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Popover.Panel
//                   focus
//                   className="absolute top-0 right-0 z-30 w-full max-w-none origin-top transform p-2 transition"
//                 >
//                   <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
//                     <div className="pt-3 pb-2">
//                       <div className="flex items-center justify-between px-4">
//                         <div>
//                           <img
//                             className="h-8 w-auto"
//                             src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
//                             alt="Your Company"
//                           />
//                         </div>
//                         <div className="-mr-2">
//                           <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
//                             <span className="sr-only">Close menu</span>
//                             <XMarkIcon className="h-6 w-6" aria-hidden="true" />
//                           </Popover.Button>
//                         </div>
//                       </div>
//                       <div className="mt-3 space-y-1 px-2">
//                         {navigation.map((item) => (
//                           <a
//                             key={item.name}
//                             href={item.href}
//                             className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
//                           >
//                             {item.name}
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="pt-4 pb-2">
//                       <div className="flex items-center px-5">
//                         <div className="flex-shrink-0">
//                           <img
//                             className="h-10 w-10 rounded-full"
//                             src={user.imageUrl}
//                             alt=""
//                           />
//                         </div>
//                         <div className="ml-3">
//                           <div className="text-base font-medium text-gray-800">
//                             {user.name}
//                           </div>
//                           <div className="text-sm font-medium text-gray-500">
//                             {user.email}
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                         >
//                           <span className="sr-only">View notifications</span>
//                           <BellIcon className="h-6 w-6" aria-hidden="true" />
//                         </button>
//                       </div>
//                       <div className="mt-3 space-y-1 px-2">
//                         {userNavigation.map((item) => (
//                           <a
//                             key={item.name}
//                             href={item.href}
//                             className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
//                           >
//                             {item.name}
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </Popover.Panel>
//               </Transition.Child>
//             </div>
//           </Transition.Root>
//           <div className="hidden lg:ml-4 lg:flex lg:items-center">
//             <button
//               type="button"
//               className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               <span className="sr-only">View notifications</span>
//               <BellIcon className="h-6 w-6" aria-hidden="true" />
//             </button>

//             {/* Profile dropdown */}
//             <Menu as="div" className="relative ml-4 flex-shrink-0">
//               <div>
//                 <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
//                   <span className="sr-only">Open user menu</span>
//                   <img
//                     className="h-8 w-8 rounded-full"
//                     src={user.imageUrl}
//                     alt=""
//                   />
//                 </Menu.Button>
//               </div>
//               <Transition
//                 as={Fragment}
//                 enter="transition ease-out duration-100"
//                 enterFrom="transform opacity-0 scale-95"
//                 enterTo="transform opacity-100 scale-100"
//                 leave="transition ease-in duration-75"
//                 leaveFrom="transform opacity-100 scale-100"
//                 leaveTo="transform opacity-0 scale-95"
//               >
//                 <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                   {userNavigation.map((item) => (
//                     <Menu.Item key={item.name}>
//                       {({ active }) => (
//                         <a
//                           href={item.href}
//                           className={classNames(
//                             active ? 'bg-gray-100' : '',
//                             'block px-4 py-2 text-sm text-gray-700'
//                           )}
//                         >
//                           {item.name}
//                         </a>
//                       )}
//                     </Menu.Item>
//                   ))}
//                 </Menu.Items>
//               </Transition>
//             </Menu>
//           </div>
//         </Popover>
//       </div>

//       <div className="mx-auto max-w-7xl px-4 sm:px-6">
//         <div className="border-t border-gray-200 py-3">
//           <nav className="flex" aria-label="Breadcrumb">
//             <div className="flex sm:hidden">
//               <a
//                 href="#"
//                 className="group inline-flex space-x-3 text-sm font-medium text-gray-500 hover:text-gray-700"
//               >
//                 <ArrowLongLeftIcon
//                   className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600"
//                   aria-hidden="true"
//                 />
//                 <span>Back to Applicants</span>
//               </a>
//             </div>
//             <div className="hidden sm:block">
//               <ol role="list" className="flex items-center space-x-4">
//                 <li>
//                   <div>
//                     <a href="#" className="text-gray-400 hover:text-gray-500">
//                       <HomeIcon
//                         className="h-5 w-5 flex-shrink-0"
//                         aria-hidden="true"
//                       />
//                       <span className="sr-only">Home</span>
//                     </a>
//                   </div>
//                 </li>
//                 {breadcrumbs.map((item) => (
//                   <li key={item.name}>
//                     <div className="flex items-center">
//                       <svg
//                         className="h-5 w-5 flex-shrink-0 text-gray-300"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                         aria-hidden="true"
//                       >
//                         <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
//                       </svg>
//                       <a
//                         href={item.href}
//                         className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
//                         aria-current={item.current ? 'page' : undefined}
//                       >
//                         {item.name}
//                       </a>
//                     </div>
//                   </li>
//                 ))}
//               </ol>
//             </div>
//           </nav>
//         </div>
//       </div>
//     </header> */}
