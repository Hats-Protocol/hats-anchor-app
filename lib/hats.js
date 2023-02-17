export function arrayToTreeRecursive(arr, parent) {
  return arr
    .filter((item) => item.hatParent === parent)
    .map((child) => ({
      name: child.hatName,
      attributes: { details: child.details },
      children: arrayToTreeRecursive(arr, child.hatName),
    }));
}

export function toTreeStructure(data) {
  const hatsArray = data.tree?.hats?.map((hat) => {
    if (hat.admin?.prettyId === hat.prettyId) {
      return { hatName: hat.prettyId, hatParent: 'dummy' };
    }
    return {
      hatName: hat.prettyId,
      hatParent: hat.admin?.prettyId,
    };
  });

  if (!hatsArray) return [];

  return arrayToTreeRecursive(
    [{ hatName: 'dummy', hatParent: 'null' }, ...hatsArray],
    'dummy',
  );
}

export function prettyIdToId(id) {
  return id.replaceAll('.', '').padEnd(66, '0');
}

// I think you can't setHatIds in the loop. so try passing instead
// export async function getAllHatsUnderHat(hatId, n, level, ids) {
//   const currentNumHats = ids.length;
//   const internalHatIds = ids;
//   const hatsUnderHats = [];
//   var currentHatId = '';
//   var hat = [];

//   console.log('internalHatIds at start of getAllHatsUnderHat');
//   console.log(internalHatIds);

//   // buildNextId for each of the hats at this level
//   for (let i = 1; i <= n; i++) {
//     currentHatId = buildNextId(hatId, i, level);
//     internalHatIds[currentNumHats - 1 + i] = currentHatId;

//     // repeat check on each of the hats to see if they have hats under them
//     await timeout(500);
//     hat = await contract.viewHat(currentHatId);
//     hatsUnderHats[i - 1] = hat['lastHatId'];
//   }
//   console.log('internalHatIds after update in getAllHatsUnderHat');
//   console.log(internalHatIds);
//   console.log('hatsUnderHats after update in getAllHatsUnderHat');
//   console.log(hatsUnderHats);

//   // call getAllHatsUnderHat on each of the hats that have hats underneath
//   for (let i = 1; i <= n; i++) {
//     if (hatsUnderHats[i - 1] > 0) {
//       getAllHatsUnderHat(
//         hatIds[currentNumHats - 1 + i],
//         hatsUnderHats[i - 1],
//         level + 1,
//         internalHatIds,
//       );
//     }
//   }

//   return internalHatIds;
// }

// async function calculateContractVars() {
//   console.log('hatIds in calculateContractVars');
//   console.log(hatIds);
//   // for each id in the new mapping, store the contractVar -> await contract.uri(hatId)
//   // this is from single contractVar verison: const contractVar = await contract.uri(hatId)
//   const internalContractVars = await Promise.all(
//     hatIds.map((id) => contract.uri(id)),
//   );
//   console.log('internalContractVars in calculateContractVars');
//   console.log(internalContractVars);
//   setContractVars(internalContractVars);
// }

// async function getContractUris(hatId) {
//   const internalHatIds = hatIds;

//   // get hat level
//   await timeout(500);
//   const hatLevel = await contract.getHatLevel(hatId);

//   internalHatIds[hatLevel] = hatId;

//   if (hatLevel === 0) {
//     //const numHats = await JSON.parse(JSON.stringify(contract.viewHat(hatId))).lastHatId
//     await timeout(500);
//     const hat = await contract.viewHat(hatId);
//     //const hatObject = JSON.parse(hat)
//     const numHats = hat['lastHatId'];
//     console.log('hat');
//     console.log(hat);
//     console.log('numHats');
//     console.log(numHats);
//     if (numHats > 0) {
//       const calculatedHatIds = await getAllHatsUnderHat(
//         hatId,
//         numHats,
//         0,
//         internalHatIds,
//       );
//       setHatIds(calculatedHatIds);
//     }
//   } else {
//     // create a mapping of all hat ids by iterating up to admin -> while id != admin id
//     // easy way: get HatLevel, getAdmin at Level for each with decrementing hatlevel var
//     // hard way: calculate IDs from hatID ie 0x000000010101 -> ...010100 and ...010000
//     for (let i = hatLevel - 1; i >= 0; i--) {
//       await timeout(500);
//       internalHatIds[i] = await contract.getAdminAtLevel(hatId, i);
//     }
//     setHatIds(internalHatIds);
//   }
//   console.log('hatIds after if in getContractUris');
//   console.log(hatIds);

//   calculateContractVars();

//   setFormSubmitted(true);
// }
