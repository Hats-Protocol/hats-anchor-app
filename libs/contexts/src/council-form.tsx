'use client';

import {
  AGREEMENT_ELIGIBILITY_ADDRESS,
  ALLOWLIST_ELIGIBILITY_ADDRESS,
  ELIGIBILITY_CHAIN_ADDRESS,
  ERC20_ELIGIBILITY_ADDRESS,
  FALLBACK_ADDRESS,
  getTokenDecimals,
  HATS_ADDRESS,
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HSG_V2_ABI,
  HSG_V2_ADDRESS,
  MULTI_CLAIMS_HATTER_V1_ADDRESS,
  MULTICALL3_ABI,
  MULTICALL3_ADDRESS,
  ZODIAC_MODULE_PROXY_FACTORY_ABI,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { HatsDetailsClient } from '@hatsprotocol/details-sdk';
import { hatIdDecimalToIp, hatIdIpToDecimal, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toNumber, toString } from 'lodash';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  councilsGraphqlClient,
  createHatsClient,
  fetchToken,
  GET_COUNCIL_FORM,
  pinFileToIpfs,
  UPDATE_COUNCIL_FORM,
  viemPublicClient,
  viemWalletClient,
} from 'utils';
import { Address, decodeEventLog, encodeAbiParameters, encodeFunctionData, encodePacked, zeroAddress } from 'viem';
import { arbitrum, base, celo, gnosis, mainnet, optimism, polygon, sepolia } from 'viem/chains';
import { useAccount } from 'wagmi';

const CHAINS = {
  optimism: {
    id: 10,
    viem: optimism,
    rpc: process.env.NEXT_PUBLIC_OPTIMISM_HTTP_PROVIDER,
  },
  arbitrum: {
    id: 42161,
    viem: arbitrum,
    rpc: process.env.NEXT_PUBLIC_ARBITRUM_HTTP_PROVIDER,
  },
  polygon: {
    id: 137,
    viem: polygon,
    rpc: process.env.NEXT_PUBLIC_POLYGON_HTTP_PROVIDER,
  },
  gnosis: {
    id: 100,
    viem: gnosis,
    rpc: process.env.NEXT_PUBLIC_GNOSIS_HTTP_PROVIDER,
  },
  base: {
    id: 8453,
    viem: base,
    rpc: process.env.NEXT_PUBLIC_BASE_HTTP_PROVIDER,
  },
  celo: {
    id: 42220,
    viem: celo,
    rpc: process.env.NEXT_PUBLIC_CELO_HTTP_PROVIDER,
  },
  sepolia: {
    id: 11155111,
    viem: sepolia,
    rpc: process.env.NEXT_PUBLIC_SEPOLIA_HTTP_PROVIDER,
  },
  mainnet: {
    id: 1,
    viem: mainnet,
    rpc: process.env.NEXT_PUBLIC_MAINNET_HTTP_PROVIDER,
  },
};

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

export interface CouncilFormData {
  // step 1
  organizationName: string;
  councilName: string;
  chain: string;
  councilDescription?: string;
  // step 2
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  confirmationsRequired: number; // used if thresholdType is ABSOLUTE
  percentageRequired: number; // used if thresholdType is RELATIVE
  minConfirmations: number; // used if thresholdType is RELATIVE
  maxMembers: number;
  // step 3
  membershipType: 'APPOINTED' | 'ELECTED';
  requirements: {
    signAgreement: boolean;
    holdTokens: boolean;
    passCompliance: boolean;
  };
  // step 4
  members: CouncilMember[];
  admins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  createComplianceAdminRole: 'true' | 'false';
  agreement?: string;
  createAgreementAdminRole: 'true' | 'false';
  agreementAdmins: CouncilMember[];
  payer?: {
    id: string;
    address: string;
    email: string;
    name?: string;
    telegram?: string;
  };
  acceptedTerms?: boolean;
  tokenRequirement: {
    address: string;
    minimum: number;
  };
}

interface CouncilFormResponse {
  councilCreationForm: {
    id: string;
    creator: string | null;
    organizationName: string | null;
    councilName: string | null;
    chain: number | null;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE' | null;
    thresholdTarget: number | null;
    thresholdMin: number | null;
    maxCouncilMembers: number | null;
    membersSelectionType: 'ALLOWLIST' | 'ELECTION' | null;
    members: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    admins: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    complianceAdmins: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    createComplianceAdminRole: boolean;
    memberRequirements: {
      signAgreement: boolean;
      holdTokens: boolean;
      passCompliance: boolean;
    };
    agreement?: string;
    createAgreementAdminRole: boolean;
    agreementAdmins: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    payer: {
      id: string;
      address: string;
      email: string;
      name?: string;
      telegram?: string;
    } | null;
    tokenAddress: string | null;
    tokenAmount: number | null;
  };
}

interface UpdateCouncilFormResponse {
  updateCouncilCreationForm: CouncilFormResponse['councilCreationForm'];
}

export interface StepValidation {
  details: boolean;
  threshold: boolean;
  onboarding: boolean;
  selection: boolean;
  selectionSubSteps: {
    members: boolean;
    management: boolean;
    compliance: boolean;
    agreement: boolean;
    tokens: boolean;
  };
  payment: boolean;
}

interface CouncilDeploymentResult {
  success: boolean;
  error?: string;
  transactionHash?: string;
}

interface CouncilFormContextType {
  form: UseFormReturn<CouncilFormData>;
  isLoading: boolean;
  persistForm: (step: string, subStep?: string) => Promise<unknown>;
  stepValidation: StepValidation;
  setStepValidation: (
    step: keyof StepValidation,
    isValid: boolean | Partial<StepValidation[keyof StepValidation]>,
  ) => void;
  deployCouncil: () => Promise<CouncilDeploymentResult>;
  isDeploying: boolean;
  canEdit: boolean;
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(undefined);

const computeStepValidation = (data: CouncilFormResponse['councilCreationForm']): StepValidation => {
  return {
    details: !!(
      data.organizationName &&
      data.organizationName !== '' &&
      data.councilName &&
      data.councilName !== '' &&
      data.chain !== null
    ),
    threshold: !!(
      data.maxCouncilMembers &&
      data.maxCouncilMembers > 0 &&
      data.thresholdType &&
      data.thresholdTarget &&
      data.thresholdTarget > 0
    ),
    onboarding: !!data.membersSelectionType,
    selection: false, // Main step validity will be computed from sub-steps
    selectionSubSteps: {
      members: !!data.members,
      management: !!(data.admins && data.admins.length > 0),
      compliance: data.createComplianceAdminRole !== null,
      agreement: data.createAgreementAdminRole !== null && !!data.agreement && data.agreement !== '',
      tokens:
        data.tokenAddress !== null && data.tokenAddress !== '' && data.tokenAmount !== null && data.tokenAmount > 0,
    },
    payment: false,
  };
};

export function CouncilFormProvider({ children, draftId }: { children: React.ReactNode; draftId: string | null }) {
  const { user, authenticated } = usePrivy();
  const [canEdit, setCanEdit] = useState(false);
  const { address } = useAccount();
  const form = useForm<CouncilFormData>({
    defaultValues: {
      organizationName: '',
      councilName: '',
      chain: 'optimism',
      councilDescription: '',
      thresholdType: 'ABSOLUTE',
      confirmationsRequired: 4,
      percentageRequired: 51,
      minConfirmations: 2,
      maxMembers: 7,
      membershipType: 'APPOINTED',
      requirements: {
        signAgreement: false,
        holdTokens: false,
        passCompliance: false,
      },
      members: [],
      admins: [],
      complianceAdmins: [],
      createComplianceAdminRole: 'false',
      agreement: '',
      createAgreementAdminRole: 'false',
      agreementAdmins: [],
      payer: undefined,
      acceptedTerms: false,
      tokenRequirement: {
        address: '',
        minimum: 0,
      },
    },
  });

  const [stepValidation, setStepValidationState] = useState<StepValidation>({
    details: false,
    threshold: false,
    onboarding: false,
    selection: false,
    selectionSubSteps: {
      members: false,
      management: false,
      compliance: false,
      agreement: false,
      tokens: false,
    },
    payment: false,
  });

  const setStepValidation = useCallback(
    (step: keyof StepValidation, isValid: boolean | Partial<StepValidation[keyof StepValidation]>) => {
      console.log('Setting step validation:', step, isValid);
      setStepValidationState((prev) => {
        if (step === 'selectionSubSteps') {
          const newState = {
            ...prev,
            selectionSubSteps: {
              ...prev.selectionSubSteps,
              ...(isValid as Partial<StepValidation['selectionSubSteps']>),
            },
          };
          console.log('New validation state:', newState);
          return newState;
        }
        return {
          ...prev,
          [step]: isValid,
        };
      });
    },
    [],
  );

  const { isLoading, data } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      return councilsGraphqlClient
        .request<CouncilFormResponse>(GET_COUNCIL_FORM, { id: draftId })
        .then((result) => {
          console.log('result', result);
          return result.councilCreationForm;
        })
        .catch((error) => {
          console.error('Error fetching council form:', error);
          throw error;
        });
    },
    enabled: !!draftId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Check if user can edit the form
  useEffect(() => {
    if (!authenticated || !user?.wallet?.address || !data) {
      console.log({ authenticated, user, data });
      setCanEdit(false);
      return;
    }

    const userAddress = user.wallet.address.toLowerCase();
    const isCreator = data.creator?.toLowerCase() === userAddress;
    const isAdmin = data.admins?.some((admin) => admin.address.toLowerCase() === userAddress);

    setCanEdit(isCreator || isAdmin);
  }, [authenticated, user?.wallet?.address, data]);

  useEffect(() => {
    if (data) {
      console.log('API Response data:', data);
      const currentValues = form.getValues();
      console.log('Current form values:', currentValues);

      const newValues: CouncilFormData = {
        organizationName: data.organizationName || '',
        councilName: data.councilName || '',
        chain: toString(data.chain) || '',
        councilDescription: data.councilDescription || '',
        thresholdType: data.thresholdType || 'ABSOLUTE',
        confirmationsRequired: data.thresholdTarget || 4,
        percentageRequired: data.thresholdTarget || 51,
        minConfirmations: data.thresholdMin || 2,
        maxMembers: data.maxCouncilMembers || 7,
        membershipType: data.membersSelectionType === 'ELECTION' ? 'ELECTED' : 'APPOINTED',
        requirements: data.memberRequirements || {
          signAgreement: false,
          holdTokens: false,
          passCompliance: false,
        },
        members: data.members || [],
        admins: data.admins || [],
        complianceAdmins: data.complianceAdmins || [],
        createComplianceAdminRole: data.createComplianceAdminRole ? 'true' : 'false',
        agreement: data.agreement || '',
        createAgreementAdminRole: data.createAgreementAdminRole ? 'true' : 'false',
        agreementAdmins: data.agreementAdmins || [],
        payer: data.payer || undefined,
        acceptedTerms: false,
        tokenRequirement: {
          address: data.tokenAddress || '',
          minimum: data.tokenAmount || 0,
        },
      };
      console.log('Setting form to:', newValues);
      form.reset(newValues);

      // Compute validation state here
      const validation = computeStepValidation(data);
      setStepValidationState(validation);
    }
  }, [data, form]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation<
    UpdateCouncilFormResponse,
    Error,
    { step: string; subStep?: string }
  >({
    mutationFn: async ({ step, subStep }) => {
      const formData = form.getValues();
      let payload: any = { id: draftId };

      switch (step) {
        case 'details':
          // Get previous form data from query cache
          const previousData = queryClient.getQueryData<CouncilFormResponse['councilCreationForm']>([
            'councilForm',
            draftId,
          ]);
          const previousChain = previousData?.chain;
          const newChain = toNumber(formData.chain);

          payload = {
            ...payload,
            organizationName: formData.organizationName,
            councilName: formData.councilName,
            chain: toNumber(formData.chain),
            councilDescription: formData.councilDescription,
          };

          // If chain has changed, reset token requirements in the payload
          if (previousChain && previousChain !== newChain) {
            payload = {
              ...payload,
              tokenAddress: '',
              tokenAmount: 0,
            };
          }
          break;

        case 'threshold':
          payload = {
            ...payload,
            thresholdType: formData.thresholdType,
            maxCouncilMembers: parseInt(formData.maxMembers.toString()),
            thresholdTarget:
              formData.thresholdType === 'ABSOLUTE'
                ? parseInt(formData.confirmationsRequired.toString())
                : parseInt(formData.percentageRequired.toString()),
            thresholdMin:
              formData.thresholdType === 'ABSOLUTE'
                ? parseInt(formData.confirmationsRequired.toString())
                : parseInt(formData.minConfirmations.toString()),
          };
          break;

        case 'onboarding':
          payload = {
            ...payload,
            membersSelectionType: formData.membershipType === 'ELECTED' ? 'ELECTION' : 'ALLOWLIST',
            memberRequirements: formData.requirements,
          };
          break;

        case 'selection':
          switch (subStep) {
            case 'members':
              payload = {
                ...payload,
                members: formData.members,
              };
              break;
            case 'management':
              payload = {
                ...payload,
                admins: formData.admins,
              };
              break;
            case 'compliance':
              payload = {
                ...payload,
                complianceAdmins: formData.complianceAdmins,
                createComplianceAdminRole: formData.createComplianceAdminRole === 'true',
              };
              break;
            case 'agreement':
              payload = {
                ...payload,
                agreement: formData.agreement,
                agreementAdmins: formData.agreementAdmins,
                createAgreementAdminRole: formData.createAgreementAdminRole === 'true',
              };
              break;
            case 'tokens':
              payload = {
                ...payload,
                tokenAddress: formData.tokenRequirement.address,
                tokenAmount: parseInt(formData.tokenRequirement.minimum.toString()),
                memberRequirements: {
                  ...formData.requirements,
                  holdTokens: true,
                },
              };
              break;
          }
          break;
      }

      return await councilsGraphqlClient.request<UpdateCouncilFormResponse>(UPDATE_COUNCIL_FORM, payload);
    },
    onSuccess: (data: UpdateCouncilFormResponse) => {
      queryClient.setQueryData(['councilForm', draftId], data.updateCouncilCreationForm);
    },
  });

  const { mutateAsync: deployCouncil, isPending: isDeploying } = useMutation({
    mutationFn: async (): Promise<CouncilDeploymentResult> => {
      console.log('Deploying council');
      const formData = form.getValues();

      const chainId = CHAINS[formData.chain as keyof typeof CHAINS].id;
      // const viemChain = CHAINS[formData.chain as keyof typeof CHAINS].viem;
      // const rpc = CHAINS[formData.chain as keyof typeof CHAINS].rpc;

      // Create public and wallet clients
      const publicClient = viemPublicClient(chainId);
      const walletClient = await viemWalletClient(chainId);

      // Create hats client
      const hatsClient = await createHatsClient(chainId);
      if (!hatsClient) {
        throw new Error('Failed to create hats client');
      }

      // Create hats details client
      const pinningKey = await fetchToken(20);
      const hatsDetailsClient = new HatsDetailsClient({
        provider: 'pinata',
        pinata: {
          pinningKey: pinningKey as string,
        },
      });

      const hatsProtocolCalls: `0x${string}`[] = [];

      // compute hat ids
      const currentTreeCount = await hatsClient.getTreesCount();
      const topHatId = treeIdToTopHatId(currentTreeCount + 1);
      const adminHatId = hatIdIpToDecimal(hatIdDecimalToIp(topHatId) + '.1');
      const automationsHatId = hatIdIpToDecimal(hatIdDecimalToIp(adminHatId) + '.1');
      const orgRolesGroupHatId = hatIdIpToDecimal(hatIdDecimalToIp(automationsHatId) + '.1');
      const councilRolesGroupHatId = hatIdIpToDecimal(hatIdDecimalToIp(automationsHatId) + '.2');
      const councilAdminHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.1');
      const complianceManagerHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.2');
      const agreementManagerHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.3');
      const councilMemberHatId = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroupHatId) + '.1');
      const councilHatId = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroupHatId) + '.2');

      console.log('computed hat ids');

      const saltNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
      const saltNonceComplianceModule = saltNonce + BigInt(1);

      // modules batch creation params
      const implementations: `0x${string}`[] = [];
      const hatIds: bigint[] = [];
      const immutableArgs: `0x${string}`[] = [];
      const initArgs: `0x${string}`[] = [];
      const saltNonces: bigint[] = [];

      // multi claims hatter
      const multiClaimsHatterInitArgs = encodeAbiParameters(
        [{ type: 'uint256[]' }, { type: 'uint8[]' }],
        [
          [councilMemberHatId, complianceManagerHatId, agreementManagerHatId],
          [2, 2, 2],
        ],
      );
      const multiClaimsHatterImmutableArgs = '0x' as `0x${string}`;
      const multiClaimsHatterHatId = topHatId;
      const predictedMultiClaimsHatterAddress = await publicClient.readContract({
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: 'getHatsModuleAddress',
        args: [MULTI_CLAIMS_HATTER_V1_ADDRESS, multiClaimsHatterHatId, multiClaimsHatterImmutableArgs, saltNonce],
      });
      implementations.push(MULTI_CLAIMS_HATTER_V1_ADDRESS);
      hatIds.push(multiClaimsHatterHatId);
      immutableArgs.push(multiClaimsHatterImmutableArgs);
      initArgs.push(multiClaimsHatterInitArgs);
      saltNonces.push(saltNonce);

      // council member allowlist
      const councilMemberAllowlistInitArgs = encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'uint256' }, { type: 'address[]' }],
        [adminHatId, adminHatId, formData.members.map((member) => member.address as `0x${string}`)],
      );
      const councilMemberAllowlistImmutableArgs = '0x' as `0x${string}`;
      const councilMemberAllowlistHatId = councilMemberHatId;
      const predictedCouncilMemberAllowlistAddress = await publicClient.readContract({
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: 'getHatsModuleAddress',
        args: [
          ALLOWLIST_ELIGIBILITY_ADDRESS,
          councilMemberAllowlistHatId,
          councilMemberAllowlistImmutableArgs,
          saltNonce,
        ],
      });
      implementations.push(ALLOWLIST_ELIGIBILITY_ADDRESS);
      hatIds.push(councilMemberAllowlistHatId);
      immutableArgs.push(councilMemberAllowlistImmutableArgs);
      initArgs.push(councilMemberAllowlistInitArgs);
      saltNonces.push(saltNonce);

      // compliance allowlist
      let complianceAllowlistInitArgs: `0x${string}`;
      let complianceAllowlistImmutableArgs: `0x${string}`;
      let complianceAllowlistHatId: bigint;
      let predictedComplianceAllowlistAddress: `0x${string}` | undefined;
      if (formData.requirements.passCompliance) {
        complianceAllowlistInitArgs = encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }],
          [
            formData.createComplianceAdminRole === 'true' ? complianceManagerHatId : adminHatId,
            formData.createComplianceAdminRole === 'true' ? complianceManagerHatId : adminHatId,
          ],
        );
        complianceAllowlistImmutableArgs = '0x' as `0x${string}`;
        complianceAllowlistHatId = councilMemberHatId;
        predictedComplianceAllowlistAddress = (await publicClient.readContract({
          address: HATS_MODULES_FACTORY_ADDRESS,
          abi: HATS_MODULES_FACTORY_ABI,
          functionName: 'getHatsModuleAddress',
          args: [
            ALLOWLIST_ELIGIBILITY_ADDRESS,
            complianceAllowlistHatId,
            complianceAllowlistImmutableArgs,
            saltNonceComplianceModule,
          ],
        })) as `0x${string}`;
        implementations.push(ALLOWLIST_ELIGIBILITY_ADDRESS);
        hatIds.push(complianceAllowlistHatId);
        immutableArgs.push(complianceAllowlistImmutableArgs);
        initArgs.push(complianceAllowlistInitArgs);
        saltNonces.push(saltNonceComplianceModule);
      }

      // agreement module
      let agreementModuleInitArgs: `0x${string}`;
      let agreementModuleImmutableArgs: `0x${string}`;
      let agreementModuleHatId: bigint;
      let predictedAgreementModuleAddress: `0x${string}` | undefined;
      if (formData.requirements.signAgreement && formData.agreement) {
        // pin agreement file to ipfs
        const agreementCid = await pinFileToIpfs({
          file: formData.agreement,
          fileName: `agreement_${formData.organizationName}_${formData.councilName}_${chainId}`,
          token: pinningKey as string,
        });

        agreementModuleInitArgs = encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }, { type: 'string' }],
          [
            formData.createAgreementAdminRole === 'true' ? agreementManagerHatId : adminHatId,
            formData.createAgreementAdminRole === 'true' ? agreementManagerHatId : adminHatId,
            agreementCid,
          ],
        );
        agreementModuleImmutableArgs = '0x' as `0x${string}`;
        agreementModuleHatId = councilMemberHatId;
        predictedAgreementModuleAddress = (await publicClient.readContract({
          address: HATS_MODULES_FACTORY_ADDRESS,
          abi: HATS_MODULES_FACTORY_ABI,
          functionName: 'getHatsModuleAddress',
          args: [AGREEMENT_ELIGIBILITY_ADDRESS, agreementModuleHatId, agreementModuleImmutableArgs, saltNonce],
        })) as `0x${string}`;
        implementations.push(AGREEMENT_ELIGIBILITY_ADDRESS);
        hatIds.push(agreementModuleHatId);
        immutableArgs.push(agreementModuleImmutableArgs);
        initArgs.push(agreementModuleInitArgs);
        saltNonces.push(saltNonce);
      }

      // erc20 module
      let erc20ModuleInitArgs: `0x${string}`;
      let erc20ModuleImmutableArgs: `0x${string}`;
      let erc20ModuleHatId: bigint;
      let predictedErc20ModuleAddress: `0x${string}` | undefined;
      if (formData.requirements.holdTokens) {
        const tokenDecimals = getTokenDecimals(chainId, formData.tokenRequirement.address) as number;
        erc20ModuleInitArgs = '0x' as `0x${string}`;
        erc20ModuleImmutableArgs = encodePacked(
          ['address', 'uint256'],
          [
            formData.tokenRequirement.address as `0x${string}`,
            BigInt(formData.tokenRequirement.minimum) * 10n ** BigInt(tokenDecimals),
          ],
        );
        erc20ModuleHatId = councilMemberHatId;
        predictedErc20ModuleAddress = (await publicClient.readContract({
          address: HATS_MODULES_FACTORY_ADDRESS,
          abi: HATS_MODULES_FACTORY_ABI,
          functionName: 'getHatsModuleAddress',
          args: [ERC20_ELIGIBILITY_ADDRESS, erc20ModuleHatId, erc20ModuleImmutableArgs, saltNonce],
        })) as `0x${string}`;
        implementations.push(ERC20_ELIGIBILITY_ADDRESS);
        hatIds.push(erc20ModuleHatId);
        immutableArgs.push(erc20ModuleImmutableArgs);
        initArgs.push(erc20ModuleInitArgs);
        saltNonces.push(saltNonce);
      }

      // eligibility chain
      let eligibilityChainInitArgs: `0x${string}`;
      let eligibilityChainImmutableArgs: `0x${string}`;
      let eligibilityChainHatId: bigint;
      let predictedEligibilityChainAddress: `0x${string}` | undefined;
      if (
        formData.requirements.passCompliance ||
        formData.requirements.signAgreement ||
        formData.requirements.holdTokens
      ) {
        let chainLength = 1;
        const chainModules: `0x${string}`[] = [predictedCouncilMemberAllowlistAddress as `0x${string}`];
        if (formData.requirements.passCompliance) {
          chainLength += 1;
          chainModules.push(predictedComplianceAllowlistAddress as `0x${string}`);
        }
        if (formData.requirements.signAgreement) {
          chainLength += 1;
          chainModules.push(predictedAgreementModuleAddress as `0x${string}`);
        }
        if (formData.requirements.holdTokens) {
          chainLength += 1;
          chainModules.push(predictedErc20ModuleAddress as `0x${string}`);
        }
        eligibilityChainInitArgs = '0x' as `0x${string}`;
        eligibilityChainImmutableArgs = encodePacked(
          ['uint256', 'uint256[]', ...Array(chainLength).fill('address')],
          [BigInt(1), [BigInt(chainLength)], ...chainModules],
        );
        console.log('eligibility chain args', {
          chainLength,
          clauseLengths: BigInt(chainLength),
          chainModules,
        });
        eligibilityChainHatId = councilMemberHatId;
        predictedEligibilityChainAddress = (await publicClient.readContract({
          address: HATS_MODULES_FACTORY_ADDRESS,
          abi: HATS_MODULES_FACTORY_ABI,
          functionName: 'getHatsModuleAddress',
          args: [ELIGIBILITY_CHAIN_ADDRESS, eligibilityChainHatId, eligibilityChainImmutableArgs, saltNonce],
        })) as `0x${string}`;
        implementations.push(ELIGIBILITY_CHAIN_ADDRESS);
        hatIds.push(eligibilityChainHatId);
        immutableArgs.push(eligibilityChainImmutableArgs);
        initArgs.push(eligibilityChainInitArgs);
        saltNonces.push(saltNonce);
        console.log('predicted eligibility chain address', predictedEligibilityChainAddress);
      }

      // batch modules creation call data
      const createModulesCalldata = encodeFunctionData({
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: 'batchCreateHatsModule',
        args: [implementations, hatIds, immutableArgs, initArgs, saltNonces],
      });

      // create top hat call data
      const detailsCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: formData.organizationName,
          description: formData.councilDescription,
        },
      });
      const createTopHatCallData = hatsClient.mintTopHatCallData({
        target: MULTICALL3_ADDRESS as Address,
        details: `ipfs://${detailsCid}`,
      });
      hatsProtocolCalls.push(createTopHatCallData.callData);

      // create admin hat call data
      const adminHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Admin',
        },
      });
      const createAdminHatCallData = hatsClient.createHatCallData({
        admin: topHatId,
        details: `ipfs://${adminHatCid}`,
        maxSupply: 10,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createAdminHatCallData.callData);

      // create automations hat call data
      const automationsHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Automations',
        },
      });
      const createAutomationsHatCallData = hatsClient.createHatCallData({
        admin: adminHatId,
        details: `ipfs://${automationsHatCid}`,
        maxSupply: 10,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createAutomationsHatCallData.callData);

      // create org roles group call data
      const orgRolesGroupHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Org Roles',
        },
      });
      const createOrgRolesGroupHatCallData = hatsClient.createHatCallData({
        admin: automationsHatId,
        details: `ipfs://${orgRolesGroupHatCid}`,
        maxSupply: 0,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createOrgRolesGroupHatCallData.callData);

      // create council roles group hat call data
      const councilRolesGroupHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Council Roles',
        },
      });
      const createCouncilRolesGroupHatCallData = hatsClient.createHatCallData({
        admin: automationsHatId,
        details: `ipfs://${councilRolesGroupHatCid}`,
        maxSupply: 0,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createCouncilRolesGroupHatCallData.callData);

      // create council admin hat call data
      const councilAdminHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Council Admin',
        },
      });
      const createCouncilAdminHatCallData = hatsClient.createHatCallData({
        admin: orgRolesGroupHatId,
        details: `ipfs://${councilAdminHatCid}`,
        maxSupply: 10,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createCouncilAdminHatCallData.callData);

      // create compliance manager hat call data
      const complianceManagerHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Compliance Manager',
        },
      });
      const createComplianceManagerHatCallData = hatsClient.createHatCallData({
        admin: orgRolesGroupHatId,
        details: `ipfs://${complianceManagerHatCid}`,
        maxSupply: 10,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createComplianceManagerHatCallData.callData);

      // create agreement manager hat call data
      const agreementManagerHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Agreement Manager',
        },
      });
      const createAgreementManagerHatCallData = hatsClient.createHatCallData({
        admin: orgRolesGroupHatId,
        details: `ipfs://${agreementManagerHatCid}`,
        maxSupply: 10,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createAgreementManagerHatCallData.callData);

      // create council member hat call data
      const councilMemberHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Council Member',
        },
      });
      const councilMemberEligibility =
        formData.requirements.signAgreement || formData.requirements.passCompliance
          ? (predictedEligibilityChainAddress as `0x${string}`)
          : predictedCouncilMemberAllowlistAddress;
      const createCouncilMemberHatCallData = hatsClient.createHatCallData({
        admin: councilRolesGroupHatId,
        details: `ipfs://${councilMemberHatCid}`,
        maxSupply: formData.maxMembers,
        eligibility: councilMemberEligibility,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createCouncilMemberHatCallData.callData);

      // create council hat call data
      const councilHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: {
          name: 'Council',
        },
      });
      const createCouncilHatCallData = hatsClient.createHatCallData({
        admin: councilRolesGroupHatId,
        details: `ipfs://${councilHatCid}`,
        maxSupply: 1,
        eligibility: FALLBACK_ADDRESS,
        toggle: FALLBACK_ADDRESS,
        mutable: true,
      });
      hatsProtocolCalls.push(createCouncilHatCallData.callData);

      // mint admin hat
      const mintAdminHatCallData = hatsClient.batchMintHatsCallData({
        hatIds: Array(formData.admins.length).fill(adminHatId),
        wearers: formData.admins.map((admin) => admin.address),
      });
      hatsProtocolCalls.push(mintAdminHatCallData.callData);

      // mint automations hat
      const mintAutomationsHatCallData = hatsClient.mintHatCallData({
        hatId: automationsHatId,
        wearer: predictedMultiClaimsHatterAddress,
      });
      hatsProtocolCalls.push(mintAutomationsHatCallData.callData);

      // mint council member hat
      const mintCouncilMemberHatCallData = hatsClient.batchMintHatsCallData({
        hatIds: Array(formData.members.length).fill(councilMemberHatId),
        wearers: formData.members.map((member) => member.address),
      });
      hatsProtocolCalls.push(mintCouncilMemberHatCallData.callData);

      // mint compliance manager hat if compliance is required
      if (formData.requirements.passCompliance && formData.createComplianceAdminRole === 'true') {
        const mintComplianceManagerHatCallData = hatsClient.batchMintHatsCallData({
          hatIds: Array(formData.complianceAdmins.length).fill(complianceManagerHatId),
          wearers: formData.complianceAdmins.map((admin) => admin.address),
        });
        hatsProtocolCalls.push(mintComplianceManagerHatCallData.callData);
      }

      // mint agreement manager hat if agreement is required
      if (formData.requirements.signAgreement && formData.createAgreementAdminRole === 'true') {
        const mintAgreementManagerHatCallData = hatsClient.batchMintHatsCallData({
          hatIds: Array(formData.agreementAdmins.length).fill(agreementManagerHatId),
          wearers: formData.agreementAdmins.map((admin) => admin.address),
        });
        hatsProtocolCalls.push(mintAgreementManagerHatCallData.callData);
      }

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
            ownerHat: adminHatId,
            signerHats: [councilMemberHatId],
            safe: zeroAddress,
            thresholdConfig: {
              thresholdType: formData.thresholdType === 'ABSOLUTE' ? 0 : 1,
              min:
                formData.thresholdType === 'ABSOLUTE'
                  ? BigInt(formData.confirmationsRequired)
                  : BigInt(formData.minConfirmations),
              target:
                formData.thresholdType === 'ABSOLUTE'
                  ? BigInt(formData.confirmationsRequired)
                  : BigInt(formData.percentageRequired * 10000),
            },
            locked: false,
            claimableFor: true,
            implementation: HSG_V2_ADDRESS,
            hsgGuard: zeroAddress,
            hsgModules: [],
          },
        ],
      );
      const hsgV2setUpCalldata = encodeFunctionData({
        abi: HSG_V2_ABI,
        functionName: 'setUp',
        args: [hsgV2InitArgs],
      });
      const createHsgV2Calldata = encodeFunctionData({
        abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
        functionName: 'deployModule',
        args: [HSG_V2_ADDRESS, hsgV2setUpCalldata, saltNonce],
      });

      // predict new safe address

      const simulationResponse = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chainId: chainId.toString(),
          from: MULTICALL3_ADDRESS as string,
          to: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
          input: createHsgV2Calldata,
          value: '0',
        }),
      });

      const simulationResult = await simulationResponse.json();
      console.log('simulationResult', simulationResult);

      // Find the safe proxy address from simulation logs
      let safeProxyAddress: Address | undefined;

      console.log(simulationResult.transaction.status);
      if (simulationResult.transaction.status === false) {
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
          console.log('Found Safe proxy address:', safeProxyAddress);
          break;
        } catch (err) {
          // Continue if this log entry isn't the event we're looking for
          continue;
        }
      }

      if (!safeProxyAddress) {
        throw new Error('Failed to find Safe proxy address in simulation logs');
      }

      console.log('safeProxyAddress', safeProxyAddress);

      // mint council member hat
      const mintCouncilHatCallData = hatsClient.mintHatCallData({
        hatId: councilHatId,
        wearer: safeProxyAddress as `0x${string}`,
      });
      hatsProtocolCalls.push(mintCouncilHatCallData.callData);

      // create hats protocol multicall call data
      const hatsProtocolMulticallCallData = hatsClient.multicallCallData(hatsProtocolCalls);

      const transferTopHatCallData = hatsClient.transferHatCallData({
        hatId: topHatId,
        from: MULTICALL3_ADDRESS,
        to: formData.admins[0].address,
      });

      const calls: {
        target: `0x${string}`;
        allowFailure: boolean;
        callData: `0x${string}`;
      }[] = [
        {
          target: HATS_ADDRESS,
          allowFailure: false,
          callData: hatsProtocolMulticallCallData.callData,
        },
        {
          target: HATS_MODULES_FACTORY_ADDRESS,
          allowFailure: false,
          callData: createModulesCalldata,
        },
        {
          target: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
          allowFailure: false,
          callData: createHsgV2Calldata,
        },
        {
          target: HATS_ADDRESS,
          allowFailure: false,
          callData: transferTopHatCallData.callData,
        },
      ];

      const hash = await walletClient.writeContract({
        account: address,
        address: MULTICALL3_ADDRESS,
        abi: MULTICALL3_ABI,
        functionName: 'aggregate3',
        args: [calls],
        chain: walletClient.chain,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        success: receipt.status === 'success',
        transactionHash: receipt.transactionHash,
      };
    },
    onError: (error) => {
      console.error('Error deploying council:', error);
      throw error;
    },
  });

  return (
    <CouncilFormContext.Provider
      value={{
        form,
        isLoading,
        persistForm: (step: string, subStep?: string) => persistForm({ step, subStep }),
        stepValidation,
        setStepValidation,
        deployCouncil,
        isDeploying,
        canEdit,
      }}
    >
      {children}
    </CouncilFormContext.Provider>
  );
}

export const useCouncilForm = () => {
  const context = useContext(CouncilFormContext);
  if (!context) {
    throw new Error('useCouncilForm must be used within CouncilFormProvider');
  }
  return context;
};
