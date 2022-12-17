import { useForm } from 'react-hook-form';
import { SquaresPlusIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Create a new hat', href: '#', icon: UserCircleIcon, current: true },
    { name: 'Add authorities', href: '#', icon: SquaresPlusIcon, current: false },
    { name: 'Mint your hat', href: '#', icon: UserGroupIcon, current: false },
]

// const [state, setstate] = useState({
//     admin_id: "", 

// })

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function CreateHat() {    
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);

    // DONE connect tailwindui - can use react hook form
    // connect ether.js
    // connect repo up to github, can use vercel to deploy via github oauth, will auto update on pushed changes to main
    // DONE - 1 focus on gather inputs (populate form, verify that the values are being stored correctly)
    // (double check image input)
    // TODO add form validation
    // TODO 2 submitting the form
    // TODO 3 calling the smart contract (have read functionalty done in the mvp on vercel, repgrind...)
    
    async function handleFormSubmission() {
        // this function gets called when the form onSubmit button gets hit
        // here you will then call the smart contract and resolve it's value
        // might want to use await to wait for response of the smart contract 
    }

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5 p-10 bg-gray-100">
          <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-50 text-indigo-700 hover:text-indigo-700 hover:bg-white'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50',
                    'group rounded-md px-3 py-2 flex items-center text-sm font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <item.icon
                    className={classNames(
                      item.current
                        ? 'text-indigo-500 group-hover:text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </a>
              ))}
            </nav>
          </aside>
    
        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <form action="#" method="POST" onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Select Difficulty Level</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      How much would you like to customize this new hat?
                    </p>
                  </div>
    
                  <fieldset className="mt-6">
                    <legend className="text-base font-medium text-gray-900">Level</legend>
                    <p className="text-sm text-gray-500">This can be changed later.</p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="difficulty-1"
                          name="difficulty"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          {...register('difficulty')}
                          value="1"
                        />
                        <label htmlFor="difficulty-1" className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Normal</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="difficulty-2"
                          name="difficulty"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          {...register('difficulty')}
                          value="2"
                        />
                        <label htmlFor="difficulty-2" className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Hard</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="difficulty-3"
                          name="difficulty"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          {...register('difficulty')}
                          value="3"
                        />
                        <label htmlFor="difficulty-3" className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Nightmare!</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>

            <form action="#" method="POST" onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Hat Details</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>
    
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="hat-name" className="block text-sm font-medium text-gray-700">
                        Hat Name
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                          hatsprotocol.xyz/
                        </span>
                        <input                          
                          type="text"
                          name="hat-name"
                          id="hat-name"
                          autoComplete="hat-name"
                          className="block w-full min-w-0 flex-grow rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue="Workstream Leader"
                          {...register('hatName')}
                        />
                      </div>
                    </div>
    
                    <div className="col-span-3">
                      <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                        Details
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="details"
                          name="details"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="This Hat is for the coordinator of the DAO's marketing workstream"
                          defaultValue={''}
                          {...register('details')}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description for your profile. URLs are hyperlinked.
                      </p>
                    </div>
    
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Image</label>
                      <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="hat-image"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input 
                                id="hat-image" 
                                name="hat-image" 
                                type="file" 
                                className="sr-only" 
                                {...register('hatImage')}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>                  
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        What image do you want to represent this role? This will be the image that appears alongside the hat token in the Hats dapp, other apps integrating with Hats Protocol, and anywhere the hat NFTs are viewable.
                      </p>      
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
    
            <form action="#" method="POST" onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Hat Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Some note.</p>
                  </div>
    
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="admin-id" className="block text-sm font-medium text-gray-700">
                        Admin ID
                      </label>
                      <input
                        type="text"
                        name="admin-id"
                        id="admin-id"
                        autoComplete="admin-id"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        {...register('adminId')}
                      />
                    </div>

                    <fieldset className="col-span-6 sm:col-span-4">
                        <legend className="block text-sm font-medium text-gray-700">Mutability</legend>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="mutable"
                                    name="mutability"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    {...register('mutable')}
                                    value="True"
                                />
                                <label htmlFor="mutable" className="ml-3">
                                    <span className="block text-sm font-medium text-gray-700">True</span>
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="immutable"
                                    name="mutability"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    {...register('mutable')}
                                    value="False"
                                />
                                <label htmlFor="immutable" className="ml-3">
                                    <span className="block text-sm font-medium text-gray-700">False</span>
                                </label>
                            </div>
                        </div>
                    </fieldset>

                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="max-supply" className="block text-sm font-medium text-gray-700">
                        Maximum Number of Wearers
                      </label>
                      <input
                        type="text"
                        name="max-supply"
                        id="max-supply"
                        autoComplete="max-supply"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        {...register('maxSupply')}
                      />
                    </div>
                    
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>

            <form action="#" method="POST" onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Hat Modules</h3>
                    <p className="mt-1 text-sm text-gray-500">View docs for more information about eligibility and toggle: https://github.com/Hats-Protocol/hats-protocol#eligibility</p>
                  </div>
    
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700">
                        Eligibility Address
                      </label>
                      <input
                        type="text"
                        name="eligibility"
                        id="eligibility"
                        autoComplete="eligibility"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        {...register('eligibility')}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="toggle" className="block text-sm font-medium text-gray-700">
                        Toggle Address
                      </label>
                      <input
                        type="text"
                        name="toggle"
                        id="toggle"
                        autoComplete="toggle"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        {...register('toggle')}
                      />
                    </div>
                    
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
    
          </div>
        </div>
      )
}