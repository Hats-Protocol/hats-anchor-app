import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { Variables } from 'graphql-request';
import { concat, map, pick } from 'lodash';
import { CouncilFormData, CouncilMember } from 'types';
import {
  CREATE_USER,
  getCouncilsGraphqlClient,
  logger,
  UPDATE_COUNCIL_ADMINS,
  UPDATE_COUNCIL_AGREEMENT_ADMINS,
  UPDATE_COUNCIL_COMPLIANCE_ADMINS,
  UPDATE_COUNCIL_MEMBERS,
  UPDATE_USER,
} from 'utils';

const UPDATE_USER_MUTATIONS = {
  member: UPDATE_COUNCIL_MEMBERS,
  admin: UPDATE_COUNCIL_ADMINS,
  complianceAdmin: UPDATE_COUNCIL_COMPLIANCE_ADMINS,
  // allowlistAdmin: UPDATE_COUNCIL_ALLOWLIST_ADMINS, // TODO handle other allowlist (?)
  agreementAdmin: UPDATE_COUNCIL_AGREEMENT_ADMINS,
};

export function useCreateOrUpdateUser({
  councilId,
  editingId,
  memberType = 'member',
  existingUsers,
  onAddSuccess,
  onEditSuccess,
  onError,
}: {
  councilId: string | undefined;
  editingId: string | undefined;
  memberType: 'member' | 'admin' | 'complianceAdmin' | 'agreementAdmin'; // 'allowlistAdmin'; // TODO consolidate type with add-user-modal.tsx
  existingUsers: CouncilMember[];
  onAddSuccess: (data: CouncilMember) => void;
  onEditSuccess: (data: CouncilMember) => void;
  onError: () => void;
}) {
  const { getAccessToken } = usePrivy();
  const { mutateAsync: createUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables as unknown as Variables);
      logger.debug('created user', result);
      return result.createUser;
    },
    onSuccess: async (data) => {
      // TODO is there a better way to attach the user to the council?
      if (!councilId) {
        logger.error('No councilId provided');
        return;
      }
      const mutation = UPDATE_USER_MUTATIONS[memberType]; // TODO check if supported member type
      if (!mutation) {
        logger.error('No mutation found for member type', memberType);
        return;
      }
      const onlyValuesExistingUsers = map(existingUsers, (u) =>
        pick(u, ['id', 'address', 'email', 'name', 'telegram']),
      );
      // TODO make sure the users are unique here
      const accessToken = await getAccessToken();
      return getCouncilsGraphqlClient(accessToken ?? undefined)
        .request<{
          updateCouncilCreationForm: CouncilFormData;
        }>(mutation, {
          id: councilId,
          [`${memberType}s`]: concat(onlyValuesExistingUsers || [], [data]),
        } as unknown as Variables)
        .then((result) => {
          logger.debug('updated council creation form', result);
          return result;
        })
        .catch((err) => {
          logger.error('Error updating council creation form', err);
          return err;
        });
      // TODO catch error here
    },
  });

  const { mutateAsync: updateUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables as unknown as Variables);
      return result.updateUser;
    },
  });

  const createOrUpdateUser = async (data: CouncilMember) => {
    logger.debug('createOrUpdateUser', data);
    try {
      if (editingId) {
        const userData = await updateUserMutation({
          id: editingId,
          address: data.address,
          email: data.email,
          name: data.name,
        });
        // TODO need to check that the join record is in tact?
        onEditSuccess(userData);
        return userData;
      }

      const userData = await createUserMutation(data as CouncilMember);

      onAddSuccess(userData);
      return userData;
    } catch (error) {
      onError();
      // eslint-disable-next-line no-console
      console.error('Error saving user:', error);
      return undefined;
    }
  };

  return { createOrUpdateUser };
}
