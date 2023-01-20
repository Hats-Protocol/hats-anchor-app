import { PaperClipIcon } from '@heroicons/react/20/solid'
import { ethers, BigNumber } from 'ethers'
import { FC, useState } from 'react'
import abi from '../lib/hats.abi.json'

const HATS_POLYGON_ADDRESS = '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A'
// '0x95647f88dcbc12986046fc4f49064edd11a25d38' (polygon, current is goerli)
// const node = "https://polygon-mainnet.infura.io/v3/f7b3bd0fdb174f0fac4aded22da36341";
// const provider = new ethers.providers.WebSocketProvider(node);
const provider = ethers.getDefaultProvider("goerli")

const contract = new ethers.Contract(
  HATS_POLYGON_ADDRESS,
  abi,
  provider
)

function Home() {
  const [hatId, setHatId] = useState("")
  const [hatIds, setHatIds] = useState([]);
  // const [contractVar, setContractVar] = useState("")
  const [contractVars, setContractVars] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false)

  async function getContractUris(hatId) {
    const internalContractVars = await contract.uri(hatId)
    setContractVars(internalContractVars)
    
    setFormSubmitted(true)
  }

  return (
    <div>
      <div>
        <label htmlFor="email" className="block text-lg font-medium text-gray-700">
          Enter a Hat ID
        </label>
        <div className="mt-4">
          <input
            onChange={e => setHatId(e.target.value)}
            id="hatid"
            name="hatid"
            type="text"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="0xdec1a551edc8E90514F3b74740792bCCdA267b00"
          />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            // onClick={() => getContractUri(hatId)}
            onClick={() => getContractUris(hatId)}
            type="button"
            className="w-40 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Get Hats
                      </button>
        </div>
      </div>
      <p>Hats Protocol 4 lyfe</p>
      {
        formSubmitted &&
        URIComponent(contractVars)
      }
    </div>
  )
}

export default Home

// personal top hat BREAKS!
// 53919893334301279589334030174039261347274288845081144962207220498432
// mastermind hat id 
// 54025205625969836776031948201722931779593183940481694073461531475968

// alpha hat
// 27065258958819196981364933114703301105956039517941121592357921226752
// downstream hat
// 27065670334958527282875471856998940443582285201907529987323758379008

function URIComponent(c) {
  var legibleUri = parseUri(decodeUri(c))
  var properties = legibleUri.properties
  return <section>
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-2 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Hat Details</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-2 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{legibleUri['name & description']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Domain</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{legibleUri['domain']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Hat ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{legibleUri['id']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Pretty Hat ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{legibleUri['pretty id']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{legibleUri['status']}</dd>
          </div>
          <div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Properties</p>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current Supply</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['current supply']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Supply Cap</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['supply cap']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Admin Hat ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['admin (id)']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Admin Pretty ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['admin (pretty id)']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Oracle Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['oracle address']}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Conditions Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{properties['conditions address']}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
}

function parseUri(uri) {
  const parsed = JSON.parse(uri)
  return parsed
}

function decodeUri(uri) {
  const decoded = Buffer.from(uri.substring(29), 'base64').toString('utf8')
  console.log(decoded)
  return decoded
}