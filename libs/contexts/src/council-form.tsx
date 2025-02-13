'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import {
  AGREEMENT_ELIGIBILITY_ADDRESS,
  ALLOWLIST_ELIGIBILITY_ADDRESS,
  ELIGIBILITY_CHAIN_ADDRESS,
  ERC20_ELIGIBILITY_ADDRESS,
  FALLBACK_ADDRESS,
  getChainTokens,
  getTokenDecimals,
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HSG_V2_ABI,
  HSG_V2_ADDRESS,
  MULTI_CLAIMS_HATTER_V1_ADDRESS,
  MULTICALL3_ABI,
  MULTICALL3_ADDRESS,
  SAFE_ABI,
  TokenInfo,
  ZODIAC_MODULE_PROXY_FACTORY_ABI,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { HatsDetailsClient } from '@hatsprotocol/details-sdk';
import {
  hatIdDecimalToIp,
  hatIdIpToDecimal,
  hatIdToTreeId,
  HATS_ABI,
  HATS_V1,
  treeIdToTopHatId,
} from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalStorage, useToast, useWaitForSubgraph } from 'hooks';
import { find, first, get, map, toNumber, toString, values } from 'lodash';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';
import {
  CompletedOptionalSteps,
  CouncilFormData,
  CouncilFormResponse,
  StepValidation,
  UpdateCouncilFormResponse,
} from 'types';
import {
  addCouncilForForm,
  chainIdToString,
  chainsMap,
  councilsGraphqlClient,
  createHatsClient,
  createHatsModulesClient,
  createOrganization,
  explorerUrl,
  fetchToken,
  GET_COUNCIL_FORM,
  logger,
  pinFileToIpfs,
  sendTelegramMessage,
  UPDATE_COUNCIL_FORM,
  updateCouncilForm,
  viemPublicClient,
} from 'utils';
import {
  Address,
  decodeEventLog,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  parseEventLogs,
  parseUnits,
  TransactionReceipt,
  zeroAddress,
} from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import { useOverlay } from './overlay-context';

interface CouncilFormContextType {
  form: UseFormReturn<CouncilFormData>;
  isLoading: boolean;
  persistForm: (step: string, subStep?: string) => Promise<unknown>;
  stepValidation: StepValidation;
  setStepValidation: (
    step: keyof StepValidation,
    isValid: boolean | Partial<StepValidation[keyof StepValidation]>,
  ) => void;
  deployCouncil: () => void;
  isDeploying: boolean;
  canEdit: boolean;
  toggleOptionalStep: (step: keyof CompletedOptionalSteps) => void;
  availableTokens: TokenInfo[];
  deployStatus: DeployStatus;
}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

const converter = new showdown.Converter();

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(undefined);

type StepValidationData = CouncilFormResponse['councilCreationForm'] & {
  completedOptionalSteps: CompletedOptionalSteps;
  deployOnly?: boolean;
};

const notDeploy = (deployOnly: boolean | undefined, value: boolean) => {
  if (deployOnly === true) return true;
  return value;
};

const computeStepValidation = (data: StepValidationData): StepValidation => {
  return {
    details: !!(
      data.organizationName &&
      data.organizationName !== '' &&
      data.councilName &&
      data.councilName !== '' &&
      data.chain !== null
    ),
    threshold:
      !!(
        data.maxCouncilMembers &&
        data.maxCouncilMembers > 0 &&
        data.thresholdType &&
        data.thresholdTarget &&
        data.thresholdTarget > 0
      ) && notDeploy(data.deployOnly, data.completedOptionalSteps.threshold),
    onboarding: !!data.membersSelectionType,
    selection: false, // Main step validity will be computed from sub-steps
    selectionSubSteps: {
      management:
        !!(data.admins && data.admins.length > 0) && notDeploy(data.deployOnly, data.completedOptionalSteps.management), // admins are required, but creator is added by default
      compliance:
        data.createComplianceAdminRole !== null && notDeploy(data.deployOnly, data.completedOptionalSteps.compliance),
      agreement:
        data.createAgreementAdminRole !== null && notDeploy(data.deployOnly, data.completedOptionalSteps.agreement), // agreement is optional
      tokens:
        data.tokenAddress !== null &&
        data.tokenAddress !== '' &&
        data.tokenAmount !== null &&
        toNumber(data.tokenAmount) > 0,
      members: !!data.members && notDeploy(data.deployOnly, data.completedOptionalSteps.members),
    },
    payment: false,
  };
};

interface DeployStatus {
  [key: string]: boolean;
}

const initialDeployStatus: DeployStatus = {
  pinningRoleDetails: false,
  calculatingRoleMetadata: false,
  configuringModules: false,
  chainModules: false,
  simulateSafeAddress: false,
  allocatingInitialRoles: false,
  compilingTxCalldata: false,
  deployTx: false,
  processTx: false,
  updateMetadata: false,
  redirect: false,
};

export function CouncilFormProvider({ children, draftId }: { children: React.ReactNode; draftId: string | null }) {
  const { user, authenticated } = usePrivy();
  const [canEdit, setCanEdit] = useState(false);
  const [deployStatus, setDeployStatus] = useState(initialDeployStatus);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { handlePendingTx } = useOverlay();
  const router = useRouter();
  const [optionalSteps, setOptionalSteps] = useLocalStorage<CompletedOptionalSteps>(`${draftId}-optionalSteps`, {
    threshold: false,
    members: false,
    management: false,
    agreement: false,
    compliance: false,
  });

  const form = useForm<CouncilFormData>({
    defaultValues: {
      organizationName: '',
      councilName: '',
      chain: first(chainOptions),
      councilDescription: '',
      thresholdType: 'ABSOLUTE',
      // confirmationsRequired: 4,
      target: 4, // 4 is the default value for ABSOLUTE threshold
      min: 2,
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
        address: undefined,
        minimum: 0,
      },
      completedOptionalSteps: optionalSteps,
    },
  });
  const chainId = toNumber(form.watch('chain').value) || 10;
  const waitForSubgraph = useWaitForSubgraph({ chainId });
  const { toast } = useToast();

  const availableTokens = useMemo(() => getChainTokens(chainId as number), [chainId]);

  // const mappedTokens = useMemo(() => {
  //   logger.info('mappedTokens useMemo', { availableTokens });
  //   const mappedTokens = map(availableTokens, ({ address, name, symbol }) => ({
  //     value: address,
  //     label: `${name} (${symbol})`,
  //   }));

  //   return mappedTokens;
  // }, [availableTokens]);

  const [stepValidation, setStepValidationState] = useState<StepValidation>({
    details: false,
    threshold: false,
    onboarding: false,
    selection: false,
    selectionSubSteps: {
      management: false,
      compliance: false,
      agreement: false,
      tokens: false,
      members: false,
    },
    payment: false,
  });
  // logger.debug({ stepValidation });

  const setStepValidation = useCallback(
    (step: keyof StepValidation, isValid: boolean | Partial<StepValidation[keyof StepValidation]>) => {
      logger.debug('Setting step validation:', { step, isValid });
      setStepValidationState((prev) => {
        if (step === 'selectionSubSteps') {
          const newState = {
            ...prev,
            selectionSubSteps: {
              ...prev.selectionSubSteps,
              ...(isValid as Partial<StepValidation['selectionSubSteps']>),
            },
          };
          logger.debug('New validation state:', { newState });
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
          logger.debug('result', result);
          return result.councilCreationForm;
        })
        .catch((error) => {
          logger.error('Error fetching council form:', error);
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
      setCanEdit(false);
      return;
    }

    const userAddress = user.wallet.address.toLowerCase();
    const isCreator = data.creator?.toLowerCase() === userAddress;
    const isAdmin = data.admins?.some((admin) => admin.address.toLowerCase() === userAddress);

    setCanEdit(isCreator || isAdmin);
  }, [authenticated, user?.wallet?.address, data]);

  useEffect(() => {
    if (!data || !optionalSteps || !chainId) return;

    logger.info('useEffect', { data, optionalSteps, chainId });
    const availableTokensEffect = getChainTokens(chainId as number);
    const mappedTokens = map(availableTokensEffect, ({ address, name, symbol }) => ({
      value: address,
      label: `${name} (${symbol})`,
    }));

    logger.debug('API Response data:', data);
    const currentValues = form.getValues();
    logger.info('Current form values:', currentValues);
    const chain = find(values(chainOptions), { value: data.chain?.toString() }) || first(values(chainOptions));

    const newValues: CouncilFormData = {
      organizationName: data.organizationName || '',
      councilName: data.councilName || '',
      chain: chain as any, // (find(values(chainOptions), { value: data.chain?.toString() }) || first(values(chainOptions))) as any,
      councilDescription: data.councilDescription || '',
      thresholdType: data.thresholdType || 'ABSOLUTE',
      // confirmationsRequired: data.thresholdTarget || 4,
      target: data.thresholdTarget || 51,
      min: data.thresholdMin || 2,
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
        address: (find(mappedTokens, { value: data.tokenAddress }) || undefined) as any, // TODO replace any, thinks it's a number
        minimum: toNumber(data.tokenAmount) || 0,
      },
      creator: data.creator || '',
      completedOptionalSteps: {
        threshold: optionalSteps.threshold || false,
        members: optionalSteps.members || false,
        management: optionalSteps.management || false,
        agreement: optionalSteps.agreement || false,
        compliance: optionalSteps.compliance || false,
      },
    };
    logger.info('Setting form to:', newValues);
    form.reset(newValues);

    const deployOnly = localStorage.getItem('deployOnly');

    // Compute validation state here
    const validation = computeStepValidation({
      ...data,
      completedOptionalSteps: optionalSteps,
      deployOnly: deployOnly === 'true' ? true : false,
    });
    // deploy only == people are looking at the deploy page ONLY
    // this would be users who are NOT the creator or a council manager (we could have an issue here if creator is a manager)
    // do we want to have the different pages write the deployOnly flag to localStorage
    // if details writes deployOnly = false, then the other pages would ignore and continue
    // if loading the deploy page FIRST it would write deployOnly = true and ignore the optional

    setStepValidationState(validation);
  }, [data, form, optionalSteps]); // TODO adding mappedTokens here causes an issue with selecting the chain in the details step

  const queryClient = useQueryClient();

  const toggleOptionalStep = (step: keyof CompletedOptionalSteps) => {
    setOptionalSteps((prev) => ({ ...prev, [step]: true }));
  };

  const { mutateAsync: persistForm } = useMutation<
    UpdateCouncilFormResponse,
    Error,
    { step: string; subStep?: string }
  >({
    mutationFn: async ({ step, subStep }) => {
      const formData = form.getValues();
      let payload: Partial<CouncilFormResponse['councilCreationForm']> = { id: draftId || undefined };

      switch (step) {
        case 'details':
          // Get previous form data from query cache
          const previousData = queryClient.getQueryData<CouncilFormResponse['councilCreationForm']>([
            'councilForm',
            draftId,
          ]);
          const previousChain = previousData?.chain;
          const newChain = toNumber(formData.chain.value);

          payload = {
            ...payload,
            organizationName: formData.organizationName,
            councilName: formData.councilName,
            chain: toNumber(formData.chain.value),
            councilDescription: formData.councilDescription,
          };

          // If chain has changed, reset token requirements in the payload
          if (previousChain && previousChain !== newChain) {
            logger.info('chain has changed', { previousChain, newChain });
            payload = {
              ...payload,
              tokenAddress: '',
              tokenAmount: '0',
            };
          }
          break;

        case 'threshold':
          toggleOptionalStep('threshold');
          payload = {
            ...payload,
            thresholdType: formData.thresholdType,
            maxCouncilMembers: parseInt(formData.maxMembers.toString()),
            thresholdTarget: parseInt(formData.target.toString()),
            thresholdMin: parseInt(formData.min.toString()),
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
              toggleOptionalStep('members');
              payload = {
                ...payload,
                members: formData.members,
              };
              break;
            case 'management':
              toggleOptionalStep('management');
              payload = {
                ...payload,
                admins: formData.admins,
              };
              break;
            case 'compliance':
              toggleOptionalStep('compliance');
              payload = {
                ...payload,
                complianceAdmins: formData.complianceAdmins,
                createComplianceAdminRole: formData.createComplianceAdminRole === 'true',
              };
              break;
            case 'agreement':
              toggleOptionalStep('agreement');
              // need to convert html to markdown before pinning
              const agreementMarkdown = converter.makeMarkdown(formData.agreement || '');

              payload = {
                ...payload,
                agreement: agreementMarkdown,
                agreementAdmins: formData.agreementAdmins,
                createAgreementAdminRole: formData.createAgreementAdminRole === 'true',
              };
              break;
            case 'tokens':
              const tokenAddress = formData.tokenRequirement.address?.value;

              payload = {
                ...payload,
                tokenAddress,
                tokenAmount: formData.tokenRequirement.minimum.toString(), // stored in string version of numeric value, convert at deploy
                memberRequirements: {
                  ...formData.requirements,
                  holdTokens: true,
                },
              };
              break;
          }
          break;
      }

      logger.debug('payload', payload);
      return await councilsGraphqlClient.request<UpdateCouncilFormResponse>(UPDATE_COUNCIL_FORM, payload);
    },
    onSuccess: (data: UpdateCouncilFormResponse) => {
      console.log('onSuccess', data);
      queryClient.setQueryData(['councilForm', draftId], data.updateCouncilCreationForm);
    },
    onError: (error: Error) => {
      console.error('onError', error);
      toast({ title: 'Failed to update council form', variant: 'destructive' });
    },
  });

  const { mutateAsync: deployCouncil, isPending: isDeploying } = useMutation({
    mutationFn: async () => {
      logger.debug('Deploying council');
      const formData = form.getValues();
      setDeployStatus((prev) => ({ ...prev, pinningRoleDetails: true }));

      const chainId = toNumber(formData.chain?.value);

      // Create public and wallet clients
      const publicClient = viemPublicClient(chainId);

      // Create hats client
      const hatsClient = await createHatsClient(chainId).catch((err) => console.log(err));
      if (!hatsClient) {
        throw new Error('Failed to create hats client');
      }

      // Create hats details client
      const pinningKey = await fetchToken(20);
      const hatsDetailsClient = new HatsDetailsClient({
        provider: 'pinata',
        pinata: { pinningKey: pinningKey as string },
      });

      const hatsProtocolCalls: `0x${string}`[] = [];
      setDeployStatus((prev) => ({ ...prev, calculatingRoleMetadata: true }));

      // compute hat ids
      const currentTreeCount = await hatsClient.getTreesCount();
      const topHatId = treeIdToTopHatId(currentTreeCount + 1);
      const adminHatId = hatIdIpToDecimal(hatIdDecimalToIp(topHatId) + '.1');
      const automationsHatId = hatIdIpToDecimal(hatIdDecimalToIp(adminHatId) + '.1');
      const orgRolesGroupHatId = hatIdIpToDecimal(hatIdDecimalToIp(automationsHatId) + '.1');
      const councilRolesGroupHatId = hatIdIpToDecimal(hatIdDecimalToIp(automationsHatId) + '.2');
      // const councilAdminHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.1');
      const complianceManagerHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.2');
      const agreementManagerHatId = hatIdIpToDecimal(hatIdDecimalToIp(orgRolesGroupHatId) + '.3');
      const councilMemberHatId = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroupHatId) + '.1');
      const councilHatId = hatIdIpToDecimal(hatIdDecimalToIp(councilRolesGroupHatId) + '.2');

      logger.debug('COMPUTED HAT IDs');

      const saltNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
      const saltNonceComplianceModule = saltNonce + BigInt(1);

      // modules batch creation params
      const implementations: `0x${string}`[] = [];
      const hatIds: bigint[] = [];
      const immutableArgs: `0x${string}`[] = [];
      const initArgs: `0x${string}`[] = [];
      const saltNonces: bigint[] = [];

      setDeployStatus((prev) => ({ ...prev, configuringModules: true }));

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
      if (formData.requirements.signAgreement) {
        let agreementCid: string = '';
        if (formData.agreement) {
          const agreementMarkdown = converter.makeMarkdown(formData.agreement || '');
          // pin agreement file to ipfs
          agreementCid = await pinFileToIpfs({
            file: agreementMarkdown,
            fileName: `agreement_${formData.organizationName}_${formData.councilName}_${chainId}`,
            token: pinningKey as string,
          });
        }

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
        predictedAgreementModuleAddress = (await publicClient
          .readContract({
            address: HATS_MODULES_FACTORY_ADDRESS,
            abi: HATS_MODULES_FACTORY_ABI,
            functionName: 'getHatsModuleAddress',
            args: [AGREEMENT_ELIGIBILITY_ADDRESS, agreementModuleHatId, agreementModuleImmutableArgs, saltNonce],
          })
          .catch((err) => console.log(err))) as `0x${string}`;
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
      console.log('formData.tokenRequirement', formData.requirements, formData.tokenRequirement);
      if (formData.requirements.holdTokens && formData.tokenRequirement.address?.value) {
        const tokenDecimals = getTokenDecimals(chainId, formData.tokenRequirement.address.value) as number;
        logger.debug(
          'tokenDecimals',
          tokenDecimals,
          formData.tokenRequirement.minimum,
          toString(formData.tokenRequirement.minimum),
          parseUnits(toString(formData.tokenRequirement.minimum), tokenDecimals),
        );
        if (!tokenDecimals) {
          throw new Error('Failed to get token decimals');
        }
        erc20ModuleInitArgs = '0x' as `0x${string}`;
        erc20ModuleImmutableArgs = encodePacked(
          ['address', 'uint256'],
          [
            formData.tokenRequirement.address.value as `0x${string}`,
            parseUnits(toString(formData.tokenRequirement.minimum), tokenDecimals),
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
      setDeployStatus((prev) => ({ ...prev, chainModules: true }));

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
        logger.debug('chainModules', chainModules);
        eligibilityChainInitArgs = '0x' as `0x${string}`;
        eligibilityChainImmutableArgs = encodePacked(
          ['uint256', 'uint256[]', ...Array(chainLength).fill('address')],
          [BigInt(1), [BigInt(chainLength)], ...chainModules],
        );
        logger.info('eligibility chain args', {
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
        logger.debug('predicted eligibility chain address', predictedEligibilityChainAddress);
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
        data: { name: formData.organizationName, description: formData.councilDescription },
      });
      const createTopHatCallData = hatsClient.mintTopHatCallData({
        target: MULTICALL3_ADDRESS as Address,
        details: `ipfs://${detailsCid}`,
      });
      hatsProtocolCalls.push(createTopHatCallData.callData);

      // create admin hat call data
      const adminHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: { name: 'Admin' },
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
        data: { name: 'Automations' },
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
        data: { name: 'Org Roles' },
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
        data: { name: 'Council Roles' },
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
        data: { name: 'Council Admin' },
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

      if (formData.createComplianceAdminRole === 'true') {
        // create compliance manager hat call data
        const complianceManagerHatCid = await hatsDetailsClient.pin({
          type: '1.0',
          data: { name: 'Compliance Manager' },
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
      }

      if (formData.createAgreementAdminRole === 'true') {
        // create agreement manager hat call data
        const agreementManagerHatCid = await hatsDetailsClient.pin({
          type: '1.0',
          data: { name: 'Agreement Manager' },
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
      }

      // create council member hat call data
      const councilMemberHatCid = await hatsDetailsClient.pin({
        type: '1.0',
        data: { name: 'Council Member' },
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
        data: { name: 'Council' },
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

      setDeployStatus((prev) => ({ ...prev, compilingTxCalldata: true }));

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

      // ! DON'T mint council member hat on deploy
      // const mintCouncilMemberHatCallData = hatsClient.batchMintHatsCallData({
      //   hatIds: Array(formData.members.length).fill(councilMemberHatId),
      //   wearers: formData.members.map((member) => member.address),
      // });
      // hatsProtocolCalls.push(mintCouncilMemberHatCallData.callData);

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
              min: BigInt(formData.min),
              // currently only support one threshold on absolute
              target: formData.thresholdType === 'ABSOLUTE' ? BigInt(formData.min) : BigInt(formData.target * 100),
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
      setDeployStatus((prev) => ({ ...prev, simulateSafeAddress: true }));

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
      logger.info(`simulationResult ${simulationResult.transaction.status ? 'successful' : 'failed'}`);

      // Find the safe proxy address from simulation logs
      let safeProxyAddress: Address | undefined;

      if (!simulationResult?.transaction?.status) {
        logger.error('Simulation failed');
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
          logger.debug('Found Safe proxy address:', safeProxyAddress);
          break;
        } catch (err) {
          // Continue if this log entry isn't the event we're looking for
          continue;
        }
      }

      if (!safeProxyAddress) {
        logger.error('Failed to find Safe proxy address in simulation logs');
        throw new Error('Failed to find Safe proxy address in simulation logs');
      }

      logger.info('safeProxyAddress', safeProxyAddress);

      setDeployStatus((prev) => ({ ...prev, allocatingInitialRoles: true }));

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
          target: HATS_V1,
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
          target: HATS_V1,
          allowFailure: false,
          callData: transferTopHatCallData.callData,
        },
      ];

      if (!walletClient) {
        logger.error('Wallet client not found');
        throw new Error('Wallet client not found');
      }
      setDeployStatus((prev) => ({ ...prev, deployTx: true }));

      const hash = await walletClient?.writeContract({
        account: address,
        address: MULTICALL3_ADDRESS,
        abi: MULTICALL3_ABI,
        functionName: 'aggregate3',
        args: [calls],
        chain: walletClient.chain,
      });
      logger.debug('hash', hash);

      if (!hash) {
        logger.error('Failed to create transaction');
        throw new Error('Failed to create transaction');
      }

      handlePendingTx?.({
        hash,
        txChainId: chainId,
        txDescription: 'Deploying council',
        waitForSubgraph,
        onSuccess: async (data: TransactionReceipt | undefined) => {
          setDeployStatus((prev) => ({ ...prev, processTx: true }));
          if (!data || !draftId) return;
          logger.info('Transaction successful', data);
          const hatCreatedLogs = parseEventLogs({
            logs: data.logs,
            abi: HATS_ABI,
            eventName: 'HatCreated',
          });
          const moduleCreatedLogs = parseEventLogs({
            logs: data.logs,
            abi: HATS_MODULES_FACTORY_ABI,
            eventName: 'HatsModuleFactory_ModuleDeployed',
          });
          const safeCreatedLogs = parseEventLogs({
            logs: data.logs,
            abi: SAFE_ABI,
            eventName: ['SafeSetup'],
          });
          const hsgCreatedLogs = parseEventLogs({
            logs: data.logs,
            abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
            eventName: 'ModuleProxyCreation',
          });
          const hatsModulesClient = await createHatsModulesClient(chainId);
          if (!hatsModulesClient) {
            logger.error('Failed to create hats modules client');
            throw new Error('Failed to create hats modules client');
          }
          const extendModuleLogs = map(moduleCreatedLogs, (log: { args: { implementation: string } }) => {
            const module = hatsModulesClient.getModuleByImplementation(log.args.implementation);
            return { ...log, args: { ...log.args, module } };
          });
          logger.debug('relevant deploy logs', {
            hatCreatedLogs,
            moduleCreatedLogs: extendModuleLogs,
            safeCreatedLogs,
            hsgCreatedLogs,
          });

          setDeployStatus((prev) => ({ ...prev, updateMetadata: true }));

          const hsgAddress = get(
            find(hsgCreatedLogs, (log: { args: { masterCopy: string } }) => log.args.masterCopy === HSG_V2_ADDRESS),
            'args.proxy',
          );
          const safeAddress = get(first(safeCreatedLogs), 'address');
          const firstHatId = get(first(hatCreatedLogs), 'args.id');
          const treeId = firstHatId ? hatIdToTreeId(firstHatId) : undefined;
          logger.info('addresses', { hsgAddress, safeAddress, treeId });

          const organization = await createOrganization({
            name: formData.organizationName,
          });
          logger.info('organization created', get(organization, 'createOrganization'));
          const organizationId = get(organization, 'createOrganization.id');

          const council = await addCouncilForForm({
            chainId,
            organizationId,
            hsgAddress,
            treeId,
            membersSelectionModule: predictedCouncilMemberAllowlistAddress,
            membersCriteriaModule: predictedComplianceAllowlistAddress,
            deployed: true,
          });
          logger.info('council created', council);
          const councilId = get(council, 'createCouncil.id');

          await updateCouncilForm({
            draftId,
            councilId,
          });
          logger.debug('council form updated with council id:', councilId);

          setDeployStatus((prev) => ({ ...prev, redirect: true }));

          const appUrl = window.location.origin || 'https://hats-app.vercel.app';
          const message = `New HSG council *${formData.councilName}* for ${formData.organizationName} deployed on ${chainsMap(chainId)?.name}: `;
          const links = `[View Council](${appUrl}/councils/${chainIdToString(chainId)}:${hsgAddress}/members)\n[View HSG \\(${hsgAddress}\\)](${explorerUrl(chainId)}/address/${hsgAddress}) `;

          sendTelegramMessage(`${message} ${links}`);
          logger.debug('Telegram notification sent');
          // TODO email notification

          posthog.capture('Council Deployed', {
            councilName: formData.councilName,
            organizationName: formData.organizationName,
            chain: chainsMap(chainId)?.name,
            hsgAddress,
          });

          const redirectUrl = `/councils/${chainIdToString(chainId)}:${hsgAddress}/members`;

          logger.debug('redirecting to ', redirectUrl);
          router.push(redirectUrl);
        },
      });
    },
    onError: (error) => {
      logger.error('Error deploying council:', error);
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
        toggleOptionalStep,
        availableTokens,
        deployStatus,
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
