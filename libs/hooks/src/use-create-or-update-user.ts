import { useMutation } from '@tanstack/react-query';
import { Variables } from 'graphql-request';
import { concat } from 'lodash';
import { CouncilFormData, CouncilMember } from 'types';
import {
  councilsGraphqlClient,
  CREATE_USER,
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
  agreementAdmin: UPDATE_COUNCIL_AGREEMENT_ADMINS,
};

export function useCreateOrUpdateUser({
  councilId,
  editingId,
  memberType,
  existingUsers,
  onAddSuccess,
  onEditSuccess,
  onError,
}: {
  councilId: string | undefined;
  editingId: string | undefined;
  memberType: 'member' | 'admin' | 'complianceAdmin' | 'agreementAdmin';
  existingUsers: CouncilMember[];
  onAddSuccess: (data: CouncilMember) => void;
  onEditSuccess: (data: CouncilMember) => void;
  onError: () => void;
}) {
  const { mutateAsync: createUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables as unknown as Variables);
      return result.createUser;
    },
    onSuccess: async (data) => {
      // TODO is there a better way to attach the user to the council?
      if (!councilId) {
        console.error('No councilId provided');
        return;
      }
      console.log('create success', data);
      const mutation = UPDATE_USER_MUTATIONS[memberType]; // TODO check if supported member type
      console.log('mutation', councilId, existingUsers);
      // TODO make sure the users are unique here
      await councilsGraphqlClient.request<{
        updateCouncilCreationForm: CouncilFormData;
      }>(mutation, {
        id: councilId,
        [`${memberType}s`]: concat(existingUsers || [], [data]),
      } as unknown as Variables);
      // TODO catch error here

      return data;
    },
  });

  const { mutateAsync: updateUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const result = await councilsGraphqlClient.request<{
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
