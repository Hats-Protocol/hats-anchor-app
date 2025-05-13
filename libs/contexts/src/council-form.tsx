/* eslint-disable no-case-declarations */
'use client';

import { chainsList } from '@hatsprotocol/config';
import {
  defaultEligibilityRequirements,
  getChainTokens,
  initialDeployStatus,
  TokenInfo,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { HATS_MODULES_FACTORY_ADDRESS } from '@hatsprotocol/modules-sdk';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph/dist/types';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTreeDetails } from 'hats-hooks';
import { fetchCouncilDetails, useOrganization, useToast, useWaitForSubgraph } from 'hooks';
import { compact, concat, find, first, isEmpty, map, toNumber, uniq, values } from 'lodash';
import { getEligibilityRules } from 'modules-hooks';
import { useSearchParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';
import {
  CouncilData,
  CouncilFormData,
  CouncilFormResponse,
  CreationForm,
  DeployStatus,
  ExtendedHSGV2,
  HatToCreate,
  Organization,
  StepValidation,
  SupportedChains,
  UpdateCouncilFormResponse,
} from 'types';
import {
  GET_COUNCIL_FORM,
  getCouncilsGraphqlClient,
  logger,
  // sendTelegramMessage,
  UPDATE_COUNCIL_FORM,
} from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { UseSimulateContractReturnType } from 'wagmi';

import { useOverlay } from './overlay-context';
import { useCouncilDeploy, useCouncilDeployCalldata } from './pro-hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimulateContractReturnType = UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;

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
  availableTokens: TokenInfo[];
  tree: Tree | null | undefined;
  // deploy data
  hatIds: { [key: string]: bigint };
  moduleAddresses: { [key: string]: string };
  organization: Organization | undefined;
  hatsToCreate: HatToCreate[];
  mchArgs: any | undefined;
  // deploy handlers
  deployStatus: DeployStatus;
  deployHats: () => void;
  deployModules: () => void;
  deployHsg: () => void;
  deployModulesWithMch: () => void;
  deployOnSuccess: (tx: TransactionReceipt | undefined, extraLogs?: TransactionReceipt['logs']) => void;
  // calldata
  deployCouncilCalldata: Hex | undefined;
  deployHatsCalldata: Hex | undefined;
  deployModulesCalldata: Hex | undefined;
  deployHsgCalldata: Hex | undefined;
  deployMchCalldata: Hex | undefined;
  // TODO fix these types
  // simulation results
  simulateCouncil: SimulateContractReturnType;
  simulateHats: SimulateContractReturnType;
  simulateModules: SimulateContractReturnType;
  simulateHsg: SimulateContractReturnType;
  simulateMch: SimulateContractReturnType;
  councilsData: CouncilData[] | undefined;
}

const chainOptions = map(values(chainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

const converter = new showdown.Converter();

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(undefined);

/**
 * Computes the step validation state based on the form data
 * @param data - The existing council form data
 * @note Doesn't matter if the step is invalid if it's not used/required in the form
 * @returns The step validation state
 */
const computeStepValidation = (data: CouncilFormData): StepValidation => {
  return {
    details: !!(
      data.organizationName &&
      data.organizationName !== '' &&
      data.councilName &&
      data.councilName !== '' &&
      data.chain !== null
    ),
    threshold:
      !!(data.maxMembers && data.maxMembers > 0 && data.thresholdType && data.target && data.target > 0) &&
      data.completedOptionalSteps.includes('threshold'), // TODO handle optional
    selection: !!data.membershipType && data.completedOptionalSteps.includes('selection'),
    eligibility: false, // Main step validity will be computed from sub-steps
    eligibilitySubSteps: {
      management: !!(data.admins && data.admins.length > 0) && data.eligibilityRequirements?.selection.adminsSet, // admins are required, but creator is added by default
      compliance:
        !!data.complianceAdmins &&
        data.complianceAdmins.length > 0 &&
        data.eligibilityRequirements?.compliance.adminsSet,
      agreement:
        // must have content or select a pre-existing module ID
        (!!data.eligibilityRequirements?.agreement.existingId || !!data.eligibilityRequirements?.agreement.content) &&
        // must have admins or existing admins (technically, not applicable when using existing module ID)
        ((!!data.agreementAdmins && data.agreementAdmins.length > 0) ||
          !!data.eligibilityRequirements?.agreement.existingAdmins) &&
        data.eligibilityRequirements?.agreement.set &&
        data.eligibilityRequirements?.agreement.adminsSet, // `agreement.content` is optional
      tokens:
        !!data.eligibilityRequirements?.erc20?.address &&
        !!data.eligibilityRequirements?.erc20?.amount &&
        data.eligibilityRequirements?.erc20?.set,
      members: data.eligibilityRequirements?.selection.set, // members are not required
    },
    deploy: false,
  };
};

export function CouncilFormProvider({ children, draftId }: { children: React.ReactNode; draftId: string | null }) {
  const { user, authenticated, getAccessToken } = usePrivy();
  const [canEdit, setCanEdit] = useState(false);
  const [deployStatus, setDeployStatus] = useState(initialDeployStatus);
  const { handlePendingTx } = useOverlay();

  const searchParams = useSearchParams();

  // Get organizationName from URL if it exists
  const orgNameFromUrl = searchParams.get('organizationName');
  const orgOption = {
    value: decodeURIComponent(orgNameFromUrl || ''),
    label: decodeURIComponent(orgNameFromUrl || ''),
  };
  const initialOrgName = orgNameFromUrl ? orgOption : '';

  const form = useForm<CouncilFormData>({
    defaultValues: {
      organizationName: initialOrgName,
      councilName: '',
      chain: first(chainOptions),
      councilDescription: '',
      thresholdType: 'ABSOLUTE',
      target: 4, // 4 is the default value for ABSOLUTE threshold
      min: 2,
      maxMembers: 7,
      membershipType: 'APPOINTED',
      eligibilityRequirements: defaultEligibilityRequirements,
      completedOptionalSteps: [],
      members: [],
      admins: [],
      complianceAdmins: [],
      agreementAdmins: [],
      payer: undefined,
      // form state
      acceptedTerms: false,
    },
  });
  const chainId = toNumber(form.watch('chain').value) || 10;
  const waitForSubgraph = useWaitForSubgraph({ chainId, interval: 2_000, waitTimeout: 60_000 });
  const { toast } = useToast();

  const availableTokens = useMemo(() => getChainTokens(chainId as number), [chainId]);

  const [stepValidation, setStepValidationState] = useState<StepValidation>({
    details: false,
    threshold: false,
    selection: false,
    eligibility: false,
    eligibilitySubSteps: {
      management: false,
      compliance: false,
      agreement: false,
      tokens: false,
      members: false,
    },
    deploy: false,
  });

  // this is the same data as returned in the useOffchainCouncilDetails hook. we can reduce usage of that hook now since that data can be accessed by organization.councils

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isLoading: isLoadingOrganization } = useOrganization(orgName);

  // similar process to get the onchain data that we'd need in all of the reusable elibility modules
  const getOnchainCouncilsData = async ({ organization }: { organization: Organization }) => {
    const hsgAddresses = compact(map(organization?.councils, 'hsg')); // this would only return existing hsg values

    const onchainCouncilsData = await Promise.all(
      map(hsgAddresses, (hsgAddress) => fetchCouncilDetails({ chainId, address: hsgAddress })),
    ).catch((error) => {
      logger.error('Error fetching onchain councils data:', error);
      return [];
    }); // move this from the hooks to elsewhere

    // integrate the rawOrganizations council data here
    const fullCouncilData = map(organization?.councils, (council) => {
      const onchainCouncilData = find(onchainCouncilsData, { id: council.hsg.toLowerCase() });

      let parsedEligibilityRequirements;
      try {
        if (typeof council.creationForm.eligibilityRequirements === 'string') {
          parsedEligibilityRequirements = JSON.parse(council.creationForm.eligibilityRequirements);
        } else {
          parsedEligibilityRequirements = council.creationForm.eligibilityRequirements;
        }
      } catch (error) {
        logger.error('Error parsing eligibility requirements:', error);
      }

      return {
        ...council,
        ...(onchainCouncilData as ExtendedHSGV2),
        eligibilityRequirements: parsedEligibilityRequirements,
        id: council.id,
      };
    });

    const councilsEligibilityRules = await Promise.all(
      map(fullCouncilData, (council) => {
        return getEligibilityRules({
          address: council?.signerHats[0].eligibility,
          chainId: council?.chain as SupportedChains,
        });
      }),
    ).catch((error) => {
      logger.error('Error fetching eligibility rules:', error);
      return [];
    });

    const fullCouncilDataWithEligibilityRules = map(fullCouncilData, (council, index) => {
      // const onchainCouncilData = find(councilsEligibilityRules, { id: council.hsg.toLowerCase() });
      const onchainEligibilityRulesData = councilsEligibilityRules[index];

      return {
        ...council,
        eligibilityRules: onchainEligibilityRulesData,
      };
    });

    return fullCouncilDataWithEligibilityRules;
  };

  const { data: councilsData } = useQuery({
    queryKey: ['councilsData', organization],
    queryFn: () => getOnchainCouncilsData({ organization: organization as Organization }),
    enabled: !!organization,
  });

  // handle other treeIds or chainIds across an organization. this is assuming that we're working within a single council (the first council)
  const treeId = organization?.councils?.[0]?.treeId;
  const { data: tree, isLoading: isLoadingTree } = useTreeDetails({
    treeId: toNumber(treeId),
    chainId,
    enabled: !!treeId,
  });

  const setStepValidation = useCallback(
    (step: keyof StepValidation, subSteps: boolean | Partial<StepValidation['eligibilitySubSteps']>) => {
      setStepValidationState((prev) => {
        if (step === 'eligibilitySubSteps') {
          const newState = {
            ...prev,
            eligibilitySubSteps: {
              ...prev.eligibilitySubSteps,
              ...(subSteps as Partial<StepValidation['eligibilitySubSteps']>),
            },
          };
          logger.debug('New validation state:', { newState });
          return newState;
        }
        return {
          ...prev,
          [step]: !!subSteps,
        };
      });
    },
    [],
  );

  // persist the form data from the database
  const { isLoading, data: apiData } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      const councilsGraphqlClient = getCouncilsGraphqlClient(accessToken ?? undefined);
      return councilsGraphqlClient
        .request<CouncilFormResponse>(GET_COUNCIL_FORM, { id: draftId })
        .then((result) => {
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
    if (!authenticated || !user?.wallet?.address || !apiData) {
      setCanEdit(false);
      return;
    }

    const userAddress = user.wallet.address.toLowerCase();
    const isCreator = apiData.creator?.toLowerCase() === userAddress;
    const isAdmin = apiData.admins?.some((admin) => admin.address.toLowerCase() === userAddress);

    setCanEdit(isCreator || isAdmin);
  }, [authenticated, user?.wallet?.address, apiData]);

  // compute the step validation state
  useEffect(() => {
    if (!apiData) return;

    logger.debug('API Response data:', apiData);
    const currentValues = form.getValues();
    logger.info('Current form values:', currentValues);

    const chain = find(values(chainOptions), { value: apiData.chain?.toString() }) || first(values(chainOptions));
    if (!chain) throw new Error('Chain not found');

    // TODO `transformCouncilFormData()`

    // Set initial admins based on role
    const agreementAdmins = (apiData.agreementAdmins || []) ?? (apiData.admins || []);
    const complianceAdmins = (apiData.complianceAdmins || []) ?? (apiData.admins || []);

    const newValues: CouncilFormData = {
      organizationName: apiData.organizationName
        ? {
            value: apiData.organizationName,
            label: apiData.organizationName,
          }
        : '',
      councilName: apiData.councilName || '',
      chain,
      councilDescription: apiData.councilDescription || '',
      thresholdType: apiData.thresholdType || 'ABSOLUTE',
      target: apiData.thresholdTarget || 51,
      min: apiData.thresholdMin || 2,
      maxMembers: apiData.maxCouncilMembers || 7,
      membershipType: apiData.membersSelectionType === 'ELECTION' ? 'ELECTED' : 'APPOINTED',
      members: apiData.members || [],
      admins: apiData.admins || [],
      complianceAdmins,
      eligibilityRequirements: apiData.eligibilityRequirements
        ? JSON.parse(apiData.eligibilityRequirements)
        : defaultEligibilityRequirements,
      agreementAdmins,
      payer: apiData.payer || undefined,
      acceptedTerms: false,
      creator: apiData.creator || '',
      completedOptionalSteps: apiData.completedOptionalSteps ? JSON.parse(apiData.completedOptionalSteps) : [],
    };
    logger.info('Setting form to:', newValues);
    form.reset(newValues);

    // Compute validation state here
    const validation = computeStepValidation(newValues);

    setStepValidationState(validation);
  }, [apiData, form]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation<
    UpdateCouncilFormResponse,
    Error,
    { step: string; subStep?: string }
  >({
    mutationFn: async ({ step, subStep }) => {
      const formData = form.watch();
      let payload: Partial<CouncilFormData> = {
        id: draftId || undefined,
        ...formData,
      };

      const currentEligibilityRequirements = formData.eligibilityRequirements || defaultEligibilityRequirements;

      switch (step) {
        case 'details':
          // Get previous form data from query cache
          const previousData = queryClient.getQueryData<CouncilFormData>(['councilForm', draftId]);
          const previousChain = previousData?.chain;
          const newChain = toNumber(formData.chain.value);

          payload = {
            ...payload,
            organizationName: formData.organizationName,
            councilName: formData.councilName,
            chain: formData.chain,
            councilDescription: formData.councilDescription,
          };

          // If chain has changed, reset token requirements in the payload
          if (previousChain?.value && toNumber(previousChain.value) !== newChain) {
            payload = {
              ...payload,
              eligibilityRequirements: defaultEligibilityRequirements,
            };
          }
          break;

        case 'threshold':
          payload = {
            ...payload,
            thresholdType: formData.thresholdType,
            maxMembers: parseInt(formData.maxMembers.toString()),
            target: parseInt(formData.target.toString()),
            min: parseInt(formData.min.toString()),
            completedOptionalSteps: uniq(concat(formData.completedOptionalSteps || [], ['threshold'])),
          };
          break;

        case 'selection':
          payload = {
            ...payload,
            membershipType: formData.membershipType,
            eligibilityRequirements: {
              ...currentEligibilityRequirements,
              selection: {
                ...currentEligibilityRequirements.selection,
                required: true, // defaults to true also
              },
            },
            completedOptionalSteps: uniq(concat(formData.completedOptionalSteps || [], ['selection'])),
          };
          break;

        case 'eligibility':
          switch (subStep) {
            case 'members':
              payload = {
                ...payload,
                members: formData.members, // members handled as a relationship
                eligibilityRequirements: {
                  ...currentEligibilityRequirements,
                  selection: {
                    ...currentEligibilityRequirements.selection,
                    set: true, // `membersSet`
                  },
                },
              };
              break;
            case 'management':
              payload = {
                ...payload,
                admins: formData.admins || [], // admins handled as a relationship
                eligibilityRequirements: {
                  ...currentEligibilityRequirements,
                  selection: {
                    ...currentEligibilityRequirements.selection,
                    adminsSet: true,
                  },
                },
              };
              break;
            case 'compliance':
              payload = {
                ...payload,
                complianceAdmins: formData.complianceAdmins || [], // admins handled as a relationship
                eligibilityRequirements: {
                  ...currentEligibilityRequirements,
                  compliance: {
                    ...currentEligibilityRequirements.compliance,
                    // set: defaults to true already
                    adminsSet: true,
                  },
                },
              };
              break;
            case 'agreement':
              const agreementContent = currentEligibilityRequirements.agreement?.content;
              // need to convert html to markdown before pinning
              const agreementMarkdown = converter.makeMarkdown(agreementContent || '');

              // Always send the current agreementAdmins list
              payload = {
                ...payload,
                agreementAdmins: formData.agreementAdmins || [], // admins handled as a relationship
                eligibilityRequirements: {
                  ...currentEligibilityRequirements,
                  agreement: {
                    ...currentEligibilityRequirements.agreement,
                    content: agreementMarkdown,
                    set: true,
                    adminsSet: true,
                  },
                },
              };
              break;
            case 'tokens':
              const tokenAddress = currentEligibilityRequirements.erc20?.address;
              const tokenAmount = currentEligibilityRequirements.erc20?.amount;

              payload = {
                ...payload,
                eligibilityRequirements: {
                  ...currentEligibilityRequirements,
                  erc20: {
                    ...currentEligibilityRequirements.erc20,
                    address: tokenAddress,
                    amount: tokenAmount?.toString(),
                    set: true,
                    // adminsSet: true, no Admins
                  },
                },
              };
              break;
          }
      }

      logger.debug('payload', payload);
      const accessToken = await getAccessToken();
      const councilsGraphqlClient = getCouncilsGraphqlClient(accessToken ?? undefined);

      // Ensure form state is preserved during the request
      form.reset(payload);

      // TODO transformCouncilFormPayload()

      const defaultCouncilCreationForm = {
        creator: null,
        organizationName: null,
        councilName: null,
        chain: null,
        councilDescription: null,
        thresholdType: null,
        thresholdTarget: null,
        thresholdMin: null,
        maxCouncilMembers: null,
        membersSelectionType: null,
        eligibilityRequirements: defaultEligibilityRequirements,
        payer: null,
        members: [],
        admins: [],
        agreementAdmins: [],
        complianceAdmins: [],
        createComplianceAdminRole: false,
        agreement: undefined,
        createAgreementAdminRole: false,
        tokenAddress: null,
        tokenAmount: null,
      };

      // stringify the eligibilityRequirements HERE before it's sent to the db
      const newPayload: CouncilFormResponse['councilCreationForm'] = {
        ...defaultCouncilCreationForm,
        ...formData,
        id: payload.id || '',
        organizationName:
          typeof formData.organizationName === 'object' ? formData.organizationName.value : formData.organizationName,
        chain: toNumber(formData.chain.value),
        maxCouncilMembers: formData.maxMembers,
        thresholdMin: formData.min,
        thresholdTarget: formData.target,
        eligibilityRequirements:
          payload.eligibilityRequirements || formData.eligibilityRequirements
            ? JSON.stringify(payload.eligibilityRequirements || formData.eligibilityRequirements)
            : JSON.stringify(defaultEligibilityRequirements),
        completedOptionalSteps: payload.completedOptionalSteps
          ? JSON.stringify(payload.completedOptionalSteps)
          : formData.completedOptionalSteps
            ? JSON.stringify(formData.completedOptionalSteps)
            : JSON.stringify([]),
      };
      logger.debug('full payload', newPayload);

      // return await councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, newPayload as Partial<CreationForm>);
      // the payload we are sending has the formatting we need
      return await councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, newPayload as Partial<CreationForm>);
    },
    onSuccess: (data: UpdateCouncilFormResponse) => {
      // update query cache while preserving form state
      queryClient.setQueryData(['councilForm', draftId], (oldData: CreationForm) => ({
        ...oldData,
        ...data.updateCouncilCreationForm,
      }));
    },
    onError: (error: Error) => {
      logger.error('onError', error);
      toast({ title: 'Failed to update council form', variant: 'destructive' });
    },
  });

  const {
    calls,
    hatsProtocolCallData,
    moduleArgs,
    hsgArgs,
    hatIds,
    moduleAddresses,
    mchCallData,
    hatsToCreate,
    mchArgs,
  } = useCouncilDeployCalldata({
    formData: form.watch(),
    tree,
    treeLoading: isLoadingTree,
  });

  const {
    deploy: deployCouncil,
    simulateCouncil,
    isLoading: isDeploying,
    deployHats,
    deployModules,
    deployHsg,
    deployModulesWithMch,
    simulateHats,
    simulateModules,
    simulateHsg,
    simulateMch,
    multicallCalldata,
    onSuccess,
  } = useCouncilDeploy({
    formData: form.getValues(),
    calls,
    hatsProtocolCallData,
    moduleArgs,
    hsgArgs,
    chainId: toNumber(form.getValues().chain?.value),
    draftId,
    moduleAddresses,
    handlePendingTx,
    waitForSubgraph,
    mchArgs,
    setDeployStatus,
    firstCouncil: !tree || isEmpty(tree?.hats),
    hatIds,
  });

  return (
    <CouncilFormContext.Provider
      value={{
        form,
        isLoading: isLoading || isLoadingOrganization,
        persistForm: (step: string, subStep?: string) => persistForm({ step, subStep }),
        stepValidation,
        setStepValidation,
        deployCouncil,
        isDeploying,
        canEdit,
        availableTokens,
        tree,
        // deploy data
        hatIds,
        moduleAddresses,
        organization: organization || undefined,
        hatsToCreate,
        mchArgs: { ...mchArgs, ...moduleArgs },
        // deploy handlers
        deployStatus, // status of the deploy
        deployHats,
        deployModules,
        deployHsg,
        deployModulesWithMch,
        deployOnSuccess: onSuccess,
        // calldata
        deployCouncilCalldata: multicallCalldata,
        deployHatsCalldata: find(calls, { target: HATS_V1 })?.callData,
        deployModulesCalldata: find(calls, { target: HATS_MODULES_FACTORY_ADDRESS })?.callData,
        deployHsgCalldata: find(calls, { target: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS })?.callData,
        deployMchCalldata: mchCallData,
        // TODO what's up with this type?
        // simulation results
        simulateCouncil: simulateCouncil as SimulateContractReturnType | undefined,
        simulateHats: simulateHats as SimulateContractReturnType | undefined,
        simulateModules: simulateModules as SimulateContractReturnType | undefined,
        simulateMch: simulateMch as SimulateContractReturnType | undefined,
        simulateHsg: simulateHsg as SimulateContractReturnType | undefined,
        councilsData: councilsData,
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
