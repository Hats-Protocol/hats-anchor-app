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

  // async function getContractUri(hatId: string) {
  //   const contractVar = await contract.uri(hatId)
  //   setContractVar(contractVar)
  //   setFormSubmitted(true)
  // }

  function buildNextId (hatId, n, level) {
    const hatIdAsBigNum = BigNumber.from(hatId)

    /*
      have the hatId 26959946667150639794667015087019630673637144422540572481103610249216
      pretty version 0x0000000100000000000000000000000000000000000000000000000000000000
      what we want:  0x0000000101000000000000000000000000000000000000000000000000000000
      what's incremented: the byte at the level
      this is equal to 2 ^ (8 * (28 - 1 - level)
      -1 is because we are building Ids for level 1, given a level 0 hat, etc
      ie 2^224 = hatId above
      and 2^224 + 2^216 = desired return of
        27065258958819196981364933114703301105956039517941121592357921226752

      so, increment = input n * (2 ^ (8 * (28 - level))
    */
    const increment = BigNumber.from(2).pow(8 * (28 - 1 - level)).mul(n)

    const nextId = hatIdAsBigNum.add(increment).toString()
    console.log("nextId")
    console.log(nextId)
    return nextId
  }

  // async function getAllHatsUnderHat(hatId: string, n: number, level: number) {
  //   const currentNumHats = hatIds.length
  //   const internalHatIds: Array<string> = hatIds
  //   const hatsUnderHats = []
  //   var currentHatId = ""
  //   var hat = []

  //   console.log("internalHatIds at start of getAllHatsUnderHat")
  //   console.log(internalHatIds)

  //   // buildNextId for each of the hats at this level
  //   for (let i = 1; i <= n; i++) {
  //     currentHatId = buildNextId(hatId, i, level)
  //     internalHatIds[currentNumHats - 1 + i] = currentHatId

  //     // repeat check on each of the hats to see if they have hats under them 
  //     hat = await contract.viewHat(currentHatId)
  //     hatsUnderHats[i - 1] = hat['lastHatId']
  //   }
  //   console.log("internalHatIds after update in getAllHatsUnderHat")
  //   console.log(internalHatIds)
  //   console.log("hatsUnderHats after update in getAllHatsUnderHat")
  //   console.log(hatsUnderHats)
  //   setHatIds(internalHatIds)

  //   // call getAllHatsUnderHat on each of the hats that have hats underneath
  //   for (let i = 1; i <= n; i++) {
  //     if (hatsUnderHats[i - 1] > 0) {
  //       getAllHatsUnderHat(hatIds[currentNumHats - 1 + i], hatsUnderHats[i - 1], level + 1)
  //     }
  //   }
  // }

  // I think you can't setHatIds in the loop. so try passing instead
  async function getAllHatsUnderHat(hatId, n, level, ids) {
    const currentNumHats = ids.length
    const internalHatIds = ids
    const hatsUnderHats = []
    var currentHatId = ""
    var hat = []

    console.log("internalHatIds at start of getAllHatsUnderHat")
    console.log(internalHatIds)

    // buildNextId for each of the hats at this level
    for (let i = 1; i <= n; i++) {
      currentHatId = buildNextId(hatId, i, level)
      internalHatIds[currentNumHats - 1 + i] = currentHatId

      // repeat check on each of the hats to see if they have hats under them 
      hat = await contract.viewHat(currentHatId)
      hatsUnderHats[i - 1] = hat['lastHatId']
    }
    console.log("internalHatIds after update in getAllHatsUnderHat")
    console.log(internalHatIds)
    console.log("hatsUnderHats after update in getAllHatsUnderHat")
    console.log(hatsUnderHats)

    // call getAllHatsUnderHat on each of the hats that have hats underneath
    for (let i = 1; i <= n; i++) {
      if (hatsUnderHats[i - 1] > 0) {
        getAllHatsUnderHat(hatIds[currentNumHats - 1 + i], hatsUnderHats[i - 1], level + 1, internalHatIds)
      }
    }

    return internalHatIds
  }

  async function calculateContractVars() {
    console.log("hatIds in calculateContractVars")
    console.log(hatIds)
    // for each id in the new mapping, store the contractVar -> await contract.uri(hatId)
    // this is from single contractVar verison: const contractVar = await contract.uri(hatId)
    const internalContractVars = await Promise.all(
      hatIds.map((id) => contract.uri(id))
    )
    console.log("internalContractVars in calculateContractVars")
    console.log(internalContractVars)
    setContractVars(internalContractVars)
  }

  async function getContractUris(hatId) {
    const internalHatIds = hatIds
    
    // get hat level
    const hatLevel = await contract.getHatLevel(hatId)

    internalHatIds[hatLevel] = hatId

    if (hatLevel == 0) {
      //const numHats = await JSON.parse(JSON.stringify(contract.viewHat(hatId))).lastHatId
      const hat = await contract.viewHat(hatId)
      //const hatObject = JSON.parse(hat)
      const numHats = hat['lastHatId']
      console.log("hat")
      console.log(hat)
      console.log("numHats")
      console.log(numHats)
      if (numHats > 0) {
        const calculatedHatIds = await getAllHatsUnderHat(hatId, numHats, 0, internalHatIds)
        setHatIds(calculatedHatIds)
      }
    } else {
      // create a mapping of all hat ids by iterating up to admin -> while id != admin id
      // easy way: get HatLevel, getAdmin at Level for each with decrementing hatlevel var
      // hard way: calculate IDs from hatID ie 0x000000010101 -> ...010100 and ...010000
      for (let i = hatLevel - 1; i >= 0; i--) {
        internalHatIds[i] = await contract.getAdminAtLevel(hatId, i)
      }
      setHatIds(internalHatIds)
    }
    console.log("hatIds after if in getContractUris")
    console.log(hatIds)

    calculateContractVars()
    
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
        multiURIComponent(contractVars)
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


function multiURIComponent(cs) {
  return cs.map(c => URIComponent(c))
}

// function URIComponent(c) {
//   var legibleUri = parseUri(decodeUri(c))
//   var properties = legibleUri.properties
//   return <section>
//       <p>Name: {legibleUri['name & description']}</p>
//       <p>Domain: {legibleUri['domain']}</p>
//       <p>Hat ID: {legibleUri['id']}</p>
//       <p>Pretty Hat ID: {legibleUri['pretty id']}</p>
//       <p>Status: {legibleUri['status']}</p>
//       <p>Properties:</p>
//       <p>Current Supply: {properties['current supply']}</p>
//       <p>Supply Cap: {properties['supply cap']}</p>
//       <p>Admin Hat ID: {properties['admin (id)']}</p>
//       <p>Admin Pretty Hat ID: {properties['admin (pretty id)']}</p>
//       <p>Oracle Address: {properties['oracle address']}</p>
//       <p>Conditions Address: {properties['conditions address']}</p>
//     </section>
// }

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