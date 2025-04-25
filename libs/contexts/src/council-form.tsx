/* eslint-disable no-case-declarations */
'use client';

import { chainsList } from '@hatsprotocol/config';
import {
  defaultEligibilityRequirements,
  getChainTokens,
  initialDeployMultiStatus,
  initialDeployStatus,
  MULTICALL3_ADDRESS,
  TokenInfo,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { HATS_MODULES_FACTORY_ADDRESS } from '@hatsprotocol/modules-sdk';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { getAccessToken, usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTreeDetails } from 'hats-hooks';
import {
  fetchCouncilDetails,
  useCouncilDeploy,
  useCouncilDeployCalldata,
  useLocalStorage,
  useOrganization,
  useToast,
  useWaitForSubgraph,
} from 'hooks';
import { compact, find, first, isEmpty, map, set, toNumber, values } from 'lodash';
import { getEligibilityRules } from 'modules-hooks';
import { useSearchParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import showdown from 'showdown';
import {
  CompletedOptionalSteps,
  CouncilData,
  CouncilFormData,
  CouncilFormResponse,
  CreationForm,
  DeployStatus,
  ExtendedHSGV2,
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
import { Hex } from 'viem';
import { UseSimulateContractReturnType } from 'wagmi';

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
  hatIds: { [key: string]: bigint };
  moduleAddresses: { [key: string]: string };
  // deploy handlers
  deployStatus: DeployStatus;
  deployHats: () => void;
  deployModules: () => void;
  deployHsg: () => void;
  // calldata
  deployCouncilCalldata: Hex | undefined;
  deployHatsCalldata: Hex | undefined;
  deployModulesCalldata: Hex | undefined;
  deployHsgCalldata: Hex | undefined;
  // TODO fix these types
  // simulation results
  simulateCouncil: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  simulateHats: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  simulateModules: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  simulateHsg: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  councilsData: CouncilData[] | undefined;
}

const chainOptions = map(values(chainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

const converter = new showdown.Converter();

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(undefined);

// type StepValidationData = CouncilFormResponse['councilCreationForm'] & {
//   completedOptionalSteps: CompletedOptionalSteps;
//   deployOnly?: boolean;
// };

const notDeploy = (deployOnly: boolean | undefined, value: boolean) => {
  if (deployOnly === true) return true;
  return value;
};

const computeStepValidation = (data: CouncilFormData): StepValidation => {
  return {
    details: !!(
      data.organizationName &&
      data.organizationName !== '' &&
      data.councilName &&
      data.councilName !== '' &&
      data.chain !== null
    ),
    threshold: !!(data.maxMembers && data.maxMembers > 0 && data.thresholdType && data.target && data.target > 0), // TODO handle optional
    selection: !!data.membershipType,
    eligibility: false, // Main step validity will be computed from sub-steps
    eligibilitySubSteps: {
      management: !!(data.admins && data.admins.length > 0) && data.eligibilityRequirements?.selection.adminsSet, // admins are required, but creator is added by default
      compliance:
        !!data.complianceAdmins &&
        data.complianceAdmins.length > 0 &&
        data.eligibilityRequirements?.compliance.adminsSet,
      agreement:
        !!data.agreementAdmins &&
        data.agreementAdmins.length > 0 &&
        data.eligibilityRequirements?.agreement.set &&
        data.eligibilityRequirements?.agreement.adminsSet, // `agreement.content` is optional
      tokens:
        !!data.eligibilityRequirements?.erc20?.required &&
        !!data.eligibilityRequirements?.erc20?.address &&
        !!data.eligibilityRequirements?.erc20?.amount &&
        data.eligibilityRequirements?.erc20?.set,
      members: !!data.members && data.members.length > 0 && data.eligibilityRequirements?.selection.set,
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
  const [optionalSteps, setOptionalSteps] = useLocalStorage<CompletedOptionalSteps>(`${draftId}-optionalSteps`, {
    threshold: false,
    members: false,
    management: false,
    agreement: false,
    compliance: false,
  });

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
      members: [],
      admins: [],
      complianceAdmins: [],
      agreementAdmins: [],
      payer: undefined,
      // form state
      acceptedTerms: false,
      completedOptionalSteps: optionalSteps,
    },
  });
  const chainId = toNumber(form.watch('chain').value) || 10;
  const waitForSubgraph = useWaitForSubgraph({ chainId });
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
  const { data: rawOrganization } = useOrganization(orgName);

  // similar process to get the onchain data that we'd need in all of the reusable elibility modules

  const getOnchainCouncilsData = async ({ organization }: { organization: Organization }) => {
    logger.info('getOnchainCouncilsData', organization);
    const hsgAddresses = compact(map(organization?.councils, 'hsg')); // this would only return existing hsg values
    logger.info('hsgAddresses', hsgAddresses);
    const onchainCouncilsData = await Promise.all(
      map(hsgAddresses, (hsgAddress) => fetchCouncilDetails({ chainId, address: hsgAddress })),
    ).catch((error) => {
      logger.error('Error fetching onchain councils data:', error);
      return [];
    }); // move this from the hooks to elsewhere

    // integrate the rawOrganizations council data here
    const fullCouncilData = map(organization?.councils, (council) => {
      const onchainCouncilData = find(onchainCouncilsData, { id: council.hsg.toLowerCase() });

      return {
        ...council,
        ...(onchainCouncilData as ExtendedHSGV2),
        id: council.id,
      };
    });
    logger.info('fullCouncilData', fullCouncilData);

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

    logger.info('councilsEligibilityRules', councilsEligibilityRules);

    const fullCouncilDataWithEligibilityRules = map(organization?.councils, (council, index) => {
      // const onchainCouncilData = find(councilsEligibilityRules, { id: council.hsg.toLowerCase() });
      const onchainEligibilityRulesData = councilsEligibilityRules[index];

      return {
        ...council,
        eligibilityRules: onchainEligibilityRulesData,
      };
    });

    logger.info('fullCouncilDataWithEligibilityRules', fullCouncilDataWithEligibilityRules);
    return fullCouncilDataWithEligibilityRules;
  };

  const { data: councilsData } = useQuery({
    queryKey: ['councilsData', rawOrganization],
    queryFn: () => getOnchainCouncilsData({ organization: rawOrganization as Organization }),
    enabled: !!rawOrganization,
  });

  // do this for EVERY council on the org to be able to have all the data we'd need for the eligilbity modules reuse
  // async useQuery. hsg -> work back to the hatId -> module(s) -> map these modules to the ones that we need
  // hsg is on the council
  // fetchCouncilDetails with the chain and the hsg address for the council

  // for each council:
  // for the first signerHat pass in the eligibility address and the chainId to the getEligibilityRules

  // for each council (in context now) we'd have the full offchain data and all of the eligibility rules

  // we would then have these to use as our values in the radio selects and also if they exist we'd pass the id to the deploy step. with each council we should have EACH eligibility for the existing agreement. module address is the key
  // when we select, we're passing this value back to the form -> agreement.existingId
  // passing to the save to save in the db via persistForm -> used in the deploy step

  // agreement.existingAdmins = org-managers OR an existing hatId

  // final organization object will have the offchain and onchain data

  // handle other treeIds or chainIds across an organization. this is assuming that we're working within a single council (the first council)
  const treeId = rawOrganization?.councils?.[0]?.treeId;
  const { data: tree } = useTreeDetails({ treeId: toNumber(treeId), chainId });

  const setStepValidation = useCallback(
    (step: keyof StepValidation, subSteps: boolean | Partial<StepValidation['eligibilitySubSteps']>) => {
      logger.debug('Setting step validation:', { step, subSteps });
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
  const { isLoading, data } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      const councilsGraphqlClient = getCouncilsGraphqlClient(accessToken ?? undefined);
      return councilsGraphqlClient
        .request<CouncilFormResponse>(GET_COUNCIL_FORM, { id: draftId })
        .then((result) => {
          logger.debug('result', result);
          // const councilCreationFormParsed = {
          //   ...result.councilCreationForm,
          //   maxMembers: result.councilCreationForm.maxCouncilMembers,
          //   target: result.councilCreationForm.thresholdTarget,
          //   min: result.councilCreationForm.thresholdMin,
          //   membershipType: result.councilCreationForm.membersSelectionType,
          //   eligibilityRequirements: JSON.parse(result.councilCreationForm.eligibilityRequirements),
          //   completedOptionalSteps: optionalSteps,
          // };
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

  // compute the step validation state
  useEffect(() => {
    if (!data || !optionalSteps || !chainId) return;

    const availableTokensEffect = getChainTokens(chainId as number);
    const mappedTokens = map(availableTokensEffect, ({ address, name, symbol }) => ({
      value: address,
      label: `${name} (${symbol})`,
    }));

    logger.debug('API Response data:', data);
    const currentValues = form.getValues();
    logger.info('Current form values:', currentValues);

    const chain = find(values(chainOptions), { value: data.chain?.toString() }) || first(values(chainOptions));
    if (!chain) throw new Error('Chain not found');

    // Set agreement admins based on role
    // const agreementAdmins = data.createAgreementAdminRole ? data.agreementAdmins || [] : data.admins || [];
    const agreementAdmins = (data.agreementAdmins || []) ?? (data.admins || []);

    const newValues: CouncilFormData = {
      organizationName: data.organizationName
        ? {
            value: data.organizationName,
            label: data.organizationName,
          }
        : '',
      councilName: data.councilName || '',
      chain,
      councilDescription: data.councilDescription || '',
      thresholdType: data.thresholdType || 'ABSOLUTE',
      target: data.thresholdTarget || 51,
      min: data.thresholdMin || 2,
      maxMembers: data.maxCouncilMembers || 7,
      membershipType: data.membersSelectionType === 'ELECTION' ? 'ELECTED' : 'APPOINTED',
      members: data.members || [],
      admins: data.admins || [],
      complianceAdmins: data.complianceAdmins || [],
      eligibilityRequirements: data.eligibilityRequirements
        ? JSON.parse(data.eligibilityRequirements)
        : defaultEligibilityRequirements,
      agreementAdmins,
      payer: data.payer || undefined,
      acceptedTerms: false,
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

    // const deployOnly = localStorage.getItem(`deployOnly-${draftId}`);

    // Compute validation state here
    const validation = computeStepValidation(newValues);

    setStepValidationState(validation);
  }, [data, form, optionalSteps]);

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
      let payload: Partial<CouncilFormData> = { id: draftId || undefined };

      // Cache current form state to prevent flashing
      const currentFormState = { ...formData };

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
          toggleOptionalStep('threshold');
          payload = {
            ...payload,
            thresholdType: formData.thresholdType,
            maxMembers: parseInt(formData.maxMembers.toString()),
            target: parseInt(formData.target.toString()),
            min: parseInt(formData.min.toString()),
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
                required: true, // default to true also
              },
            },
          };
          break;

        case 'eligibility':
          switch (subStep) {
            case 'members':
              // TODO: remove toggleOptionalStep and leverage `set` and `adminsSet`
              toggleOptionalStep('members');
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
              toggleOptionalStep('management');
              payload = {
                ...payload,
                admins: formData.admins, // admins handled as a relationship
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
              toggleOptionalStep('compliance');
              payload = {
                ...payload,
                complianceAdmins: formData.complianceAdmins, // admins handled as a relationship
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
              toggleOptionalStep('agreement');
              const agreementContent = currentEligibilityRequirements.agreement?.content;
              // need to convert html to markdown before pinning
              const agreementMarkdown = converter.makeMarkdown(agreementContent || '');

              // Always send the current agreementAdmins list
              payload = {
                ...payload,
                agreementAdmins: formData.agreementAdmins, // admins handled as a relationship
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
          break;
      }

      logger.debug('payload', payload);
      const accessToken = await getAccessToken();
      const councilsGraphqlClient = getCouncilsGraphqlClient(accessToken ?? undefined);

      // Ensure form state is preserved during the request
      form.reset(currentFormState);

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
        eligibilityRequirements: JSON.stringify(payload.eligibilityRequirements),
      };

      // return await councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, newPayload as Partial<CreationForm>);
      // the payload we are sending has the formatting we need
      return await councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, newPayload as Partial<CreationForm>);
    },
    onSuccess: (data: UpdateCouncilFormResponse, variables) => {
      // update query cache while preserving form state
      queryClient.setQueryData(['councilForm', draftId], (oldData: any) => ({
        ...oldData,
        ...data.updateCouncilCreationForm,
      }));
    },
    onError: (error: Error) => {
      logger.error('onError', error);
      toast({ title: 'Failed to update council form', variant: 'destructive' });
    },
  });

  const { calls, hatsProtocolCallData, moduleArgs, hsgArgs, hatIds, moduleAddresses } = useCouncilDeployCalldata({
    formData: form.watch(),
    tree,
  });
  // console.log('calls', calls, hatsProtocolCallData, transferTopHatCallData, modulesCalldata, hsgV2Calldata);

  const {
    deploy: deployCouncil,
    simulateCouncil,
    isLoading: isDeploying,
    deployHats,
    deployModules,
    deployHsg,
    simulateHats,
    simulateModules,
    simulateHsg,
  } = useCouncilDeploy({
    formData: form.getValues(),
    calls,
    hatsProtocolCallData,
    moduleArgs,
    hsgArgs,
    chainId: toNumber(form.getValues().chain?.value),
    draftId,
    moduleAddresses: undefined,
    handlePendingTx,
    waitForSubgraph,
    setDeployStatus,
    firstCouncil: !tree || isEmpty(tree?.hats),
    hatIds,
  });
  logger.info('councilsData in context', councilsData);

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
        hatIds,
        moduleAddresses,
        // deploy handlers
        deployStatus, // status of the deploy
        deployHats,
        deployModules,
        deployHsg,
        // calldata
        deployCouncilCalldata: find(calls, { target: MULTICALL3_ADDRESS })?.callData,
        deployHatsCalldata: find(calls, { target: HATS_V1 })?.callData,
        deployModulesCalldata: find(calls, { target: HATS_MODULES_FACTORY_ADDRESS })?.callData,
        deployHsgCalldata: find(calls, { target: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS })?.callData,
        // TODO what's up with this type?
        // simulation results
        simulateCouncil: simulateCouncil as UseSimulateContractReturnType<any, any, any, any, any, any> | undefined,
        simulateHats: simulateHats as UseSimulateContractReturnType<any, any, any, any, any, any> | undefined,
        simulateModules: simulateModules as UseSimulateContractReturnType<any, any, any, any, any, any> | undefined,
        simulateHsg: simulateHsg as UseSimulateContractReturnType<any, any, any, any, any, any> | undefined,
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
