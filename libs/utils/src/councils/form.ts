import {
  AGREEMENT_ELIGIBILITY_ADDRESS,
  ALLOWLIST_ELIGIBILITY_ADDRESS,
  ELIGIBILITY_CHAIN_ADDRESS,
  ERC20_ELIGIBILITY_ADDRESS,
  getTokenDecimals,
  HATS_MODULES_FACTORY_ADDRESS,
  HSG_V2_ABI,
  HSG_V2_ADDRESS,
  MULTI_CLAIMS_HATTER_V1_ADDRESS,
  MULTICALL3_ADDRESS,
  ZODIAC_MODULE_PROXY_FACTORY_ABI,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { HatsDetailsClient } from '@hatsprotocol/details-sdk';
import { HATS_MODULES_FACTORY_ABI } from '@hatsprotocol/modules-sdk';
import {
  FALLBACK_ADDRESS,
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdIpToDecimal,
  HatsClient,
  treeIdToTopHatId,
} from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { compact, every, filter, find, includes, map, omit, reject, toNumber, toString } from 'lodash';
import { CouncilFormData, CouncilHatIds, ToastProps } from 'types';
import { Address, decodeEventLog, encodeFunctionData, encodePacked, parseUnits, PublicClient, zeroAddress } from 'viem';
import { encodeAbiParameters } from 'viem';

import { logger } from '../logs';
import { viemPublicClient } from '../web3';

export const compileHatIds = ({
  treeData,
  treesCount,
}: {
  treeData: Tree | null | undefined;
  formData?: CouncilFormData;
  treesCount: number;
}) => {
  const topHat = treeIdToTopHatId(treeData?.id ? toNumber(treeData?.id) : treesCount + 1);
  const admin = hatIdIpToDecimal(hatIdDecimalToIp(topHat) + '.1');
  const automations = hatIdIpToDecimal(hatIdDecimalToIp(admin) + '.1');

  // org roles group -- always create on first council
  const orgRolesGroup = hatIdIpToDecimal(hatIdDecimalToIp(automations) + '.1');
  const organizationManager = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroup) + '.1');
  // org roles -- create dynamically on each council
  const complianceManager = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroup) + '.2');
  const agreementManager = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroup) + '.3'); // TODO handle these dynamic hat IDs

  // council roles group - create dynamically
  const existingHats = treeData?.hats; // TODO handle more configurations of hats/ check Hat names(?)
  // find all the siblings on the 3rd level of the tree
  const siblings = filter(existingHats, (hat) => {
    const adminId = hat.admin?.id ? hatIdHexToDecimal(hat.admin.id) : undefined;
    return adminId === automations;
  });
  const newGroupId = siblings.length + 1 >= 2 ? siblings.length + 1 : 2;
  const councilRolesGroup = hatIdIpToDecimal(hatIdDecimalToIp(automations) + `.${newGroupId}`);
  const councilMember = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroup) + '.1');
  const council = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroup) + '.2');

  return {
    topHat,
    admin,
    automations,
    // org roles group
    orgRolesGroup,
    organizationManager,
    complianceManager,
    agreementManager,
    // council group
    councilRolesGroup,
    councilMember,
    council,
  };
};

const processModule = async ({
  hatId,
  implementation,
  args,
  immutableArgs,
  offset,
  requirementsKey,
  formData,
  publicClient,
}: {
  hatId: bigint;
  implementation: string;
  args: [any[], any[]];
  immutableArgs?: [any[], any[]];
  offset: number;
  requirementsKey?: string;
  formData: CouncilFormData;
  publicClient: PublicClient;
}) => {
  if (requirementsKey && !formData.requirements[requirementsKey as keyof typeof formData.requirements]) {
    return undefined;
  }
  const saltNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) + (offset ? BigInt(offset) : BigInt(0));

  let localImmutableArgs = '0x' as `0x${string}`;
  if (immutableArgs) {
    localImmutableArgs = encodePacked(immutableArgs[0], immutableArgs[1]);
  }

  if (!every(args, (arg) => arg)) {
    throw new Error('Module args not found');
  }
  const initArgs = encodeAbiParameters(args[0], args[1]);

  return publicClient
    .readContract({
      address: HATS_MODULES_FACTORY_ADDRESS,
      abi: HATS_MODULES_FACTORY_ABI,
      functionName: 'getHatsModuleAddress',
      args: [implementation, hatId, localImmutableArgs, saltNonce],
    })
    .then((address) => {
      return Promise.resolve({
        address,
        implementation,
        hatId,
        immutableArgs: localImmutableArgs,
        initArgs,
        saltNonce,
      });
    })
    .catch((err) => {
      logger.error('Error getting hats module address', { implementation, hatId }, err);
      return Promise.reject(err);
    });
};

type Module = {
  address: `0x${string}`;
  hatId: bigint;
  args: [any[], any[]];
  immutableArgs?: [any[], any[]];
  requirementsKey?: string;
};

const modules = ({
  hatIds,
  formData,
  agreementCid,
  tokenDecimals,
}: {
  hatIds: CouncilHatIds;
  formData: CouncilFormData;
  agreementCid: string;
  tokenDecimals: number;
}): Record<string, Module> => {
  const claimableHats = [hatIds.councilMember, hatIds.complianceManager, hatIds.agreementManager];

  const complianceAllowlist: Module = {
    address: ALLOWLIST_ELIGIBILITY_ADDRESS,
    hatId: hatIds.councilMember,
    requirementsKey: 'passCompliance',
    args: [
      [{ type: 'uint256' }, { type: 'uint256' }],
      [hatIds.complianceManager, hatIds.complianceManager],
    ],
  };

  const agreementModule: Module = {
    address: AGREEMENT_ELIGIBILITY_ADDRESS,
    hatId: hatIds.councilMember,
    requirementsKey: 'signAgreement',
    args: [
      [{ type: 'uint256' }, { type: 'uint256' }, { type: 'string' }],
      [hatIds.agreementManager, hatIds.agreementManager, agreementCid],
    ],
  };

  console.log(
    'erc20Module',
    // ERC20_ELIGIBILITY_ADDRESS,
    // hatIds.councilMember,
    formData.tokenRequirement?.address?.value,
    tokenDecimals,
  );
  const erc20Module: Module = {
    address: ERC20_ELIGIBILITY_ADDRESS,
    hatId: hatIds.councilMember,
    requirementsKey: 'holdTokens',
    args: [[], []],
    immutableArgs: [
      ['address', 'uint256'],
      [
        formData.tokenRequirement?.address?.value as `0x${string}`,
        parseUnits(toString(formData.tokenRequirement?.minimum), tokenDecimals),
      ],
    ],
  };

  const requiredModules: Record<string, Module> = {
    multiClaimsHatter: {
      address: MULTI_CLAIMS_HATTER_V1_ADDRESS,
      hatId: hatIds.topHat,
      args: [
        [{ type: 'uint256[]' }, { type: 'uint8[]' }],
        [claimableHats, map(Array(claimableHats.length).fill(2), (value) => BigInt(value))],
      ],
    },
    selectionAllowlist: {
      address: ALLOWLIST_ELIGIBILITY_ADDRESS,
      hatId: hatIds.councilMember,
      args: [
        [{ type: 'uint256' }, { type: 'uint256' }, { type: 'address[]' }],
        [hatIds.admin, hatIds.admin, map(formData.members, 'address')],
      ],
    },
    // eligibility chain is handled separately
  };

  return {
    ...requiredModules,
    ...(formData.requirements?.signAgreement ? { agreementModule } : {}),
    ...(formData.requirements?.passCompliance ? { complianceAllowlist } : {}),
    ...(formData.requirements?.holdTokens && formData.tokenRequirement?.address?.value ? { erc20Module } : {}),
  };
};

export const compileModuleData = async ({
  formData,
  hatIds,
  agreementCid,
}: {
  formData: CouncilFormData;
  hatIds: CouncilHatIds;
  agreementCid: string;
}) => {
  // Create public and wallet clients
  const chainId = toNumber(formData.chain.value);
  const publicClient = viemPublicClient(chainId);

  // prep values for module creation
  const saltNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  const tokenDecimals = formData.tokenRequirement?.address?.value
    ? getTokenDecimals(chainId, formData.tokenRequirement.address?.value as `0x${string}`)
    : undefined;

  // create modules data
  const modulesPromises = map(
    Object.values(modules({ hatIds, formData, agreementCid, tokenDecimals: tokenDecimals as number })),
    (module, index) => {
      if (!module) return Promise.resolve(undefined);

      return processModule({
        hatId: module.hatId,
        implementation: module.address,
        args: module.args as [any[], any[]],
        requirementsKey: module.requirementsKey,
        offset: toNumber(index),
        formData,
        publicClient,
      });
    },
  );

  const rawLocalModules = await Promise.all(Object.values(modulesPromises)).catch((err) => {
    logger.error('Error compiling module data', err);
    return Promise.reject(err);
  });
  const localModules = compact(rawLocalModules);
  // logger.debug('LOCAL MODULES', localModules);

  // retrieve values from module creation data
  const implementations: `0x${string}`[] = compact(
    map(localModules, (module) => module?.implementation as `0x${string}`),
  );
  const moduleHatIds: bigint[] = compact(map(localModules, (module) => module?.hatId as bigint));
  const immutableArgs: `0x${string}`[] = compact(map(localModules, (module) => module?.immutableArgs as `0x${string}`));
  const initArgs: `0x${string}`[] = compact(map(localModules, (module) => module?.initArgs as `0x${string}`));
  const saltNonces: bigint[] = compact(map(localModules, (module) => module?.saltNonce as bigint));

  // retrieve module addresses
  const multiClaimsHatter = find(localModules, { implementation: MULTI_CLAIMS_HATTER_V1_ADDRESS })?.address;
  const councilMemberAllowlist = find(localModules, { implementation: ALLOWLIST_ELIGIBILITY_ADDRESS })?.address;
  const complianceAllowlist = find(
    localModules,
    // TODO better matching option, very primative
    (module, index) => module.implementation === ALLOWLIST_ELIGIBILITY_ADDRESS && index > 1,
  )?.address;
  const agreementModule = find(localModules, { implementation: AGREEMENT_ELIGIBILITY_ADDRESS })?.address;
  const erc20Module = find(localModules, { implementation: ERC20_ELIGIBILITY_ADDRESS })?.address;

  if (!multiClaimsHatter || !councilMemberAllowlist) {
    throw new Error('Required modules not found');
  }

  // handle eligibility chain
  let eligibilityChainInitArgs: `0x${string}`;
  let eligibilityChainImmutableArgs: `0x${string}`;
  let eligibilityChainHatId: bigint;
  let predictedEligibilityChainAddress: `0x${string}` | undefined;
  if (
    formData.requirements?.passCompliance ||
    formData.requirements?.signAgreement ||
    formData.requirements?.holdTokens
  ) {
    let chainLength = 1;
    const chainModules: `0x${string}`[] = [councilMemberAllowlist as `0x${string}`];
    if (formData.requirements?.passCompliance) {
      chainLength += 1;
      chainModules.push(complianceAllowlist as `0x${string}`); // use existing address when applicable
    }
    if (formData.requirements?.signAgreement) {
      chainLength += 1;
      chainModules.push(agreementModule as `0x${string}`); // use existing address when applicable
    }
    if (formData.requirements?.holdTokens && formData.tokenRequirement?.address?.value) {
      chainLength += 1;
      chainModules.push(erc20Module as `0x${string}`);
    }
    // logger.debug('chainModules', chainModules);
    eligibilityChainInitArgs = '0x' as `0x${string}`;
    eligibilityChainImmutableArgs = encodePacked(
      ['uint256', 'uint256[]', ...Array(chainLength).fill('address')],
      [BigInt(1), [BigInt(chainLength)], ...chainModules],
    );
    // logger.info('eligibility chain args', {
    //   chainLength,
    //   clauseLengths: BigInt(chainLength),
    //   chainModules,
    // });
    eligibilityChainHatId = hatIds.councilMember;
    predictedEligibilityChainAddress = (await publicClient.readContract({
      address: HATS_MODULES_FACTORY_ADDRESS,
      abi: HATS_MODULES_FACTORY_ABI,
      functionName: 'getHatsModuleAddress',
      args: [ELIGIBILITY_CHAIN_ADDRESS, eligibilityChainHatId, eligibilityChainImmutableArgs, saltNonce],
    })) as `0x${string}`;
    implementations.push(ELIGIBILITY_CHAIN_ADDRESS);
    moduleHatIds.push(eligibilityChainHatId);
    immutableArgs.push(eligibilityChainImmutableArgs);
    initArgs.push(eligibilityChainInitArgs);
    saltNonces.push(saltNonce);
    // logger.debug('predicted eligibility chain address', predictedEligibilityChainAddress);
  }

  // batch modules creation call data
  const createModulesCalldata = encodeFunctionData({
    abi: HATS_MODULES_FACTORY_ABI,
    functionName: 'batchCreateHatsModule',
    args: [implementations, moduleHatIds, immutableArgs, initArgs, saltNonces],
  });

  const addresses = {
    multiClaimsHatter,
    councilMemberAllowlist,
    complianceAllowlist,
    agreementModule,
    erc20Module,
    eligibilityChain: predictedEligibilityChainAddress,
  };

  return {
    callData: createModulesCalldata,
    addresses,
    moduleArgs: {
      implementations,
      moduleHatIds,
      immutableArgs,
      initArgs,
      saltNonces,
    },
  };
};

type Hat = {
  id: bigint;
  name: string;
  description?: string;
  admin: bigint;
  ipfsCid?: string;
  maxSupply?: number; // default 10
  eligibility?: string; // default FALLBACK_ADDRESS
};

const hatsData = ({
  formData,
  hatIds,
  moduleAddresses,
}: {
  formData: CouncilFormData;
  hatIds: CouncilHatIds;
  moduleAddresses: Record<string, string | undefined>;
}): Hat[] => {
  return [
    // {
    //   handle top hat separately
    //   name: typeof formData.organizationName === 'object' ? formData.organizationName.value : formData.organizationName,
    //   description: formData.councilDescription,
    // },
    {
      // admin hat
      id: hatIds.admin,
      admin: hatIds.topHat,
      name: 'Admin',
      ipfsCid: 'QmWzgM9RjBLjKNK5g4dLQczKG887iY3FHvgY2RmzHrm4yZ',
    },
    {
      // automations hat
      id: hatIds.automations,
      admin: hatIds.admin,
      name: 'Automations',
      ipfsCid: 'QmfEDHAFEJE2aqdaUbvuPzmz7rSohrq2hQyQk7J2uQW7Ys',
    },
    {
      // org roles group
      id: hatIds.orgRolesGroup,
      admin: hatIds.automations,
      name: 'Org Roles',
      ipfsCid: 'QmWKmbhbyKYJTqqfkeQsfH3riRE5f964fmbJpYh7qA6tde',
      maxSupply: 0,
    },
    {
      // council roles group
      id: hatIds.councilRolesGroup,
      admin: hatIds.automations,
      name: 'Council Roles', // TODO should be the actual council name
      ipfsCid: 'QmaUnbGN3DXQKoKieABVsUAWUetDobEdt6qdDcpyQZqD55',
      maxSupply: 0,
    },
    {
      // council admin hat
      id: hatIds.admin,
      admin: hatIds.orgRolesGroup,
      name: 'Council Admin',
      ipfsCid: 'QmcaMY5u2f8cpNSaEADdafxw7Rk5YWQJrLGPKszjkyaCKu',
    },
    {
      // compliance manager hat
      id: hatIds.complianceManager,
      admin: hatIds.orgRolesGroup,
      name: 'Compliance Manager',
      ipfsCid: 'QmRmwNLgf4NyMs4zTPpyfbH5mtwpWzcMCogZMwCF2Pvdhi',
    },
    {
      // agreement manager hat
      id: hatIds.agreementManager,
      admin: hatIds.orgRolesGroup,
      name: 'Agreement Manager',
      ipfsCid: 'QmUNEmgnGbRwpoRBcRm5gS8njM6Psj8i6r2L9S6PwcuZQ6',
      maxSupply: 10,
    },
    {
      // council member hat
      id: hatIds.councilMember,
      admin: hatIds.councilRolesGroup,
      name: 'Council Member',
      ipfsCid: 'QmRf4ziPz3ybpPB3nSKk6JZjKjGTBayhZsFdLGyYdffRrD',
      maxSupply: formData.maxMembers,
      eligibility: moduleAddresses.eligibilityChain,
    },
    {
      // council hat
      id: hatIds.council,
      admin: hatIds.councilRolesGroup,
      name: 'Council',
      ipfsCid: 'QmVvvHykS8Y4bgGbQkU8zjDQYRqCSp4qYuLMrjSBsjqGrS',
      maxSupply: 1,
    },
  ];
};

export const compileHatCreationData = async ({
  formData,
  tree,
  hatIds,
  pinningKey,
  moduleAddresses,
  hatsClient,
}: {
  formData: CouncilFormData;
  tree: Tree | null | undefined;
  hatIds: CouncilHatIds;
  pinningKey: string;
  moduleAddresses: Record<string, string | undefined>;
  hatsClient: HatsClient;
}) => {
  // Create hats details client
  const hatsDetailsClient = new HatsDetailsClient({
    provider: 'pinata',
    pinata: { pinningKey: pinningKey as string },
  });

  const hatsProtocolCalls: `0x${string}`[] = [];

  const compiledHatsData = hatsData({ formData, hatIds, moduleAddresses });
  // determine which hats already exist in the tree
  const [
    // skip top hat
    adminHat,
    automationsHat,
    orgRolesGroupHat,
    councilRolesGroupHat,
    councilAdminHat,
    complianceManagerHat,
    agreementManagerHat,
    councilMemberHat,
    councilHat,
  ] = compiledHatsData;
  const otherHats = compact([
    adminHat,
    automationsHat,
    orgRolesGroupHat,
    councilRolesGroupHat,
    councilAdminHat,
    formData.createComplianceAdminRole ? complianceManagerHat : undefined,
    formData.createAgreementAdminRole ? agreementManagerHat : undefined,
    councilMemberHat,
    councilHat,
  ]);

  // check if hats already exist in the tree
  const otherHatsToCreate = reject(otherHats, (hat) =>
    includes(
      map(tree?.hats, (hat) => hatIdHexToDecimal(hat.id)),
      hat.id,
    ),
  );
  logger.debug('otherHatsToCreate', otherHatsToCreate);

  // handle top hats for new trees
  if (!tree?.hats?.length) {
    // handle top hat specifically
    const topHatCid = await hatsDetailsClient.pin({
      type: '1.0',
      data: {
        name:
          typeof formData.organizationName === 'object' ? formData.organizationName.value : formData.organizationName,
        description: formData.councilDescription,
      },
    });
    const createTopHatCallData = hatsClient.mintTopHatCallData({
      target: MULTICALL3_ADDRESS as Address,
      details: `ipfs://${topHatCid}`,
    });
    hatsProtocolCalls.push(createTopHatCallData.callData);
  }

  // iterate through hats and create call data
  for (const hat of otherHatsToCreate) {
    let hatCid = hat.ipfsCid;
    if (!hatCid) {
      // should only happen for the top hat currently
      hatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: hat,
      });
    }
    if (!hat.admin) continue;

    const defaultHatValues = {
      maxSupply: 10,
      toggle: FALLBACK_ADDRESS,
      mutable: true,
      imageURI: '',
    };

    const callData = hatsClient.createHatCallData({
      ...defaultHatValues,
      ...omit(hat, ['ipfsCid', 'id']),
      details: `ipfs://${hatCid}`,
      eligibility: hat.eligibility || FALLBACK_ADDRESS,
    });
    hatsProtocolCalls.push(callData.callData);
  }

  return { hatsProtocolCalls };
};

export const compileHatMintCallData = ({
  hatsProtocolCalls,
  formData,
  hatsClient,
  computedHatIds,
  tree,
  moduleAddresses,
}: {
  hatsProtocolCalls: `0x${string}`[];
  formData: CouncilFormData;
  hatsClient: HatsClient;
  computedHatIds: CouncilHatIds;
  tree: Tree | null | undefined;
  moduleAddresses: Record<string, string | undefined>;
}) => {
  if (!moduleAddresses.multiClaimsHatter) {
    // TODO toast?
    throw new Error('Multi claims hatter address not found');
  }

  // mint admin hat when it doesn't exist (not updating previous roles with new councils)
  if (!tree || !find(tree?.hats, { id: hatIdDecimalToHex(computedHatIds.admin) })) {
    const mintAdminHatCallData = hatsClient.batchMintHatsCallData({
      hatIds: Array(formData.admins.length).fill(computedHatIds.admin),
      wearers: formData.admins.map((admin) => admin.address),
    });
    hatsProtocolCalls.push(mintAdminHatCallData.callData);
  }

  // mint automations hat when it doesn't exist (not updating previous roles with new councils)
  if (!tree || !find(tree?.hats, { id: hatIdDecimalToHex(computedHatIds.automations) })) {
    const mintAutomationsHatCallData = hatsClient.mintHatCallData({
      hatId: computedHatIds.automations,
      wearer: moduleAddresses.multiClaimsHatter,
    });
    hatsProtocolCalls.push(mintAutomationsHatCallData.callData);
  }

  // ! DON'T mint council member hat on deploy (it will be revoked by the eligibility module)

  // mint compliance manager hat if compliance is required and compliance admin role doesn't exist already
  if (
    formData.requirements?.passCompliance && // is a requirement
    formData.createComplianceAdminRole === 'true' && // wants to create a new role
    !find(tree?.hats, { id: hatIdDecimalToHex(computedHatIds.complianceManager) }) // doesn't exist already
  ) {
    const mintComplianceManagerHatCallData = hatsClient.batchMintHatsCallData({
      hatIds: Array(formData.complianceAdmins.length).fill(computedHatIds.complianceManager),
      wearers: formData.complianceAdmins.map((admin) => admin.address),
    });
    hatsProtocolCalls.push(mintComplianceManagerHatCallData.callData);
  }

  // mint agreement manager hat if agreement is required and agreement admin role doesn't exist already
  if (
    formData.requirements?.signAgreement && // is a requirement
    formData.createAgreementAdminRole === 'true' && // wants to create a new role
    !find(tree?.hats, { id: hatIdDecimalToHex(computedHatIds.agreementManager) }) // doesn't exist already
  ) {
    const mintAgreementManagerHatCallData = hatsClient.batchMintHatsCallData({
      hatIds: Array(formData.agreementAdmins.length).fill(computedHatIds.agreementManager),
      wearers: formData.agreementAdmins.map((admin) => admin.address),
    });
    hatsProtocolCalls.push(mintAgreementManagerHatCallData.callData);
  }

  return { hatsProtocolCalls };
};

export const compileHsgV2CallData = ({
  formData,
  computedHatIds,
}: {
  formData: CouncilFormData;
  computedHatIds: CouncilHatIds;
}) => {
  const saltNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

  if (!formData.thresholdType || !computedHatIds) return { hsgV2Calldata: undefined, hsgArgs: undefined };

  console.log('formData', formData);
  // create hsg v2 call data
  const hsgV2InitArgs = encodeAbiParameters(
    [
      {
        components: [
          {
            name: 'ownerHat',
            type: 'uint256',
          },
          {
            name: 'signerHats',
            type: 'uint256[]',
          },
          {
            name: 'safe',
            type: 'address',
          },
          {
            components: [
              {
                name: 'thresholdType',
                type: 'uint8', // assuming TargetThresholdType is an enum, represented as uint8
              },
              {
                name: 'min',
                type: 'uint120',
              },
              {
                name: 'target',
                type: 'uint120',
              },
            ],
            name: 'thresholdConfig',
            type: 'tuple',
          },
          {
            name: 'locked',
            type: 'bool',
          },
          {
            name: 'claimableFor',
            type: 'bool',
          },
          {
            name: 'implementation',
            type: 'address',
          },
          {
            name: 'hsgGuard',
            type: 'address',
          },
          {
            name: 'hsgModules',
            type: 'address[]',
          },
        ],
        name: 'SetupParams',
        type: 'tuple',
      },
    ],
    [
      {
        ownerHat: computedHatIds.admin,
        signerHats: [computedHatIds.councilMember],
        safe: zeroAddress,
        thresholdConfig: {
          thresholdType: formData.thresholdType === 'ABSOLUTE' ? 0 : 1,
          min: BigInt(formData.min || 0),
          // currently only support one threshold on absolute
          target:
            formData.thresholdType === 'ABSOLUTE' ? BigInt(formData.min || 0) : BigInt((formData.target || 1) * 100),
        },
        locked: false,
        claimableFor: true,
        implementation: HSG_V2_ADDRESS,
        hsgGuard: zeroAddress,
        hsgModules: [],
      },
    ],
  );
  const setUpCalldata = encodeFunctionData({
    abi: HSG_V2_ABI,
    functionName: 'setUp',
    args: [hsgV2InitArgs],
  });
  const hsgV2Calldata = encodeFunctionData({
    abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
    functionName: 'deployModule',
    args: [HSG_V2_ADDRESS, setUpCalldata, saltNonce],
  });

  return { hsgV2Calldata, hsgArgs: { address: HSG_V2_ADDRESS, callData: setUpCalldata, nonce: saltNonce } };
};

export const simulateSafeAddress = async ({
  chainId,
  hsgV2Calldata,
  toast,
}: {
  chainId: number;
  hsgV2Calldata: `0x${string}` | undefined;
  toast: (toast: ToastProps) => void;
}) => {
  if (!hsgV2Calldata) return { safeProxyAddress: undefined };
  // TODO catch error
  const simulationResponse = await fetch('/api/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chainId: chainId.toString(),
      from: MULTICALL3_ADDRESS as string,
      to: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
      input: hsgV2Calldata,
      value: '0',
    }),
  });

  const simulationResult = await simulationResponse.json();
  logger.info(`simulationResult ${simulationResult.transaction.status ? 'successful' : 'failed'}`);

  // Find the safe proxy address from simulation logs
  let safeProxyAddress: Address | undefined;

  if (!simulationResult?.transaction?.status) {
    logger.error('Simulation failed');
    toast({ title: 'Simulation failed', description: 'Please try again', variant: 'destructive' });
    throw new Error('Simulation failed');
  }

  for (const log of simulationResult.transaction.transaction_info.logs) {
    try {
      const event = decodeEventLog({
        abi: [
          {
            type: 'event',
            name: 'ProxyCreation',
            inputs: [
              {
                name: 'proxy',
                type: 'address',
                indexed: true,
                internalType: 'contract SafeProxy',
              },
              {
                name: 'singleton',
                type: 'address',
                indexed: false,
                internalType: 'address',
              },
            ],
            anonymous: false,
          },
        ],
        eventName: 'ProxyCreation',
        data: log.raw.data,
        topics: log.raw.topics,
      });

      safeProxyAddress = event.args.proxy;
      // logger.debug('Found Safe proxy address:', safeProxyAddress);
      break;
    } catch {
      // Continue if this log entry isn't the event we're looking for
      continue;
    }
  }

  if (!safeProxyAddress) {
    logger.error('Failed to find Safe proxy address in simulation logs');
    throw new Error('Failed to find Safe proxy address in simulation logs');
  }

  logger.info('safeProxyAddress', safeProxyAddress);

  return { safeProxyAddress };
};
